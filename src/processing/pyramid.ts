// Image pyramid and multi-scale processing

export function buildGaussianPyramid(
  imageData: ImageData,
  levels: number = 4
): ImageData[] {
  const pyramid: ImageData[] = [imageData];
  
  for (let i = 1; i < levels; i++) {
    const prev = pyramid[i - 1];
    const downsampled = downsample(prev);
    pyramid.push(downsampled);
  }
  
  return pyramid;
}

export function buildLaplacianPyramid(
  imageData: ImageData,
  levels: number = 4
): ImageData[] {
  const gaussianPyramid = buildGaussianPyramid(imageData, levels);
  const laplacianPyramid: ImageData[] = [];
  
  for (let i = 0; i < levels - 1; i++) {
    const current = gaussianPyramid[i];
    const next = gaussianPyramid[i + 1];
    const upsampled = upsample(next, current.width, current.height);
    
    const laplacian = subtract(current, upsampled);
    laplacianPyramid.push(laplacian);
  }
  
  laplacianPyramid.push(gaussianPyramid[levels - 1]);
  
  return laplacianPyramid;
}

export function reconstructFromLaplacian(pyramid: ImageData[]): ImageData {
  let result = pyramid[pyramid.length - 1];
  
  for (let i = pyramid.length - 2; i >= 0; i--) {
    const upsampled = upsample(result, pyramid[i].width, pyramid[i].height);
    result = add(pyramid[i], upsampled);
  }
  
  return result;
}

function downsample(imageData: ImageData): ImageData {
  const width = Math.floor(imageData.width / 2);
  const height = Math.floor(imageData.height / 2);
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  // Gaussian blur before downsampling
  const blurred = gaussianBlur(imageData);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcX = x * 2;
      const srcY = y * 2;
      const srcIdx = (srcY * imageData.width + srcX) * 4;
      const dstIdx = (y * width + x) * 4;
      
      output.data[dstIdx] = blurred.data[srcIdx];
      output.data[dstIdx + 1] = blurred.data[srcIdx + 1];
      output.data[dstIdx + 2] = blurred.data[srcIdx + 2];
      output.data[dstIdx + 3] = blurred.data[srcIdx + 3];
    }
  }
  
  return output;
}

function upsample(imageData: ImageData, targetWidth: number, targetHeight: number): ImageData {
  const output = new ImageData(targetWidth, targetHeight);
  const scaleX = imageData.width / targetWidth;
  const scaleY = imageData.height / targetHeight;
  
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = Math.floor(x * scaleX);
      const srcY = Math.floor(y * scaleY);
      const srcIdx = (srcY * imageData.width + srcX) * 4;
      const dstIdx = (y * targetWidth + x) * 4;
      
      output.data[dstIdx] = imageData.data[srcIdx];
      output.data[dstIdx + 1] = imageData.data[srcIdx + 1];
      output.data[dstIdx + 2] = imageData.data[srcIdx + 2];
      output.data[dstIdx + 3] = imageData.data[srcIdx + 3];
    }
  }
  
  return output;
}

function subtract(img1: ImageData, img2: ImageData): ImageData {
  const output = new ImageData(img1.width, img1.height);
  
  for (let i = 0; i < img1.data.length; i += 4) {
    output.data[i] = Math.max(0, Math.min(255, img1.data[i] - img2.data[i] + 128));
    output.data[i + 1] = Math.max(0, Math.min(255, img1.data[i + 1] - img2.data[i + 1] + 128));
    output.data[i + 2] = Math.max(0, Math.min(255, img1.data[i + 2] - img2.data[i + 2] + 128));
    output.data[i + 3] = img1.data[i + 3];
  }
  
  return output;
}

function add(img1: ImageData, img2: ImageData): ImageData {
  const output = new ImageData(img1.width, img1.height);
  
  for (let i = 0; i < img1.data.length; i += 4) {
    output.data[i] = Math.max(0, Math.min(255, img1.data[i] + img2.data[i] - 128));
    output.data[i + 1] = Math.max(0, Math.min(255, img1.data[i + 1] + img2.data[i + 1] - 128));
    output.data[i + 2] = Math.max(0, Math.min(255, img1.data[i + 2] + img2.data[i + 2] - 128));
    output.data[i + 3] = img1.data[i + 3];
  }
  
  return output;
}

