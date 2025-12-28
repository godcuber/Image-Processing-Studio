// Feature detection and edge detection

import { gaussianBlur, sobelGradient } from './spatial';

export function cannyEdgeDetection(
  imageData: ImageData,
  lowThreshold: number = 50,
  highThreshold: number = 100,
  sigma: number = 1.4
): ImageData {
  // Step 1: Gaussian blur
  const blurred = gaussianBlur(imageData, sigma);
  
  // Step 2: Calculate gradients
  const { magnitude, direction } = computeGradients(blurred);
  
  // Step 3: Non-maximum suppression
  const suppressed = nonMaximumSuppression(magnitude, direction);
  
  // Step 4: Double threshold and edge tracking
  return hysteresisThreshold(suppressed, lowThreshold, highThreshold);
}

function computeGradients(imageData: ImageData): {
  magnitude: Float32Array;
  direction: Float32Array;
} {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  
  const magnitude = new Float32Array(width * height);
  const direction = new Float32Array(width * height);
  
  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ];
  
  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
  ];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      
      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const py = y + ky - 1;
          const px = x + kx - 1;
          const idx = (py * width + px) * 4;
          
          // Use grayscale
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          
          gx += gray * sobelX[ky][kx];
          gy += gray * sobelY[ky][kx];
        }
      }
      
      const idx = y * width + x;
      magnitude[idx] = Math.sqrt(gx * gx + gy * gy);
      direction[idx] = Math.atan2(gy, gx);
    }
  }
  
  return { magnitude, direction };
}

function nonMaximumSuppression(
  magnitude: Float32Array,
  direction: Float32Array
): Float32Array {
  const width = Math.sqrt(magnitude.length);
  const height = magnitude.length / width;
  const output = new Float32Array(magnitude.length);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const angle = direction[idx] * (180 / Math.PI);
      const mag = magnitude[idx];
      
      let neighbor1 = 0;
      let neighbor2 = 0;
      
      // Determine neighbors based on gradient direction
      if ((angle >= -22.5 && angle < 22.5) || (angle >= 157.5 || angle < -157.5)) {
        neighbor1 = magnitude[idx - 1];
        neighbor2 = magnitude[idx + 1];
      } else if ((angle >= 22.5 && angle < 67.5) || (angle >= -157.5 && angle < -112.5)) {
        neighbor1 = magnitude[idx - width - 1];
        neighbor2 = magnitude[idx + width + 1];
      } else if ((angle >= 67.5 && angle < 112.5) || (angle >= -112.5 && angle < -67.5)) {
        neighbor1 = magnitude[idx - width];
        neighbor2 = magnitude[idx + width];
      } else {
        neighbor1 = magnitude[idx - width + 1];
        neighbor2 = magnitude[idx + width - 1];
      }
      
      if (mag >= neighbor1 && mag >= neighbor2) {
        output[idx] = mag;
      } else {
        output[idx] = 0;
      }
    }
  }
  
  return output;
}

function hysteresisThreshold(
  magnitude: Float32Array,
  lowThreshold: number,
  highThreshold: number
): ImageData {
  const width = Math.sqrt(magnitude.length);
  const height = magnitude.length / width;
  const output = new ImageData(width, height);
  
  const edges = new Uint8Array(magnitude.length);
  
  // Find strong edges
  for (let i = 0; i < magnitude.length; i++) {
    if (magnitude[i] >= highThreshold) {
      edges[i] = 255;
    } else if (magnitude[i] >= lowThreshold) {
      edges[i] = 128; // Weak edge
    } else {
      edges[i] = 0;
    }
  }
  
  // Edge tracking by hysteresis
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      if (edges[idx] === 128) {
        // Check if connected to strong edge
        let hasStrongNeighbor = false;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nidx = (y + dy) * width + (x + dx);
            if (edges[nidx] === 255) {
              hasStrongNeighbor = true;
              break;
            }
          }
          if (hasStrongNeighbor) break;
        }
        
        edges[idx] = hasStrongNeighbor ? 255 : 0;
      }
    }
  }
  
  // Convert to ImageData
  for (let i = 0; i < magnitude.length; i++) {
    const value = edges[i];
    output.data[i * 4] = value;
    output.data[i * 4 + 1] = value;
    output.data[i * 4 + 2] = value;
    output.data[i * 4 + 3] = 255;
  }
  
  return output;
}

export function harrisCornerDetection(
  imageData: ImageData,
  threshold: number = 0.01,
  k: number = 0.04
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  
  // Compute image derivatives
  const Ix = new Float32Array(width * height);
  const Iy = new Float32Array(width * height);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      // Use central difference
      const idxL = y * width + (x - 1);
      const idxR = y * width + (x + 1);
      const idxU = (y - 1) * width + x;
      const idxD = (y + 1) * width + x;
      
      const grayL = (data[idxL * 4] + data[idxL * 4 + 1] + data[idxL * 4 + 2]) / 3;
      const grayR = (data[idxR * 4] + data[idxR * 4 + 1] + data[idxR * 4 + 2]) / 3;
      const grayU = (data[idxU * 4] + data[idxU * 4 + 1] + data[idxU * 4 + 2]) / 3;
      const grayD = (data[idxD * 4] + data[idxD * 4 + 1] + data[idxD * 4 + 2]) / 3;
      
      Ix[idx] = (grayR - grayL) / 2;
      Iy[idx] = (grayD - grayU) / 2;
    }
  }
  
  // Compute products of derivatives
  const Ixx = new Float32Array(width * height);
  const Iyy = new Float32Array(width * height);
  const Ixy = new Float32Array(width * height);
  
  for (let i = 0; i < width * height; i++) {
    Ixx[i] = Ix[i] * Ix[i];
    Iyy[i] = Iy[i] * Iy[i];
    Ixy[i] = Ix[i] * Iy[i];
  }
  
  // Compute Harris response
  const response = new Float32Array(width * height);
  const windowSize = 3;
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let y = halfWindow; y < height - halfWindow; y++) {
    for (let x = halfWindow; x < width - halfWindow; x++) {
      let sumXX = 0, sumYY = 0, sumXY = 0;
      
      for (let dy = -halfWindow; dy <= halfWindow; dy++) {
        for (let dx = -halfWindow; dx <= halfWindow; dx++) {
          const idx = (y + dy) * width + (x + dx);
          sumXX += Ixx[idx];
          sumYY += Iyy[idx];
          sumXY += Ixy[idx];
        }
      }
      
      const det = sumXX * sumYY - sumXY * sumXY;
      const trace = sumXX + sumYY;
      
      const idx = y * width + x;
      response[idx] = det - k * trace * trace;
    }
  }
  
  // Threshold and create output
  const output = new ImageData(width, height);
  const maxResponse = Math.max(...response);
  const thresholdValue = maxResponse * threshold;
  
  for (let i = 0; i < width * height; i++) {
    output.data[i * 4] = data[i * 4];
    output.data[i * 4 + 1] = data[i * 4 + 1];
    output.data[i * 4 + 2] = data[i * 4 + 2];
    output.data[i * 4 + 3] = 255;
    
    if (response[i] > thresholdValue) {
      output.data[i * 4] = 255;
      output.data[i * 4 + 1] = 0;
      output.data[i * 4 + 2] = 0;
    }
  }
  
  return output;
}

export function houghLineDetection(imageData: ImageData): ImageData {
  // Simplified Hough transform for line detection
  const width = imageData.width;
  const height = imageData.height;
  
  // Apply edge detection first
  const edges = cannyEdgeDetection(imageData, 50, 150);
  
  return edges; // Simplified version returns edge map
}
