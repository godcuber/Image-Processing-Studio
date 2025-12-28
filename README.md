# Image Processing Studio

Advanced image processing application with spatial, frequency, and feature detection filters.

## Features

- **Responsive Canvas**: Automatically fits images of any size while maintaining aspect ratio
- **Spatial Filters**: Gaussian blur, median filter, bilateral filter, Sobel gradient, Laplacian of Gaussian, difference of Gaussians, sharpness, emboss, and edge enhancement
- **Frequency Filters**: Low-pass and high-pass filters using FFT
- **Feature Detection**: Edge detection and other feature analysis
- **Color Processing**: Brightness, contrast, saturation, hue adjustments, grayscale conversion, and more
- **Segmentation**: Threshold, adaptive threshold, Otsu thresholding, and K-means segmentation

## Getting Started

### Installation

```bash
npm install
```

### Running the Application

```bash
npm run dev
```

The development server will start at `http://localhost:5173`

### Building for Production

```bash
npm build
```

## Usage

1. **Load Image**: Click "Open Image" to select an image file
2. **Apply Filters**: Use the sidebar to select and apply various image processing filters
3. **Zoom**: Use zoom controls to adjust the view
4. **Save**: Click "Save Image" to download the processed result
5. **Reset**: Use the reset button to revert to the original image

## Tips

- Use the Reset Button after testing filters as effects can stack on one another
- Adjust slider values to fine-tune filter parameters
- The canvas will automatically scale to fit any image size

