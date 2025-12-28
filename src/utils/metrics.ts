// Image quality metrics

export function calculatePSNR(original: ImageData, processed: ImageData): number {
  if (original.width !== processed.width || original.height !== processed.height) {
    throw new Error('Images must have same dimensions');
  }
  
  const n = original.width * original.height;
  let mse = 0;
  
  for (let i = 0; i < n * 4; i += 4) {
    const r1 = original.data[i];
    const g1 = original.data[i + 1];
    const b1 = original.data[i + 2];
    
    const r2 = processed.data[i];
    const g2 = processed.data[i + 1];
    const b2 = processed.data[i + 2];
    
    mse += Math.pow(r1 - r2, 2);
    mse += Math.pow(g1 - g2, 2);
    mse += Math.pow(b1 - b2, 2);
  }
  
  mse /= (n * 3);
  
  if (mse === 0) return Infinity;
  
  const maxPixelValue = 255;
  return 10 * Math.log10((maxPixelValue * maxPixelValue) / mse);
}

export function calculateMSE(original: ImageData, processed: ImageData): number {
  if (original.width !== processed.width || original.height !== processed.height) {
    throw new Error('Images must have same dimensions');
  }
  
  const n = original.width * original.height;
  let mse = 0;
  
  for (let i = 0; i < n * 4; i += 4) {
    const r1 = original.data[i];
    const g1 = original.data[i + 1];
    const b1 = original.data[i + 2];
    
    const r2 = processed.data[i];
    const g2 = processed.data[i + 1];
    const b2 = processed.data[i + 2];
    
    mse += Math.pow(r1 - r2, 2);
    mse += Math.pow(g1 - g2, 2);
    mse += Math.pow(b1 - b2, 2);
  }
  
  return mse / (n * 3);
}

export function calculateSSIM(original: ImageData, processed: ImageData): number {
  // Simplified SSIM calculation
  // Full SSIM requires sliding window approach
  const c1 = (0.01 * 255) ** 2;
  const c2 = (0.03 * 255) ** 2;
  
  const { mean: mean1, variance: var1 } = calculateStatistics(original);
  const { mean: mean2, variance: var2 } = calculateStatistics(processed);
  const covariance = calculateCovariance(original, processed, mean1, mean2);
  
  const numerator = (2 * mean1 * mean2 + c1) * (2 * covariance + c2);
  const denominator = (mean1 * mean1 + mean2 * mean2 + c1) * (var1 + var2 + c2);
  
  return numerator / denominator;
}

function calculateStatistics(imageData: ImageData): { mean: number; variance: number } {
  const n = imageData.width * imageData.height;
  let sum = 0;
  
  for (let i = 0; i < n * 4; i += 4) {
    const gray = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    sum += gray;
  }
  
  const mean = sum / n;
  
  let varianceSum = 0;
  for (let i = 0; i < n * 4; i += 4) {
    const gray = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    varianceSum += Math.pow(gray - mean, 2);
  }
  
  const variance = varianceSum / n;
  
  return { mean, variance };
}

function calculateCovariance(img1: ImageData, img2: ImageData, mean1: number, mean2: number): number {
  const n = img1.width * img1.height;
  let sum = 0;
  
  for (let i = 0; i < n * 4; i += 4) {
    const gray1 = (img1.data[i] + img1.data[i + 1] + img1.data[i + 2]) / 3;
    const gray2 = (img2.data[i] + img2.data[i + 1] + img2.data[i + 2]) / 3;
    sum += (gray1 - mean1) * (gray2 - mean2);
  }
  
  return sum / n;
}

export function calculateHistogram(imageData: ImageData): {
  r: number[];
  g: number[];
  b: number[];
  gray: number[];
} {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  const gray = new Array(256).fill(0);
  
  const n = imageData.width * imageData.height;
  
  for (let i = 0; i < n * 4; i += 4) {
    r[imageData.data[i]]++;
    g[imageData.data[i + 1]]++;
    b[imageData.data[i + 2]]++;
    
    const grayValue = Math.round(
      (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3
    );
    gray[grayValue]++;
  }
  
  return { r, g, b, gray };
}

export function calculateEntropy(imageData: ImageData): number {
  const histogram = calculateHistogram(imageData).gray;
  const total = imageData.width * imageData.height;
  
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (histogram[i] > 0) {
      const probability = histogram[i] / total;
      entropy -= probability * Math.log2(probability);
    }
  }
  
  return entropy;
}
