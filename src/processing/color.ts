// Color space conversions

export function rgbToGrayscale(imageData: ImageData): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  for (let i = 0; i < data.length; i += 4) {
    // Weighted average for human perception
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    
    output.data[i] = gray;
    output.data[i + 1] = gray;
    output.data[i + 2] = gray;
    output.data[i + 3] = data[i + 3];
  }
  
  return output;
}

export function rgbToHsv(imageData: ImageData): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0;
    let s = 0;
    const v = max;
    
    if (delta !== 0) {
      s = delta / max;
      
      if (max === r) {
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
      } else if (max === g) {
        h = ((b - r) / delta + 2) / 6;
      } else {
        h = ((r - g) / delta + 4) / 6;
      }
    }
    
    // Store HSV as RGB channels for visualization
    output.data[i] = h * 255;
    output.data[i + 1] = s * 255;
    output.data[i + 2] = v * 255;
    output.data[i + 3] = data[i + 3];
  }
  
  return output;
}

export function hsvToRgb(imageData: ImageData): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  for (let i = 0; i < data.length; i += 4) {
    const h = data[i] / 255;
    const s = data[i + 1] / 255;
    const v = data[i + 2] / 255;
    
    const c = v * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = v - c;
    
    let r = 0, g = 0, b = 0;
    
    const hSector = Math.floor(h * 6);
    
    switch (hSector) {
      case 0: [r, g, b] = [c, x, 0]; break;
      case 1: [r, g, b] = [x, c, 0]; break;
      case 2: [r, g, b] = [0, c, x]; break;
      case 3: [r, g, b] = [0, x, c]; break;
      case 4: [r, g, b] = [x, 0, c]; break;
      case 5: [r, g, b] = [c, 0, x]; break;
    }
    
    output.data[i] = (r + m) * 255;
    output.data[i + 1] = (g + m) * 255;
    output.data[i + 2] = (b + m) * 255;
    output.data[i + 3] = data[i + 3];
  }
  
  return output;
}

export function rgbToLab(imageData: ImageData): ImageData {
  // First convert RGB to XYZ
  const xyz = rgbToXyz(imageData);
  
  // Then XYZ to LAB
  const width = xyz.width;
  const height = xyz.height;
  const data = xyz.data;
  const output = new ImageData(width, height);
  
  // D65 reference white
  const Xn = 95.047;
  const Yn = 100.000;
  const Zn = 108.883;
  
  for (let i = 0; i < data.length; i += 4) {
    const x = data[i] / Xn;
    const y = data[i + 1] / Yn;
    const z = data[i + 2] / Zn;
    
    const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
    const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
    const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);
    
    const L = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const b = 200 * (fy - fz);
    
    // Normalize for display
    output.data[i] = (L / 100) * 255;
    output.data[i + 1] = ((a + 128) / 255) * 255;
    output.data[i + 2] = ((b + 128) / 255) * 255;
    output.data[i + 3] = data[i + 3];
  }
  
  return output;
}

function rgbToXyz(imageData: ImageData): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] / 255;
    let g = data[i + 1] / 255;
    let b = data[i + 2] / 255;
    
    // Gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    
    r *= 100;
    g *= 100;
    b *= 100;
    
    const X = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const Y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const Z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    
    output.data[i] = X;
    output.data[i + 1] = Y;
    output.data[i + 2] = Z;
    output.data[i + 3] = data[i + 3];
  }
  
  return output;
}

export function adjustBrightness(imageData: ImageData, amount: number): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  for (let i = 0; i < data.length; i += 4) {
    output.data[i] = Math.min(255, Math.max(0, data[i] + amount));
    output.data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + amount));
    output.data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + amount));
    output.data[i + 3] = data[i + 3];
  }
  
  return output;
}

export function adjustContrast(imageData: ImageData, factor: number): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  const contrast = (factor + 100) / 100;
  const intercept = 128 * (1 - contrast);
  
  for (let i = 0; i < data.length; i += 4) {
    output.data[i] = Math.min(255, Math.max(0, contrast * data[i] + intercept));
    output.data[i + 1] = Math.min(255, Math.max(0, contrast * data[i + 1] + intercept));
    output.data[i + 2] = Math.min(255, Math.max(0, contrast * data[i + 2] + intercept));
    output.data[i + 3] = data[i + 3];
  }
  
  return output;
}

export function adjustSaturation(imageData: ImageData, amount: number): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    
    output.data[i] = Math.min(255, Math.max(0, gray + amount * (data[i] - gray)));
    output.data[i + 1] = Math.min(255, Math.max(0, gray + amount * (data[i + 1] - gray)));
    output.data[i + 2] = Math.min(255, Math.max(0, gray + amount * (data[i + 2] - gray)));
    output.data[i + 3] = data[i + 3];
  }
  
  return output;
}

export function adjustHue(imageData: ImageData, amount: number): ImageData {
  const hsv = rgbToHsv(imageData);
  const data = hsv.data;
  
  for (let i = 0; i < data.length; i += 4) {
    let h = data[i] / 255;
    h = (h + amount / 360) % 1;
    if (h < 0) h += 1;
    data[i] = h * 255;
  }
  
  return hsvToRgb(hsv);
}

export function invert(imageData: ImageData): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  for (let i = 0; i < data.length; i += 4) {
    output.data[i] = 255 - data[i];
    output.data[i + 1] = 255 - data[i + 1];
    output.data[i + 2] = 255 - data[i + 2];
    output.data[i + 3] = data[i + 3];
  }
  
  return output;
}

export function sepia(imageData: ImageData): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new ImageData(width, height);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    output.data[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
    output.data[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
    output.data[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
    output.data[i + 3] = data[i + 3];
  }
  
  return output;
}
