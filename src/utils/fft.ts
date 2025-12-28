// Fast Fourier Transform utilities

export class Complex {
  constructor(public real: number, public imag: number) {}
  
  add(other: Complex): Complex {
    return new Complex(this.real + other.real, this.imag + other.imag);
  }
  
  subtract(other: Complex): Complex {
    return new Complex(this.real - other.real, this.imag - other.imag);
  }
  
  multiply(other: Complex): Complex {
    return new Complex(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    );
  }
  
  magnitude(): number {
    return Math.sqrt(this.real * this.real + this.imag * this.imag);
  }
  
  phase(): number {
    return Math.atan2(this.imag, this.real);
  }
}

export function fft(input: Complex[]): Complex[] {
  const n = input.length;
  
  if (n <= 1) return input;
  
  if (n % 2 !== 0) {
    throw new Error('FFT requires power of 2 length');
  }
  
  // Divide
  const even = fft(input.filter((_, i) => i % 2 === 0));
  const odd = fft(input.filter((_, i) => i % 2 === 1));
  
  // Conquer
  const output: Complex[] = new Array(n);
  for (let k = 0; k < n / 2; k++) {
    const angle = -2 * Math.PI * k / n;
    const twiddle = new Complex(Math.cos(angle), Math.sin(angle));
    const t = twiddle.multiply(odd[k]);
    
    output[k] = even[k].add(t);
    output[k + n / 2] = even[k].subtract(t);
  }
  
  return output;
}

export function ifft(input: Complex[]): Complex[] {
  const n = input.length;
  
  // Conjugate input
  const conjugated = input.map(c => new Complex(c.real, -c.imag));
  
  // Forward FFT
  const result = fft(conjugated);
  
  // Conjugate and normalize
  return result.map(c => new Complex(c.real / n, -c.imag / n));
}

export function fft2D(input: Complex[][]): Complex[][] {
  const height = input.length;
  const width = input[0].length;
  
  // FFT on rows
  const rowFFT = input.map(row => fft(row));
  
  // FFT on columns
  const output: Complex[][] = [];
  for (let y = 0; y < height; y++) {
    output[y] = [];
  }
  
  for (let x = 0; x < width; x++) {
    const column = rowFFT.map(row => row[x]);
    const columnFFT = fft(column);
    for (let y = 0; y < height; y++) {
      output[y][x] = columnFFT[y];
    }
  }
  
  return output;
}

export function ifft2D(input: Complex[][]): Complex[][] {
  const height = input.length;
  const width = input[0].length;
  
  // IFFT on rows
  const rowIFFT = input.map(row => ifft(row));
  
  // IFFT on columns
  const output: Complex[][] = [];
  for (let y = 0; y < height; y++) {
    output[y] = [];
  }
  
  for (let x = 0; x < width; x++) {
    const column = rowIFFT.map(row => row[x]);
    const columnIFFT = ifft(column);
    for (let y = 0; y < height; y++) {
      output[y][x] = columnIFFT[y];
    }
  }
  
  return output;
}

export function imageDataToComplex(imageData: ImageData): Complex[][] {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  
  // Pad to power of 2
  const paddedWidth = nextPowerOf2(width);
  const paddedHeight = nextPowerOf2(height);
  
  const output: Complex[][] = [];
  
  for (let y = 0; y < paddedHeight; y++) {
    output[y] = [];
    for (let x = 0; x < paddedWidth; x++) {
      if (y < height && x < width) {
        const idx = (y * width + x) * 4;
        // Use grayscale value
        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        output[y][x] = new Complex(gray, 0);
      } else {
        output[y][x] = new Complex(0, 0);
      }
    }
  }
  
  return output;
}

export function complexToImageData(complex: Complex[][], originalWidth: number, originalHeight: number): ImageData {
  const output = new ImageData(originalWidth, originalHeight);
  
  for (let y = 0; y < originalHeight; y++) {
    for (let x = 0; x < originalWidth; x++) {
      const idx = (y * originalWidth + x) * 4;
      const value = Math.min(255, Math.max(0, complex[y][x].real));
      
      output.data[idx] = value;
      output.data[idx + 1] = value;
      output.data[idx + 2] = value;
      output.data[idx + 3] = 255;
    }
  }
  
  return output;
}

export function fftShift(complex: Complex[][]): Complex[][] {
  const height = complex.length;
  const width = complex[0].length;
  const output: Complex[][] = [];
  
  const midY = Math.floor(height / 2);
  const midX = Math.floor(width / 2);
  
  for (let y = 0; y < height; y++) {
    output[y] = [];
    for (let x = 0; x < width; x++) {
      const newY = (y + midY) % height;
      const newX = (x + midX) % width;
      output[y][x] = complex[newY][newX];
    }
  }
  
  return output;
}

function nextPowerOf2(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

export function getMagnitudeSpectrum(complex: Complex[][]): ImageData {
  const height = complex.length;
  const width = complex[0].length;
  const output = new ImageData(width, height);
  
  // Shift for visualization
  const shifted = fftShift(complex);
  
  // Find max magnitude for normalization
  let maxMag = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const mag = Math.log(1 + shifted[y][x].magnitude());
      if (mag > maxMag) maxMag = mag;
    }
  }
  
  // Create image
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const mag = Math.log(1 + shifted[y][x].magnitude());
      const value = (mag / maxMag) * 255;
      
      output.data[idx] = value;
      output.data[idx + 1] = value;
      output.data[idx + 2] = value;
      output.data[idx + 3] = 255;
    }
  }
  
  return output;
}
