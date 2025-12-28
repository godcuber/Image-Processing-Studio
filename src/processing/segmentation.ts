// Image segmentation algorithms

export function thresholdSegmentation(
  imageData: ImageData,
  threshold: number = 128
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const value = gray >= threshold ? 255 : 0;
    
    output.data[i] = value;
    output.data[i + 1] = value;
    output.data[i + 2] = value;
    output.data[i + 3] = data[i + 3];
  }
  
  return output;
}

export function otsuThreshold(imageData: ImageData): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  
  // Calculate histogram
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    histogram[gray]++;
  }
  
  const total = width * height;
  
  // Find optimal threshold using Otsu's method
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }
  
  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 0;
  
  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    
    wF = total - wB;
    if (wF === 0) break;
    
    sumB += t * histogram[t];
    
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    
    const variance = wB * wF * (mB - mF) * (mB - mF);
    
    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = t;
    }
  }
  
  return thresholdSegmentation(imageData, threshold);
}

export function adaptiveThreshold(
  imageData: ImageData,
  blockSize: number = 11,
  c: number = 2
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  const halfBlock = Math.floor(blockSize / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      
      for (let dy = -halfBlock; dy <= halfBlock; dy++) {
        for (let dx = -halfBlock; dx <= halfBlock; dx++) {
          const py = Math.min(Math.max(y + dy, 0), height - 1);
          const px = Math.min(Math.max(x + dx, 0), width - 1);
          const idx = (py * width + px) * 4;
          
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          sum += gray;
          count++;
        }
      }
      
      const threshold = sum / count - c;
      const idx = (y * width + x) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const value = gray >= threshold ? 255 : 0;
      
      output.data[idx] = value;
      output.data[idx + 1] = value;
      output.data[idx + 2] = value;
      output.data[idx + 3] = data[idx + 3];
    }
  }
  
  return output;
}

export function kMeansSegmentation(
  imageData: ImageData,
  k: number = 3,
  maxIterations: number = 10
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  // Initialize centroids randomly
  const centroids: number[][] = [];
  for (let i = 0; i < k; i++) {
    const idx = Math.floor(Math.random() * (width * height)) * 4;
    centroids.push([data[idx], data[idx + 1], data[idx + 2]]);
  }
  
  const labels = new Array(width * height);
  
  // K-means iterations
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign pixels to nearest centroid
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      let minDist = Infinity;
      let minLabel = 0;
      
      for (let j = 0; j < k; j++) {
        const dist = Math.sqrt(
          Math.pow(r - centroids[j][0], 2) +
          Math.pow(g - centroids[j][1], 2) +
          Math.pow(b - centroids[j][2], 2)
        );
        
        if (dist < minDist) {
          minDist = dist;
          minLabel = j;
        }
      }
      
      labels[i] = minLabel;
    }
    
    // Update centroids
    const sums = Array(k).fill(0).map(() => [0, 0, 0]);
    const counts = Array(k).fill(0);
    
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const label = labels[i];
      
      sums[label][0] += data[idx];
      sums[label][1] += data[idx + 1];
      sums[label][2] += data[idx + 2];
      counts[label]++;
    }
    
    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        centroids[j][0] = sums[j][0] / counts[j];
        centroids[j][1] = sums[j][1] / counts[j];
        centroids[j][2] = sums[j][2] / counts[j];
      }
    }
  }
  
  // Create output image with cluster colors
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const label = labels[i];
    
    output.data[idx] = centroids[label][0];
    output.data[idx + 1] = centroids[label][1];
    output.data[idx + 2] = centroids[label][2];
    output.data[idx + 3] = data[idx + 3];
  }
  
  return output;
}