function gaussianBlur(imageData: ImageData): ImageData {
  const kernel = [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1]
  ];
  
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  const kernelSum = 16;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0;
      
      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const py = y + ky - 1;
          const px = x + kx - 1;
          const idx = (py * width + px) * 4;
          const weight = kernel[ky][kx];
          
          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
        }
      }
      
      const idx = (y * width + x) * 4;
      output.data[idx] = r / kernelSum;
      output.data[idx + 1] = g / kernelSum;
      output.data[idx + 2] = b / kernelSum;
      output.data[idx + 3] = data[idx + 3];
    }
  }
  
  return output;
}

export function scaleImage(
  imageData: ImageData,
  scale: number,
  interpolation: 'nearest' | 'bilinear' = 'bilinear'
): ImageData {
  const newWidth = Math.floor(imageData.width * scale);
  const newHeight = Math.floor(imageData.height * scale);
  const output = new ImageData(newWidth, newHeight);
  
  if (interpolation === 'nearest') {
    return nearestNeighborInterpolation(imageData, newWidth, newHeight);
  } else {
    return bilinearInterpolation(imageData, newWidth, newHeight);
  }
}

function nearestNeighborInterpolation(
  imageData: ImageData,
  newWidth: number,
  newHeight: number
): ImageData {
  const output = new ImageData(newWidth, newHeight);
  const scaleX = imageData.width / newWidth;
  const scaleY = imageData.height / newHeight;
  
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const srcX = Math.floor(x * scaleX);
      const srcY = Math.floor(y * scaleY);
      const srcIdx = (srcY * imageData.width + srcX) * 4;
      const dstIdx = (y * newWidth + x) * 4;
      
      output.data[dstIdx] = imageData.data[srcIdx];
      output.data[dstIdx + 1] = imageData.data[srcIdx + 1];
      output.data[dstIdx + 2] = imageData.data[srcIdx + 2];
      output.data[dstIdx + 3] = imageData.data[srcIdx + 3];
    }
  }
  
  return output;
}

function bilinearInterpolation(
  imageData: ImageData,
  newWidth: number,
  newHeight: number
): ImageData {
  const output = new ImageData(newWidth, newHeight);
  const scaleX = (imageData.width - 1) / newWidth;
  const scaleY = (imageData.height - 1) / newHeight;
  
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const srcX = x * scaleX;
      const srcY = y * scaleY;
      
      const x1 = Math.floor(srcX);
      const y1 = Math.floor(srcY);
      const x2 = Math.min(x1 + 1, imageData.width - 1);
      const y2 = Math.min(y1 + 1, imageData.height - 1);
      
      const dx = srcX - x1;
      const dy = srcY - y1;
      
      const idx11 = (y1 * imageData.width + x1) * 4;
      const idx12 = (y1 * imageData.width + x2) * 4;
      const idx21 = (y2 * imageData.width + x1) * 4;
      const idx22 = (y2 * imageData.width + x2) * 4;
      
      const dstIdx = (y * newWidth + x) * 4;
      
      for (let c = 0; c < 4; c++) {
        const val =
          imageData.data[idx11 + c] * (1 - dx) * (1 - dy) +
          imageData.data[idx12 + c] * dx * (1 - dy) +
          imageData.data[idx21 + c] * (1 - dx) * dy +
          imageData.data[idx22 + c] * dx * dy;
        
        output.data[dstIdx + c] = val;
      }
    }
  }
  
  return output;
}

export function rotateImage(imageData: ImageData, angle: number): ImageData {
  const angleRad = (angle * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  
  const width = imageData.width;
  const height = imageData.height;
  
  // Calculate new dimensions
  const newWidth = Math.ceil(Math.abs(width * cos) + Math.abs(height * sin));
  const newHeight = Math.ceil(Math.abs(width * sin) + Math.abs(height * cos));
  
  const output = new ImageData(newWidth, newHeight);
  const centerX = width / 2;
  const centerY = height / 2;
  const newCenterX = newWidth / 2;
  const newCenterY = newHeight / 2;
  
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const dx = x - newCenterX;
      const dy = y - newCenterY;
      
      const srcX = Math.floor(dx * cos + dy * sin + centerX);
      const srcY = Math.floor(-dx * sin + dy * cos + centerY);
      
      if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * newWidth + x) * 4;
        
        output.data[dstIdx] = imageData.data[srcIdx];
        output.data[dstIdx + 1] = imageData.data[srcIdx + 1];
        output.data[dstIdx + 2] = imageData.data[srcIdx + 2];
        output.data[dstIdx + 3] = 255;
      } else {
        const dstIdx = (y * newWidth + x) * 4;
        output.data[dstIdx + 3] = 0;
      }
    }
  }
  
  return output;
}
