// Convolution utilities for image processing

export function convolve2D(
  imageData: ImageData,
  kernel: number[][],
  channel: number = -1 // -1 for all channels, 0=R, 1=G, 2=B
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  const kRows = kernel.length;
  const kCols = kernel[0].length;
  const kCenterY = Math.floor(kRows / 2);
  const kCenterX = Math.floor(kCols / 2);
  
  // Normalize kernel
  let kernelSum = 0;
  for (let i = 0; i < kRows; i++) {
    for (let j = 0; j < kCols; j++) {
      kernelSum += Math.abs(kernel[i][j]);
    }
  }
  if (kernelSum === 0) kernelSum = 1;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      if (channel === -1) {
        // Apply to all RGB channels
        let r = 0, g = 0, b = 0;
        
        for (let ky = 0; ky < kRows; ky++) {
          for (let kx = 0; kx < kCols; kx++) {
            const py = Math.min(Math.max(y + ky - kCenterY, 0), height - 1);
            const px = Math.min(Math.max(x + kx - kCenterX, 0), width - 1);
            const pidx = (py * width + px) * 4;
            const weight = kernel[ky][kx];
            
            r += data[pidx] * weight;
            g += data[pidx + 1] * weight;
            b += data[pidx + 2] * weight;
          }
        }
        
        output.data[idx] = Math.min(255, Math.max(0, r));
        output.data[idx + 1] = Math.min(255, Math.max(0, g));
        output.data[idx + 2] = Math.min(255, Math.max(0, b));
        output.data[idx + 3] = data[idx + 3]; // Alpha
      } else {
        // Apply to single channel
        let sum = 0;
        
        for (let ky = 0; ky < kRows; ky++) {
          for (let kx = 0; kx < kCols; kx++) {
            const py = Math.min(Math.max(y + ky - kCenterY, 0), height - 1);
            const px = Math.min(Math.max(x + kx - kCenterX, 0), width - 1);
            const pidx = (py * width + px) * 4;
            sum += data[pidx + channel] * kernel[ky][kx];
          }
        }
        
        output.data[idx] = data[idx];
        output.data[idx + 1] = data[idx + 1];
        output.data[idx + 2] = data[idx + 2];
        output.data[idx + channel] = Math.min(255, Math.max(0, sum));
        output.data[idx + 3] = data[idx + 3];
      }
    }
  }
  
  return output;
}

export function separableConvolve(
  imageData: ImageData,
  kernelX: number[],
  kernelY: number[]
): ImageData {
  // First pass: horizontal
  const temp = convolveHorizontal(imageData, kernelX);
  // Second pass: vertical
  return convolveVertical(temp, kernelY);
}

function convolveHorizontal(imageData: ImageData, kernel: number[]): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  const kSize = kernel.length;
  const kCenter = Math.floor(kSize / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;
      
      for (let k = 0; k < kSize; k++) {
        const px = Math.min(Math.max(x + k - kCenter, 0), width - 1);
        const pidx = (y * width + px) * 4;
        const weight = kernel[k];
        
        r += data[pidx] * weight;
        g += data[pidx + 1] * weight;
        b += data[pidx + 2] * weight;
      }
      
      output.data[idx] = Math.min(255, Math.max(0, r));
      output.data[idx + 1] = Math.min(255, Math.max(0, g));
      output.data[idx + 2] = Math.min(255, Math.max(0, b));
      output.data[idx + 3] = data[idx + 3];
    }
  }
  
  return output;
}

function convolveVertical(imageData: ImageData, kernel: number[]): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  const kSize = kernel.length;
  const kCenter = Math.floor(kSize / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;
      
      for (let k = 0; k < kSize; k++) {
        const py = Math.min(Math.max(y + k - kCenter, 0), height - 1);
        const pidx = (py * width + x) * 4;
        const weight = kernel[k];
        
        r += data[pidx] * weight;
        g += data[pidx + 1] * weight;
        b += data[pidx + 2] * weight;
      }
      
      output.data[idx] = Math.min(255, Math.max(0, r));
      output.data[idx + 1] = Math.min(255, Math.max(0, g));
      output.data[idx + 2] = Math.min(255, Math.max(0, b));
      output.data[idx + 3] = data[idx + 3];
    }
  }
  
  return output;
}

export function createGaussianKernel(size: number, sigma: number): number[][] {
  const kernel: number[][] = [];
  const center = Math.floor(size / 2);
  let sum = 0;
  
  for (let y = 0; y < size; y++) {
    kernel[y] = [];
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const value = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      kernel[y][x] = value;
      sum += value;
    }
  }
  
  // Normalize
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      kernel[y][x] /= sum;
    }
  }
  
  return kernel;
}

export function createGaussianKernel1D(size: number, sigma: number): number[] {
  const kernel: number[] = [];
  const center = Math.floor(size / 2);
  let sum = 0;
  
  for (let i = 0; i < size; i++) {
    const d = i - center;
    const value = Math.exp(-(d * d) / (2 * sigma * sigma));
    kernel[i] = value;
    sum += value;
  }
  
  // Normalize
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }
  
  return kernel;
}