export function regionGrowing(
  imageData: ImageData,
  seedX: number,
  seedY: number,
  threshold: number = 20
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  // Copy original image
  for (let i = 0; i < data.length; i++) {
    output.data[i] = data[i];
  }
  
  const visited = new Array(width * height).fill(false);
  const queue: [number, number][] = [[seedX, seedY]];
  
  const seedIdx = (seedY * width + seedX) * 4;
  const seedColor = [data[seedIdx], data[seedIdx + 1], data[seedIdx + 2]];
  
  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    const idx = y * width + x;
    
    if (visited[idx]) continue;
    visited[idx] = true;
    
    const pixelIdx = idx * 4;
    const pixelColor = [data[pixelIdx], data[pixelIdx + 1], data[pixelIdx + 2]];
    
    const colorDiff = Math.sqrt(
      Math.pow(pixelColor[0] - seedColor[0], 2) +
      Math.pow(pixelColor[1] - seedColor[1], 2) +
      Math.pow(pixelColor[2] - seedColor[2], 2)
    );
    
    if (colorDiff <= threshold) {
      // Mark pixel as part of region (red overlay)
      output.data[pixelIdx] = 255;
      output.data[pixelIdx + 1] = 0;
      output.data[pixelIdx + 2] = 0;
      
      // Add neighbors
      if (x > 0) queue.push([x - 1, y]);
      if (x < width - 1) queue.push([x + 1, y]);
      if (y > 0) queue.push([x, y - 1]);
      if (y < height - 1) queue.push([x, y + 1]);
    }
  }
  
  return output;
}

export function watershedSegmentation(imageData: ImageData): ImageData {
  // Simplified watershed implementation
  // In a full implementation, this would use markers and flooding
  
  // For now, use gradient magnitude as a simple approximation
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  // Compute gradient magnitude
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      let gx = 0, gy = 0;
      
      // Sobel operators
      for (let c = 0; c < 3; c++) {
        const tl = data[((y - 1) * width + (x - 1)) * 4 + c];
        const t = data[((y - 1) * width + x) * 4 + c];
        const tr = data[((y - 1) * width + (x + 1)) * 4 + c];
        const l = data[(y * width + (x - 1)) * 4 + c];
        const r = data[(y * width + (x + 1)) * 4 + c];
        const bl = data[((y + 1) * width + (x - 1)) * 4 + c];
        const b = data[((y + 1) * width + x) * 4 + c];
        const br = data[((y + 1) * width + (x + 1)) * 4 + c];
        
        gx += -tl + tr - 2 * l + 2 * r - bl + br;
        gy += -tl - 2 * t - tr + bl + 2 * b + br;
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy) / 3;
      
      output.data[idx] = Math.min(255, magnitude);
      output.data[idx + 1] = Math.min(255, magnitude);
      output.data[idx + 2] = Math.min(255, magnitude);
      output.data[idx + 3] = 255;
    }
  }
  
  return output;
}

export function connectedComponents(imageData: ImageData): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  const labels = new Array(width * height).fill(0);
  let currentLabel = 1;
  
  // First pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      
      if (gray > 128) {
        const neighbors = [];
        
        if (x > 0 && labels[y * width + x - 1] > 0) {
          neighbors.push(labels[y * width + x - 1]);
        }
        if (y > 0 && labels[(y - 1) * width + x] > 0) {
          neighbors.push(labels[(y - 1) * width + x]);
        }
        
        if (neighbors.length === 0) {
          labels[y * width + x] = currentLabel++;
        } else {
          labels[y * width + x] = Math.min(...neighbors);
        }
      }
    }
  }
  
  // Assign colors to components
  const colors = new Map<number, [number, number, number]>();
  
  for (let i = 0; i < width * height; i++) {
    const label = labels[i];
    if (label > 0 && !colors.has(label)) {
      colors.set(label, [
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255
      ]);
    }
    
    const idx = i * 4;
    if (label > 0) {
      const color = colors.get(label)!;
      output.data[idx] = color[0];
      output.data[idx + 1] = color[1];
      output.data[idx + 2] = color[2];
    } else {
      output.data[idx] = 0;
      output.data[idx + 1] = 0;
      output.data[idx + 2] = 0;
    }
    output.data[idx + 3] = 255;
  }
  
  return output;
}
