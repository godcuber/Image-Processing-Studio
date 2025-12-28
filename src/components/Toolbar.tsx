import React from 'react';
import { Upload, Download, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../app/components/ui/button';

interface ToolbarProps {
  onLoadImage: (file: File) => void;
  onSaveImage: () => void;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  hasImage: boolean;
}

export function Toolbar({
  onLoadImage,
  onSaveImage,
  onReset,
  onZoomIn,
  onZoomOut,
  hasImage,
}: ToolbarProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadImage(file);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-white border-b border-gray-200">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Button
        onClick={handleFileClick}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        Open Image
      </Button>

      <Button
        onClick={onSaveImage}
        variant="outline"
        size="sm"
        disabled={!hasImage}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Save Image
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-2" />

      <Button
        onClick={onZoomIn}
        variant="outline"
        size="sm"
        disabled={!hasImage}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      <Button
        onClick={onZoomOut}
        variant="outline"
        size="sm"
        disabled={!hasImage}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-2" />

      <Button
        onClick={onReset}
        variant="outline"
        size="sm"
        disabled={!hasImage}
        className="gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}