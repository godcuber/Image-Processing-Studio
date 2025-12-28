// Frequency domain image processing

import {
  imageDataToComplex,
  complexToImageData,
  fft2D,
  ifft2D,
  fftShift,
  Complex,
} from '../utils/fft';

export function lowPassFilter(imageData: ImageData, cutoffFreq: number = 30): ImageData {
  const complex = imageDataToComplex(imageData);
  const fftResult = fft2D(complex);
  const shifted = fftShift(fftResult);
  
  const height = shifted.length;
  const width = shifted[0].length;
  const centerY = height / 2;
  const centerX = width / 2;
  
  // Apply ideal low-pass filter
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      
      if (distance > cutoffFreq) {
        shifted[y][x] = new Complex(0, 0);
      }
    }
  }
  
  // Shift back
  const unshifted = fftShift(shifted);
  const result = ifft2D(unshifted);
  
  return complexToImageData(result, imageData.width, imageData.height);
}

export function highPassFilter(imageData: ImageData, cutoffFreq: number = 30): ImageData {
  const complex = imageDataToComplex(imageData);
  const fftResult = fft2D(complex);
  const shifted = fftShift(fftResult);
  
  const height = shifted.length;
  const width = shifted[0].length;
  const centerY = height / 2;
  const centerX = width / 2;
  
  // Apply ideal high-pass filter
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      
      if (distance < cutoffFreq) {
        shifted[y][x] = new Complex(0, 0);
      }
    }
  }
  
  // Shift back
  const unshifted = fftShift(shifted);
  const result = ifft2D(unshifted);
  
  return complexToImageData(result, imageData.width, imageData.height);
}

export function bandPassFilter(
  imageData: ImageData,
  lowCutoff: number = 20,
  highCutoff: number = 80
): ImageData {
  const complex = imageDataToComplex(imageData);
  const fftResult = fft2D(complex);
  const shifted = fftShift(fftResult);
  
  const height = shifted.length;
  const width = shifted[0].length;
  const centerY = height / 2;
  const centerX = width / 2;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      
      if (distance < lowCutoff || distance > highCutoff) {
        shifted[y][x] = new Complex(0, 0);
      }
    }
  }
  
  const unshifted = fftShift(shifted);
  const result = ifft2D(unshifted);
  
  return complexToImageData(result, imageData.width, imageData.height);
}

export function bandStopFilter(
  imageData: ImageData,
  lowCutoff: number = 20,
  highCutoff: number = 80
): ImageData {
  const complex = imageDataToComplex(imageData);
  const fftResult = fft2D(complex);
  const shifted = fftShift(fftResult);
  
  const height = shifted.length;
  const width = shifted[0].length;
  const centerY = height / 2;
  const centerX = width / 2;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      
      if (distance >= lowCutoff && distance <= highCutoff) {
        shifted[y][x] = new Complex(0, 0);
      }
    }
  }
  
  const unshifted = fftShift(shifted);
  const result = ifft2D(unshifted);
  
  return complexToImageData(result, imageData.width, imageData.height);
}

export function gaussianLowPassFilter(
  imageData: ImageData,
  sigma: number = 30
): ImageData {
  const complex = imageDataToComplex(imageData);
  const fftResult = fft2D(complex);
  const shifted = fftShift(fftResult);
  
  const height = shifted.length;
  const width = shifted[0].length;
  const centerY = height / 2;
  const centerX = width / 2;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      
      const h = Math.exp(-(distance * distance) / (2 * sigma * sigma));
      shifted[y][x] = new Complex(
        shifted[y][x].real * h,
        shifted[y][x].imag * h
      );
    }
  }
  
  const unshifted = fftShift(shifted);
  const result = ifft2D(unshifted);
  
  return complexToImageData(result, imageData.width, imageData.height);
}

export function gaussianHighPassFilter(
  imageData: ImageData,
  sigma: number = 30
): ImageData {
  const complex = imageDataToComplex(imageData);
  const fftResult = fft2D(complex);
  const shifted = fftShift(fftResult);
  
  const height = shifted.length;
  const width = shifted[0].length;
  const centerY = height / 2;
  const centerX = width / 2;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      
      const h = 1 - Math.exp(-(distance * distance) / (2 * sigma * sigma));
      shifted[y][x] = new Complex(
        shifted[y][x].real * h,
        shifted[y][x].imag * h
      );
    }
  }
  
  const unshifted = fftShift(shifted);
  const result = ifft2D(unshifted);
  
  return complexToImageData(result, imageData.width, imageData.height);
}

export function butterworthLowPassFilter(
  imageData: ImageData,
  cutoff: number = 30,
  order: number = 2
): ImageData {
  const complex = imageDataToComplex(imageData);
  const fftResult = fft2D(complex);
  const shifted = fftShift(fftResult);
  
  const height = shifted.length;
  const width = shifted[0].length;
  const centerY = height / 2;
  const centerX = width / 2;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      
      const h = 1 / (1 + Math.pow(distance / cutoff, 2 * order));
      shifted[y][x] = new Complex(
        shifted[y][x].real * h,
        shifted[y][x].imag * h
      );
    }
  }
  
  const unshifted = fftShift(shifted);
  const result = ifft2D(unshifted);
  
  return complexToImageData(result, imageData.width, imageData.height);
}

export function butterworthHighPassFilter(
  imageData: ImageData,
  cutoff: number = 30,
  order: number = 2
): ImageData {
  const complex = imageDataToComplex(imageData);
  const fftResult = fft2D(complex);
  const shifted = fftShift(fftResult);
  
  const height = shifted.length;
  const width = shifted[0].length;
  const centerY = height / 2;
  const centerX = width / 2;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      
      if (distance === 0) {
        shifted[y][x] = new Complex(0, 0);
      } else {
        const h = 1 / (1 + Math.pow(cutoff / distance, 2 * order));
        shifted[y][x] = new Complex(
          shifted[y][x].real * h,
          shifted[y][x].imag * h
        );
      }
    }
  }
  
  const unshifted = fftShift(shifted);
  const result = ifft2D(unshifted);
  
  return complexToImageData(result, imageData.width, imageData.height);
}
