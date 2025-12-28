// Image compression algorithms

export function jpegStyleCompression(
  imageData: ImageData,
  quality: number = 50
): ImageData {
  // Simplified JPEG-style compression using DCT
  const width = imageData.width;
  const height = imageData.height;
  const blockSize = 8;
  
  const output = new ImageData(width, height);
  
  // Process in 8x8 blocks
  for (let by = 0; by < height; by += blockSize) {
    for (let bx = 0; bx < width; bx += blockSize) {
      for (let channel = 0; channel < 3; channel++) {
        const block = extractBlock(imageData, bx, by, blockSize, channel);
        const dctBlock = dct2D(block);
        const quantizedBlock = quantize(dctBlock, quality);
        const idctBlock = idct2D(quantizedBlock);
        insertBlock(output, idctBlock, bx, by, blockSize, channel);
      }
    }
  }
  
  // Copy alpha channel
  for (let i = 0; i < width * height; i++) {
    output.data[i * 4 + 3] = imageData.data[i * 4 + 3];
  }
  
  return output;
}

function extractBlock(
  imageData: ImageData,
  x: number,
  y: number,
  blockSize: number,
  channel: number
): number[][] {
  const block: number[][] = [];
  const width = imageData.width;
  const data = imageData.data;
  
  for (let j = 0; j < blockSize; j++) {
    block[j] = [];
    for (let i = 0; i < blockSize; i++) {
      const px = Math.min(x + i, imageData.width - 1);
      const py = Math.min(y + j, imageData.height - 1);
      const idx = (py * width + px) * 4 + channel;
      block[j][i] = data[idx] - 128; // Center around 0
    }
  }
  
  return block;
}

function insertBlock(
  imageData: ImageData,
  block: number[][],
  x: number,
  y: number,
  blockSize: number,
  channel: number
): void {
  const width = imageData.width;
  const data = imageData.data;
  
  for (let j = 0; j < blockSize; j++) {
    for (let i = 0; i < blockSize; i++) {
      const px = x + i;
      const py = y + j;
      
      if (px < imageData.width && py < imageData.height) {
        const idx = (py * width + px) * 4 + channel;
        data[idx] = Math.min(255, Math.max(0, block[j][i] + 128));
      }
    }
  }
}

function dct2D(block: number[][]): number[][] {
  const N = block.length;
  const output: number[][] = Array(N).fill(0).map(() => Array(N).fill(0));
  
  for (let u = 0; u < N; u++) {
    for (let v = 0; v < N; v++) {
      let sum = 0;
      
      for (let x = 0; x < N; x++) {
        for (let y = 0; y < N; y++) {
          sum += block[x][y] *
            Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N)) *
            Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
        }
      }
      
      const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
      const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
      
      output[u][v] = (2 / N) * cu * cv * sum;
    }
  }
  
  return output;
}

function idct2D(block: number[][]): number[][] {
  const N = block.length;
  const output: number[][] = Array(N).fill(0).map(() => Array(N).fill(0));
  
  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) {
      let sum = 0;
      
      for (let u = 0; u < N; u++) {
        for (let v = 0; v < N; v++) {
          const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
          const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
          
          sum += cu * cv * block[u][v] *
            Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N)) *
            Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
        }
      }
      
      output[x][y] = (2 / N) * sum;
    }
  }
  
  return output;
}

function quantize(block: number[][], quality: number): number[][] {
  const N = block.length;
  const output: number[][] = Array(N).fill(0).map(() => Array(N).fill(0));
  
  // Quantization matrix (simplified)
  const scale = Math.max(1, (100 - quality) / 10);
  
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const qval = (1 + i + j) * scale;
      output[i][j] = Math.round(block[i][j] / qval) * qval;
    }
  }
  
  return output;
}

export function runLengthEncoding(imageData: ImageData): {
  encoded: Array<{ value: number; count: number }>;
  width: number;
  height: number;
} {
  const data = imageData.data;
  const encoded: Array<{ value: number; count: number }> = [];
  
  let currentValue = -1;
  let count = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    
    if (gray === currentValue) {
      count++;
    } else {
      if (count > 0) {
        encoded.push({ value: currentValue, count });
      }
      currentValue = gray;
      count = 1;
    }
  }
  
  if (count > 0) {
    encoded.push({ value: currentValue, count });
  }
  
  return {
    encoded,
    width: imageData.width,
    height: imageData.height
  };
}

export function decodeRunLength(encoded: {
  encoded: Array<{ value: number; count: number }>;
  width: number;
  height: number;
}): ImageData {
  const output = new ImageData(encoded.width, encoded.height);
  let idx = 0;
  
  for (const { value, count } of encoded.encoded) {
    for (let i = 0; i < count; i++) {
      output.data[idx] = value;
      output.data[idx + 1] = value;
      output.data[idx + 2] = value;
      output.data[idx + 3] = 255;
      idx += 4;
    }
  }
  
  return output;
}

export function huffmanEncoding(imageData: ImageData): {
  encoded: string;
  tree: any;
  width: number;
  height: number;
} {
  // Simplified Huffman encoding
  const data = imageData.data;
  const frequency = new Map<number, number>();
  
  // Calculate frequencies
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    frequency.set(gray, (frequency.get(gray) || 0) + 1);
  }
  
  // Build Huffman tree (simplified - just return the frequency map)
  return {
    encoded: '',
    tree: Object.fromEntries(frequency),
    width: imageData.width,
    height: imageData.height
  };
}

export function downsampleImage(imageData: ImageData, factor: number = 2): ImageData {
  const newWidth = Math.floor(imageData.width / factor);
  const newHeight = Math.floor(imageData.height / factor);
  const output = new ImageData(newWidth, newHeight);
  
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;
      
      for (let dy = 0; dy < factor; dy++) {
        for (let dx = 0; dx < factor; dx++) {
          const srcX = x * factor + dx;
          const srcY = y * factor + dy;
          
          if (srcX < imageData.width && srcY < imageData.height) {
            const srcIdx = (srcY * imageData.width + srcX) * 4;
            r += imageData.data[srcIdx];
            g += imageData.data[srcIdx + 1];
            b += imageData.data[srcIdx + 2];
            a += imageData.data[srcIdx + 3];
            count++;
          }
        }
      }
      
      const dstIdx = (y * newWidth + x) * 4;
      output.data[dstIdx] = r / count;
      output.data[dstIdx + 1] = g / count;
      output.data[dstIdx + 2] = b / count;
      output.data[dstIdx + 3] = a / count;
    }
  }
  
  return output;
}
