"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, Image as ImageIcon } from "lucide-react";

export default function ImageWatermarkClient() {
  const [baseImage, setBaseImage] = useState(null);
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [options, setOptions] = useState({
    opacity: 50,
    scale: 30,
    x: 50,
    y: 50,
  });
  const canvasRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleBaseImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setBaseImage(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWatermarkUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setWatermarkImage(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = baseImage.width;
    canvas.height = baseImage.height;

    // Draw base image
    ctx.globalAlpha = 1;
    ctx.drawImage(baseImage, 0, 0);

    if (watermarkImage) {
      // Calculate watermark dimensions
      const scale = options.scale / 100;
      const wmWidth = watermarkImage.width * scale;
      const wmHeight = watermarkImage.height * scale;

      // Calculate position (percentage based)
      const x = (baseImage.width - wmWidth) * (options.x / 100);
      const y = (baseImage.height - wmHeight) * (options.y / 100);

      // Draw watermark
      ctx.globalAlpha = options.opacity / 100;
      ctx.drawImage(watermarkImage, x, y, wmWidth, wmHeight);
    }

    setPreviewUrl(canvas.toDataURL());
  }, [baseImage, watermarkImage, options]);

  useEffect(() => {
    if (baseImage && canvasRef.current) {
      renderCanvas();
    }
  }, [baseImage, renderCanvas]);

  const downloadImage = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = "watermarked-image.png";
    link.href = previewUrl;
    link.click();
  };

  return (
    <ToolPageLayout
      title="Add Watermark to Image"
      subtitle="Protect your images with a custom logo or watermark."
      toolName="Image Watermark"
      toolDescription="Overlay a logo or image watermark onto your photos. Adjust transparency, size, and position."
      currentTool="image-watermark"
      steps={[
        "Upload your main image.",
        "Upload your watermark image (PNG recommended).",
        "Adjust opacity, size, and position.",
        "Download the watermarked image."
      ]}
      faqs={[
        {
          question: "Does it support transparency?",
          answer: "Yes, if your watermark is a PNG with transparency, it will be preserved."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image Watermark", href: "/image-watermark" }
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
        <div className="space-y-6 h-fit">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Watermark Image</Label>
              <div className="border-2 border-dashed rounded-none p-4 text-center hover:bg-muted/50 relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleWatermarkUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {watermarkImage ? (
                  <div className="flex items-center gap-2 justify-center">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-sm truncate max-w-[150px]">Watermark Loaded</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Upload className="w-6 h-6" />
                    <span className="text-xs">Upload Logo/Image</span>
                  </div>
                )}
              </div>
            </div>

            {watermarkImage && (
              <>
                <div className="space-y-2">
                  <Label>Opacity ({options.opacity}%)</Label>
                  <Slider
                    value={[options.opacity]}
                    min={0} max={100} step={1}
                    onValueChange={(v) => setOptions(prev => ({ ...prev, opacity: v[0] }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Size ({options.scale}%)</Label>
                  <Slider
                    value={[options.scale]}
                    min={1} max={200} step={1}
                    onValueChange={(v) => setOptions(prev => ({ ...prev, scale: v[0] }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Position X ({options.x}%)</Label>
                  <Slider
                    value={[options.x]}
                    min={0} max={100} step={1}
                    onValueChange={(v) => setOptions(prev => ({ ...prev, x: v[0] }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Position Y ({options.y}%)</Label>
                  <Slider
                    value={[options.y]}
                    min={0} max={100} step={1}
                    onValueChange={(v) => setOptions(prev => ({ ...prev, y: v[0] }))}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-2 border-dashed rounded-none p-4 bg-muted/10 min-h-[400px] flex items-center justify-center relative overflow-hidden">
            {!baseImage ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBaseImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                  <div className="p-4 rounded-none bg-muted">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="font-medium">Click to upload main image</p>
                </div>
              </>
            ) : (
              <div className="relative max-w-full max-h-[600px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[600px] object-contain rounded-none shadow-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setBaseImage(null);
                    setPreviewUrl(null);
                  }}
                >
                  Change Image
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={downloadImage} disabled={!baseImage}>
              <Download className="w-4 h-4 mr-2" /> Download Image
            </Button>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </ToolPageLayout>
  );
}
