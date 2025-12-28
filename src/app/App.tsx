import React, { useState } from 'react';
import { Toolbar } from '../components/Toolbar';
import { CanvasView } from '../components/CanvasView';
import { Sidebar } from '../components/Sidebar';
import { toast, Toaster } from 'sonner';

// Import processing functions
import * as spatial from '../processing/spatial';
import * as frequency from '../processing/frequency';
import * as features from '../processing/features';
import * as color from '../processing/color';
import * as segmentation from '../processing/segmentation';

export default function App() {
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);

  const loadImage = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          
          setOriginalImage(imageData);
          setCurrentImage(imageData);
          setImageDimensions({ width: img.width, height: img.height });
          setZoom(1);
          
          toast.success('Image loaded successfully!');
        }
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  };

  const saveImage = () => {
    if (!currentImage) return;

    const canvas = document.createElement('canvas');
    canvas.width = imageDimensions.width;
    canvas.height = imageDimensions.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.putImageData(currentImage, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `processed-image-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          
          toast.success('Image saved successfully!');
        }
      });
    }
  };

  const resetImage = () => {
    if (originalImage) {
      setCurrentImage(originalImage);
      setZoom(1);
      toast.info('Image reset to original');
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  };

  const applyFilter = async (filterName: string, params?: any) => {
    if (!currentImage) {
      toast.error('Please load an image first');
      return;
    }

    try {
      toast.loading('Processing image...', { id: 'processing' });
      
      // Use setTimeout to allow UI to update
      setTimeout(() => {
        let processedImage: ImageData;

        switch (filterName) {
          // Spatial filters
          case 'gaussianBlur':
            processedImage = spatial.gaussianBlur(currentImage, params.sigma);
            break;
          case 'medianFilter':
            processedImage = spatial.medianFilter(currentImage, params.size);
            break;
          case 'bilateralFilter':
            processedImage = spatial.bilateralFilter(
              currentImage,
              params.sigmaSpace,
              params.sigmaColor
            );
            break;
          case 'sobelGradient':
            processedImage = spatial.sobelGradient(currentImage);
            break;
          case 'laplacianOfGaussian':
            processedImage = spatial.laplacianOfGaussian(currentImage, 1.5);
            break;
          case 'differenceOfGaussians':
            processedImage = spatial.differenceOfGaussians(
              currentImage,
              params.sigma1,
              params.sigma2
            );
            break;
          case 'sharpen':
            processedImage = spatial.sharpen(currentImage, params.amount);
            break;

          // Frequency filters
          case 'lowPassFilter':
            processedImage = frequency.lowPassFilter(currentImage, params.cutoff);
            break;
          case 'highPassFilter':
            processedImage = frequency.highPassFilter(currentImage, params.cutoff);
            break;

          // Feature detection
          case 'edgeEnhancement':
            processedImage = spatial.edgeEnhancement(currentImage);
            break;

          // Color conversions
          case 'rgbToGrayscale':
            processedImage = color.rgbToGrayscale(currentImage);
            break;
          case 'rgbToHsv':
            processedImage = color.rgbToHsv(currentImage);
            break;
          case 'adjustBrightness':
            processedImage = color.adjustBrightness(currentImage, params.amount);
            break;
          case 'adjustContrast':
            processedImage = color.adjustContrast(currentImage, params.factor);
            break;
          case 'adjustSaturation':
            processedImage = color.adjustSaturation(currentImage, params.amount);
            break;
          case 'adjustHue':
            processedImage = color.adjustHue(currentImage, params.amount);
            break;
          case 'invert':
            processedImage = color.invert(currentImage);
            break;
          case 'sepia':
            processedImage = color.sepia(currentImage);
            break;

          // Segmentation
          case 'threshold':
            processedImage = segmentation.thresholdSegmentation(
              currentImage,
              params.threshold
            );
            break;
          case 'otsuThreshold':
            processedImage = segmentation.otsuThreshold(currentImage);
            break;
          case 'adaptiveThreshold':
            processedImage = segmentation.adaptiveThreshold(
              currentImage,
              params.blockSize,
              params.c
            );
            break;
          case 'kMeansSegmentation':
            processedImage = segmentation.kMeansSegmentation(currentImage, params.k);
            break;

          default:
            toast.error('Unknown filter', { id: 'processing' });
            return;
        }

        setCurrentImage(processedImage);
        toast.success('Filter applied successfully!', { id: 'processing' });
      }, 100);
    } catch (error) {
      console.error('Error applying filter:', error);
      toast.error('Error applying filter', { id: 'processing' });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />
      
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">Image Processing Studio</h1>
        <p className="text-sm text-blue-100">
          Advanced image processing with spatial, frequency, and feature detection filters
        </p>
      </header>

      <Toolbar
        onLoadImage={loadImage}
        onSaveImage={saveImage}
        onReset={resetImage}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        hasImage={currentImage !== null}
      />

      <div className="flex-1 flex overflow-hidden">
        <CanvasView
          imageData={currentImage}
          width={imageDimensions.width}
          height={imageDimensions.height}
          zoom={zoom}
        />
        
        <Sidebar
          onApplyFilter={applyFilter}
          hasImage={currentImage !== null}
        />
      </div>

      {!currentImage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400 space-y-4">
            <svg
              className="w-32 h-32 mx-auto opacity-30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="text-xl font-semibold">No Image Loaded</p>
              <p className="text-sm mt-2">Click "Open Image" to get started</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}