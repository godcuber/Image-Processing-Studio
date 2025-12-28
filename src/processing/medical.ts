// Medical imaging processing

export function dicomWindowing(
  imageData: ImageData,
  windowCenter: number,
  windowWidth: number
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  const minValue = windowCenter - windowWidth / 2;
  const maxValue = windowCenter + windowWidth / 2;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    
    let value = 0;
    if (gray <= minValue) {
      value = 0;
    } else if (gray >= maxValue) {
      value = 255;
    } else {
      value = ((gray - minValue) / windowWidth) * 255;
    }
    
    output.data[i] = value;
    output.data[i + 1] = value;
    output.data[i + 2] = value;
    output.data[i + 3] = data[i + 3];
  }
  
  return output;
}

export function claheEnhancement(
  imageData: ImageData,
  clipLimit: number = 2.0,
  tileSize: number = 8
): ImageData {
  // Contrast Limited Adaptive Histogram Equalization
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  const tilesX = Math.ceil(width / tileSize);
  const tilesY = Math.ceil(height / tileSize);
  
  // Process each tile
  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const x0 = tx * tileSize;
      const y0 = ty * tileSize;
      const x1 = Math.min((tx + 1) * tileSize, width);
      const y1 = Math.min((ty + 1) * tileSize, height);
      
      // Calculate histogram for tile
      const hist = new Array(256).fill(0);
      let pixelCount = 0;
      
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * width + x) * 4;
          const gray = Math.round((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
          hist[gray]++;
          pixelCount++;
        }
      }
      
      // Clip histogram
      const clipValue = (clipLimit * pixelCount) / 256;
      let clipped = 0;
      
      for (let i = 0; i < 256; i++) {
        if (hist[i] > clipValue) {
          clipped += hist[i] - clipValue;
          hist[i] = clipValue;
        }
      }
      
      // Redistribute clipped pixels
      const redistribute = clipped / 256;
      for (let i = 0; i < 256; i++) {
        hist[i] += redistribute;
      }
      
      // Calculate CDF
      const cdf = new Array(256);
      cdf[0] = hist[0];
      for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + hist[i];
      }
      
      // Normalize CDF
      const cdfMin = cdf.find(v => v > 0) || 0;
      for (let i = 0; i < 256; i++) {
        cdf[i] = ((cdf[i] - cdfMin) / (pixelCount - cdfMin)) * 255;
      }
      
      // Apply equalization to tile
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * width + x) * 4;
          const gray = Math.round((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
          const newValue = cdf[gray];
          
          output.data[idx] = newValue;
          output.data[idx + 1] = newValue;
          output.data[idx + 2] = newValue;
          output.data[idx + 3] = data[idx + 3];
        }
      }
    }
  }
  
  return output;
}

export function histogramEqualization(imageData: ImageData): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  // Calculate histogram
  const hist = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    hist[gray]++;
  }
  
  // Calculate CDF
  const cdf = new Array(256);
  cdf[0] = hist[0];
  for (let i = 1; i < 256; i++) {
    cdf[i] = cdf[i - 1] + hist[i];
  }
  
  // Normalize
  const totalPixels = width * height;
  const cdfMin = cdf.find(v => v > 0) || 0;
  
  for (let i = 0; i < 256; i++) {
    cdf[i] = Math.round(((cdf[i] - cdfMin) / (totalPixels - cdfMin)) * 255);
  }
  
  // Apply equalization
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    const newValue = cdf[gray];
    
    output.data[i] = newValue;
    output.data[i + 1] = newValue;
    output.data[i + 2] = newValue;
    output.data[i + 3] = data[i + 3];
  }
  
  return output;
}

export function unsharpMasking(
  imageData: ImageData,
  amount: number = 1.5,
  radius: number = 1.0
): ImageData {
  // Create blurred version
  const blurred = gaussianBlur(imageData, radius);
  
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const original = data[i + c];
      const blur = blurred.data[i + c];
      const sharpened = original + amount * (original - blur);
      output.data[i + c] = Math.min(255, Math.max(0, sharpened));
    }
    output.data[i + 3] = data[i + 3];
  }
  
  return output;
}

function gaussianBlur(imageData: ImageData, sigma: number): ImageData {
  const kernel = createGaussianKernel(sigma);
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  const size = kernel.length;
  const halfSize = Math.floor(size / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      
      for (let ky = 0; ky < size; ky++) {
        for (let kx = 0; kx < size; kx++) {
          const py = Math.min(Math.max(y + ky - halfSize, 0), height - 1);
          const px = Math.min(Math.max(x + kx - halfSize, 0), width - 1);
          const idx = (py * width + px) * 4;
          const weight = kernel[ky][kx];
          
          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
        }
      }
      
      const idx = (y * width + x) * 4;
      output.data[idx] = r;
      output.data[idx + 1] = g;
      output.data[idx + 2] = b;
      output.data[idx + 3] = data[idx + 3];
    }
  }
  
  return output;
}

function createGaussianKernel(sigma: number): number[][] {
  const size = Math.ceil(sigma * 6) | 1;
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

export function morphologyOperation(
  imageData: ImageData,
  operation: 'erode' | 'dilate' | 'open' | 'close',
  kernelSize: number = 3
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const halfKernel = Math.floor(kernelSize / 2);
  
  if (operation === 'erode') {
    return erode(imageData, halfKernel);
  } else if (operation === 'dilate') {
    return dilate(imageData, halfKernel);
  } else if (operation === 'open') {
    return dilate(erode(imageData, halfKernel), halfKernel);
  } else {
    return erode(dilate(imageData, halfKernel), halfKernel);
  }
}

function erode(imageData: ImageData, halfKernel: number): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minVal = 255;
      
      for (let dy = -halfKernel; dy <= halfKernel; dy++) {
        for (let dx = -halfKernel; dx <= halfKernel; dx++) {
          const py = Math.min(Math.max(y + dy, 0), height - 1);
          const px = Math.min(Math.max(x + dx, 0), width - 1);
          const idx = (py * width + px) * 4;
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          minVal = Math.min(minVal, gray);
        }
      }
      
      const idx = (y * width + x) * 4;
      output.data[idx] = minVal;
      output.data[idx + 1] = minVal;
      output.data[idx + 2] = minVal;
      output.data[idx + 3] = data[idx + 3];
    }
  }
  
  return output;
}

function dilate(imageData: ImageData, halfKernel: number): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxVal = 0;
      
      for (let dy = -halfKernel; dy <= halfKernel; dy++) {
        for (let dx = -halfKernel; dx <= halfKernel; dx++) {
          const py = Math.min(Math.max(y + dy, 0), height - 1);
          const px = Math.min(Math.max(x + dx, 0), width - 1);
          const idx = (py * width + px) * 4;
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          maxVal = Math.max(maxVal, gray);
        }
      }
      
      const idx = (y * width + x) * 4;
      output.data[idx] = maxVal;
      output.data[idx + 1] = maxVal;
      output.data[idx + 2] = maxVal;
      output.data[idx + 3] = data[idx + 3];
    }
  }
  
  return output;
}
