import React, { useRef, useEffect, useState } from 'react';

interface CanvasViewProps {
  imageData: ImageData | null;
  width: number;
  height: number;
  zoom: number;
}

export function CanvasView({ imageData, width, height, zoom }: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displaySize, setDisplaySize] = useState({ width: 600, height: 450 });

  // Update canvas size to fit container while maintaining aspect ratio
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && width > 0 && height > 0) {
        const containerWidth = containerRef.current.clientWidth - 32; // padding
        const containerHeight = containerRef.current.clientHeight - 32; // padding

        // Calculate dimensions maintaining aspect ratio
        const aspectRatio = width / height;
        let newWidth = containerWidth;
        let newHeight = containerWidth / aspectRatio;

        if (newHeight > containerHeight) {
          newHeight = containerHeight;
          newWidth = containerHeight * aspectRatio;
        }

        setDisplaySize({
          width: Math.max(100, newWidth),
          height: Math.max(100, newHeight),
        });
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [width, height]);

  useEffect(() => {
    if (canvasRef.current && imageData) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
      }
    }
  }, [imageData]);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-gray-100 overflow-auto p-4"
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
          transition: 'transform 0.2s',
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border-2 border-gray-300 bg-white shadow-lg"
          style={{
            imageRendering: zoom > 1 ? 'pixelated' : 'auto',
            width: displaySize.width,
            height: displaySize.height,
          }}
        />
      </div>
    </div>
  );
}
