import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../app/components/ui/tabs';
import { Label } from '../app/components/ui/label';
import { Slider } from '../app/components/ui/slider';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../app/components/ui/select';

interface SidebarProps {
  onApplyFilter: (filter: string, params?: any) => void;
  hasImage: boolean;
}

export function Sidebar({ onApplyFilter, hasImage }: SidebarProps) {
  const [spatialParams, setSpatialParams] = React.useState({
    gaussianSigma: 1.5,
    medianSize: 3,
    bilateralSigmaSpace: 5,
    bilateralSigmaColor: 50,
    dogSigma1: 1.0,
    dogSigma2: 2.0,
    sharpenAmount: 1.0,
  });

  const [frequencyParams, setFrequencyParams] = React.useState({
    lowPassCutoff: 30,
    highPassCutoff: 30,
  });

  const [featureParams, setFeatureParams] = React.useState({});

  const [colorParams, setColorParams] = React.useState({
    brightness: 0,
    contrast: 0,
    saturation: 1.0,
    hue: 0,
  });

  const [segmentationParams, setSegmentationParams] = React.useState({
    threshold: 128,
    kMeansK: 3,
    adaptiveBlockSize: 11,
    adaptiveC: 2,
  });

  const [hexColor, setHexColor] = React.useState('#ffffff');

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <Tabs defaultValue="spatial" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="spatial">Spatial</TabsTrigger>
          <TabsTrigger value="frequency">Frequency</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="spatial" className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Gaussian Blur</h3>
            <div className="space-y-2">
              <Label>Sigma: {spatialParams.gaussianSigma.toFixed(1)}</Label>
              <Slider
                value={[spatialParams.gaussianSigma]}
                onValueChange={([value]) =>
                  setSpatialParams({ ...spatialParams, gaussianSigma: value })
                }
                min={0.1}
                max={5}
                step={0.1}
                disabled={!hasImage}
              />
              <Button
                onClick={() =>
                  onApplyFilter('gaussianBlur', { sigma: spatialParams.gaussianSigma })
                }
                disabled={!hasImage}
                size="sm"
                className="w-full"
              >
                Apply Gaussian Blur
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Median Filter</h3>
            <div className="space-y-2">
              <Label>Size: {spatialParams.medianSize}</Label>
              <Slider
                value={[spatialParams.medianSize]}
                onValueChange={([value]) =>
                  setSpatialParams({ ...spatialParams, medianSize: value })
                }
                min={3}
                max={11}
                step={2}
                disabled={!hasImage}
              />
              <Button
                onClick={() =>
                  onApplyFilter('medianFilter', { size: spatialParams.medianSize })
                }
                disabled={!hasImage}
                size="sm"
                className="w-full"
              >
                Apply Median Filter
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Bilateral Filter</h3>
            <div className="space-y-2">
              <Label>Space Sigma: {spatialParams.bilateralSigmaSpace}</Label>
              <Slider
                value={[spatialParams.bilateralSigmaSpace]}
                onValueChange={([value]) =>
                  setSpatialParams({ ...spatialParams, bilateralSigmaSpace: value })
                }
                min={1}
                max={20}
                step={1}
                disabled={!hasImage}
              />
              <Label>Color Sigma: {spatialParams.bilateralSigmaColor}</Label>
              <Slider
                value={[spatialParams.bilateralSigmaColor]}
                onValueChange={([value]) =>
                  setSpatialParams({ ...spatialParams, bilateralSigmaColor: value })
                }
                min={10}
                max={200}
                step={10}
                disabled={!hasImage}
              />
              <Button
                onClick={() =>
                  onApplyFilter('bilateralFilter', {
                    sigmaSpace: spatialParams.bilateralSigmaSpace,
                    sigmaColor: spatialParams.bilateralSigmaColor,
                  })
                }
                disabled={!hasImage}
                size="sm"
                className="w-full"
              >
                Apply Bilateral Filter
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => onApplyFilter('sobelGradient')}
              disabled={!hasImage}
              size="sm"
              className="w-full"
            >
              Sobel Gradient
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Difference of Gaussians</h3>
            <div className="space-y-2">
              <Label>Sigma 1: {spatialParams.dogSigma1.toFixed(1)}</Label>
              <Slider
                value={[spatialParams.dogSigma1]}
                onValueChange={([value]) =>
                  setSpatialParams({ ...spatialParams, dogSigma1: value })
                }
                min={0.5}
                max={5}
                step={0.1}
                disabled={!hasImage}
              />
              <Label>Sigma 2: {spatialParams.dogSigma2.toFixed(1)}</Label>
              <Slider
                value={[spatialParams.dogSigma2]}
                onValueChange={([value]) =>
                  setSpatialParams({ ...spatialParams, dogSigma2: value })
                }
                min={0.5}
                max={5}
                step={0.1}
                disabled={!hasImage}
              />
              <Button
                onClick={() =>
                  onApplyFilter('differenceOfGaussians', {
                    sigma1: spatialParams.dogSigma1,
                    sigma2: spatialParams.dogSigma2,
                  })
                }
                disabled={!hasImage}
                size="sm"
                className="w-full"
              >
                Apply DoG
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => onApplyFilter('laplacianOfGaussian')}
              disabled={!hasImage}
              size="sm"
              className="w-full"
            >
              Laplacian of Gaussian
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Sharpen</h3>
            <div className="space-y-2">
              <Label>Amount: {spatialParams.sharpenAmount.toFixed(1)}</Label>
              <Slider
                value={[spatialParams.sharpenAmount]}
                onValueChange={([value]) =>
                  setSpatialParams({ ...spatialParams, sharpenAmount: value })
                }
                min={0.1}
                max={3}
                step={0.1}
                disabled={!hasImage}
              />
              <Button
                onClick={() =>
                  onApplyFilter('sharpen', {
                    amount: spatialParams.sharpenAmount,
                  })
                }
                disabled={!hasImage}
                size="sm"
                className="w-full"
              >
                Apply Sharpness
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="frequency" className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Low-Pass Filter</h3>
            <div className="space-y-2">
              <Label>Cutoff: {frequencyParams.lowPassCutoff}</Label>
              <Slider
                value={[frequencyParams.lowPassCutoff]}
                onValueChange={([value]) =>
                  setFrequencyParams({ ...frequencyParams, lowPassCutoff: value })
                }
                min={5}
                max={100}
                step={5}
                disabled={!hasImage}
              />
              <Button
                onClick={() =>
                  onApplyFilter('lowPassFilter', {
                    cutoff: frequencyParams.lowPassCutoff,
                  })
                }
                disabled={!hasImage}
                size="sm"
                className="w-full"
              >
                Apply Low-Pass Filter
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">High-Pass Filter</h3>
            <div className="space-y-2">
              <Label>Cutoff: {frequencyParams.highPassCutoff}</Label>
              <Slider
                value={[frequencyParams.highPassCutoff]}
                onValueChange={([value]) =>
                  setFrequencyParams({ ...frequencyParams, highPassCutoff: value })
                }
                min={5}
                max={100}
                step={5}
                disabled={!hasImage}
              />
              <Button
                onClick={() =>
                  onApplyFilter('highPassFilter', {
                    cutoff: frequencyParams.highPassCutoff,
                  })
                }
                disabled={!hasImage}
                size="sm"
                className="w-full"
              >
                Apply High-Pass Filter
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="features" className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Edge Enhancement</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Enhance edges in the image using a high-pass filter</p>
              <Button
                onClick={() => onApplyFilter('edgeEnhancement')}
                disabled={!hasImage}
                size="sm"
                className="w-full"
              >
                Apply Edge Enhancement
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="p-4 space-y-4 border-t border-gray-200">
        <Tabs defaultValue="color" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="color">Color</TabsTrigger>
            <TabsTrigger value="segment">Segment</TabsTrigger>
          </TabsList>

          <TabsContent value="color" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Color Conversions</h3>
              <Button
                onClick={() => onApplyFilter('rgbToGrayscale')}
                disabled={!hasImage}
                size="sm"
                className="w-full"
              >
                RGB to Grayscale
              </Button>
              <Button
                onClick={() => onApplyFilter('rgbToHsv')}
                disabled={!hasImage}
                size="sm"
                className="w-full"
              >
                RGB to HSV
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Adjustments</h3>
              <div className="space-y-2">
                <Label>Brightness: {colorParams.brightness}</Label>
                <Slider
                  value={[colorParams.brightness]}
                  onValueChange={([value]) =>
                    setColorParams({ ...colorParams, brightness: value })
                  }
                  min={-100}
                  max={100}
                  step={1}
                  disabled={!hasImage}
                />
                <Button
                  onClick={() =>
                    onApplyFilter('adjustBrightness', {
                      amount: colorParams.brightness,
                    })
                  }
                  disabled={!hasImage}
                  size="sm"
                  className="w-full"
                >
                  Apply Brightness
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Contrast: {colorParams.contrast}</Label>
                <Slider
                  value={[colorParams.contrast]}
                  onValueChange={([value]) =>
                    setColorParams({ ...colorParams, contrast: value })
                  }
                  min={-100}
                  max={100}
                  step={1}
                  disabled={!hasImage}
                />
                <Button
                  onClick={() =>
                    onApplyFilter('adjustContrast', { factor: colorParams.contrast })
                  }
                  disabled={!hasImage}
                  size="sm"
                  className="w-full"
                >
                  Apply Contrast
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Saturation: {colorParams.saturation.toFixed(1)}</Label>
                <Slider
                  value={[colorParams.saturation]}
                  onValueChange={([value]) =>
                    setColorParams({ ...colorParams, saturation: value })
                  }
                  min={0}
                  max={3}
                  step={0.1}
                  disabled={!hasImage}
                />
                <Button
                  onClick={() =>
                    onApplyFilter('adjustSaturation', {
                      amount: colorParams.saturation,
                    })
                  }
                  disabled={!hasImage}
                  size="sm"
                  className="w-full"
                >
                  Apply Saturation
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Hue Shift: {colorParams.hue}°</Label>
                <Slider
                  value={[colorParams.hue]}
                  onValueChange={([value]) =>
                    setColorParams({ ...colorParams, hue: value })
                  }
                  min={-180}
                  max={180}
                  step={1}
                  disabled={!hasImage}
                />
                <Button
                  onClick={() =>
                    onApplyFilter('adjustHue', { amount: colorParams.hue })
                  }
                  disabled={!hasImage}
                  size="sm"
                  className="w-full"
                >
                  Apply Hue
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Effects</h3>
              <Button
                onClick={() => onApplyFilter('invert')}
                disabled={!hasImage}
                size="sm"
                className="w-full"
              >
                Invert Colors
              </Button>
              <Button
                onClick={() => onApplyFilter('sepia')}
                disabled={!hasImage}
                size="sm"
                className="w-full"
              >
                Sepia Tone
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Color Picker</h3>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value)}
                  className="w-20 h-10"
                  disabled={!hasImage}
                />
                <Input
                  type="text"
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value)}
                  className="flex-1"
                  placeholder="#ffffff"
                  disabled={!hasImage}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="segment" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Threshold Segmentation</h3>
              <div className="space-y-2">
                <Label>Threshold: {segmentationParams.threshold}</Label>
                <Slider
                  value={[segmentationParams.threshold]}
                  onValueChange={([value]) =>
                    setSegmentationParams({
                      ...segmentationParams,
                      threshold: value,
                    })
                  }
                  min={0}
                  max={255}
                  step={1}
                  disabled={!hasImage}
                />
                <Button
                  onClick={() =>
                    onApplyFilter('threshold', {
                      threshold: segmentationParams.threshold,
                    })
                  }
                  disabled={!hasImage}
                  size="sm"
                  className="w-full"
                >
                  Apply Threshold
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => onApplyFilter('otsuThreshold')}
                disabled={!hasImage}
                size="sm"
                className="w-full"
              >
                Otsu's Threshold
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Adaptive Threshold</h3>
              <div className="space-y-2">
                <Label>Block Size: {segmentationParams.adaptiveBlockSize}</Label>
                <Slider
                  value={[segmentationParams.adaptiveBlockSize]}
                  onValueChange={([value]) =>
                    setSegmentationParams({
                      ...segmentationParams,
                      adaptiveBlockSize: value,
                    })
                  }
                  min={3}
                  max={31}
                  step={2}
                  disabled={!hasImage}
                />
                <Label>C: {segmentationParams.adaptiveC}</Label>
                <Slider
                  value={[segmentationParams.adaptiveC]}
                  onValueChange={([value]) =>
                    setSegmentationParams({
                      ...segmentationParams,
                      adaptiveC: value,
                    })
                  }
                  min={-10}
                  max={10}
                  step={1}
                  disabled={!hasImage}
                />
                <Button
                  onClick={() =>
                    onApplyFilter('adaptiveThreshold', {
                      blockSize: segmentationParams.adaptiveBlockSize,
                      c: segmentationParams.adaptiveC,
                    })
                  }
                  disabled={!hasImage}
                  size="sm"
                  className="w-full"
                >
                  Apply Adaptive Threshold
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">K-Means Segmentation</h3>
              <div className="space-y-2">
                <Label>K: {segmentationParams.kMeansK}</Label>
                <Slider
                  value={[segmentationParams.kMeansK]}
                  onValueChange={([value]) =>
                    setSegmentationParams({ ...segmentationParams, kMeansK: value })
                  }
                  min={2}
                  max={10}
                  step={1}
                  disabled={!hasImage}
                />
                <Button
                  onClick={() =>
                    onApplyFilter('kMeansSegmentation', {
                      k: segmentationParams.kMeansK,
                    })
                  }
                  disabled={!hasImage}
                  size="sm"
                  className="w-full"
                >
                  Apply K-Means
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}