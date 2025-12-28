// Spatial domain image processing

import { convolve2D, separableConvolve, createGaussianKernel, createGaussianKernel1D } from '../utils/convolution';

export function gaussianBlur(imageData: ImageData, sigma: number = 1.5): ImageData {
  const size = Math.ceil(sigma * 6) | 1; // Ensure odd size
  const kernel = createGaussianKernel1D(size, sigma);
  return separableConvolve(imageData, kernel, kernel);
}

export function medianFilter(imageData: ImageData, size: number = 3): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  const halfSize = Math.floor(size / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rValues: number[] = [];
      const gValues: number[] = [];
      const bValues: number[] = [];
      
      for (let dy = -halfSize; dy <= halfSize; dy++) {
        for (let dx = -halfSize; dx <= halfSize; dx++) {
          const py = Math.min(Math.max(y + dy, 0), height - 1);
          const px = Math.min(Math.max(x + dx, 0), width - 1);
          const idx = (py * width + px) * 4;
          
          rValues.push(data[idx]);
          gValues.push(data[idx + 1]);
          bValues.push(data[idx + 2]);
        }
      }
      
      rValues.sort((a, b) => a - b);
      gValues.sort((a, b) => a - b);
      bValues.sort((a, b) => a - b);
      
      const medianIdx = Math.floor(rValues.length / 2);
      const idx = (y * width + x) * 4;
      
      output.data[idx] = rValues[medianIdx];
      output.data[idx + 1] = gValues[medianIdx];
      output.data[idx + 2] = bValues[medianIdx];
      output.data[idx + 3] = data[idx + 3];
    }
  }
  
  return output;
}

export function bilateralFilter(
  imageData: ImageData,
  sigmaSpace: number = 5,
  sigmaColor: number = 50
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  const windowSize = Math.ceil(sigmaSpace * 2) | 1;
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const centerR = data[idx];
      const centerG = data[idx + 1];
      const centerB = data[idx + 2];
      
      let sumR = 0, sumG = 0, sumB = 0;
      let sumWeight = 0;
      
      for (let dy = -halfWindow; dy <= halfWindow; dy++) {
        for (let dx = -halfWindow; dx <= halfWindow; dx++) {
          const py = Math.min(Math.max(y + dy, 0), height - 1);
          const px = Math.min(Math.max(x + dx, 0), width - 1);
          const pidx = (py * width + px) * 4;
          
          // Spatial weight
          const spatialDist = dx * dx + dy * dy;
          const spatialWeight = Math.exp(-spatialDist / (2 * sigmaSpace * sigmaSpace));
          
          // Color weight
          const colorR = data[pidx] - centerR;
          const colorG = data[pidx + 1] - centerG;
          const colorB = data[pidx + 2] - centerB;
          const colorDist = colorR * colorR + colorG * colorG + colorB * colorB;
          const colorWeight = Math.exp(-colorDist / (2 * sigmaColor * sigmaColor));
          
          const weight = spatialWeight * colorWeight;
          
          sumR += data[pidx] * weight;
          sumG += data[pidx + 1] * weight;
          sumB += data[pidx + 2] * weight;
          sumWeight += weight;
        }
      }
      
      output.data[idx] = sumR / sumWeight;
      output.data[idx + 1] = sumG / sumWeight;
      output.data[idx + 2] = sumB / sumWeight;
      output.data[idx + 3] = data[idx + 3];
    }
  }
  
  return output;
}

export function sobelGradient(imageData: ImageData): ImageData {
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
  
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gxR = 0, gxG = 0, gxB = 0;
      let gyR = 0, gyG = 0, gyB = 0;
      
      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const py = y + ky - 1;
          const px = x + kx - 1;
          const idx = (py * width + px) * 4;
          
          gxR += data[idx] * sobelX[ky][kx];
          gxG += data[idx + 1] * sobelX[ky][kx];
          gxB += data[idx + 2] * sobelX[ky][kx];
          
          gyR += data[idx] * sobelY[ky][kx];
          gyG += data[idx + 1] * sobelY[ky][kx];
          gyB += data[idx + 2] * sobelY[ky][kx];
        }
      }
      
      const magnitudeR = Math.sqrt(gxR * gxR + gyR * gyR);
      const magnitudeG = Math.sqrt(gxG * gxG + gyG * gyG);
      const magnitudeB = Math.sqrt(gxB * gxB + gyB * gyB);
      
      const idx = (y * width + x) * 4;
      output.data[idx] = Math.min(255, magnitudeR);
      output.data[idx + 1] = Math.min(255, magnitudeG);
      output.data[idx + 2] = Math.min(255, magnitudeB);
      output.data[idx + 3] = 255;
    }
  }
  
  return output;
}

export function laplacianOfGaussian(imageData: ImageData, sigma: number = 1.5): ImageData {
  const size = Math.ceil(sigma * 6) | 1;
  const center = Math.floor(size / 2);
  const kernel: number[][] = [];
  
  let sum = 0;
  for (let y = 0; y < size; y++) {
    kernel[y] = [];
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const r2 = dx * dx + dy * dy;
      const sigma2 = sigma * sigma;
      
      const value = -(1 / (Math.PI * sigma2 * sigma2)) * 
                    (1 - r2 / (2 * sigma2)) * 
                    Math.exp(-r2 / (2 * sigma2));
      
      kernel[y][x] = value;
      sum += Math.abs(value);
    }
  }
  
  // Normalize
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      kernel[y][x] /= sum;
    }
  }
  
  return convolve2D(imageData, kernel);
}

export function differenceOfGaussians(
  imageData: ImageData,
  sigma1: number = 1.0,
  sigma2: number = 2.0
): ImageData {
  const blur1 = gaussianBlur(imageData, sigma1);
  const blur2 = gaussianBlur(imageData, sigma2);
  
  const width = imageData.width;
  const height = imageData.height;
  const output = new ImageData(width, height);
  
  for (let i = 0; i < width * height * 4; i += 4) {
    output.data[i] = Math.abs(blur1.data[i] - blur2.data[i]);
    output.data[i + 1] = Math.abs(blur1.data[i + 1] - blur2.data[i + 1]);
    output.data[i + 2] = Math.abs(blur1.data[i + 2] - blur2.data[i + 2]);
    output.data[i + 3] = 255;
  }
  
  return output;
}

export function sharpen(imageData: ImageData, amount: number = 1.0): ImageData {
  const kernel = [
    [0, -amount, 0],
    [-amount, 1 + 4 * amount, -amount],
    [0, -amount, 0]
  ];
  
  return convolve2D(imageData, kernel);
}

export function emboss(imageData: ImageData): ImageData {
  const kernel = [
    [-2, -1, 0],
    [-1, 1, 1],
    [0, 1, 2]
  ];
  
  return convolve2D(imageData, kernel);
}

export function edgeEnhancement(imageData: ImageData): ImageData {
  const kernel = [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0]
  ];
  
  return convolve2D(imageData, kernel);
}
