"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download } from "lucide-react";

export default function ImageTextOverlayClient() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("Your Text Here");
  const [options, setOptions] = useState({
    x: 50,
    y: 50,
    fontSize: 40,
    color: "#ffffff",
    fontFamily: "Arial",
    opacity: 100,
  });
  const canvasRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          // Center text initially
          setOptions(prev => ({
            ...prev,
            x: img.width / 2,
            y: img.height / 2
          }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw image
    ctx.drawImage(image, 0, 0);

    // Configure text
    ctx.font = `${options.fontSize}px ${options.fontFamily}`;
    ctx.fillStyle = options.color;
    ctx.globalAlpha = options.opacity / 100;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw text
    ctx.fillText(text, options.x, options.y);

    // Update preview
    setPreviewUrl(canvas.toDataURL());
  }, [image, text, options]);

  useEffect(() => {
    if (image && canvasRef.current) {
      renderCanvas();
    }
  }, [image, renderCanvas]);

  const downloadImage = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = "image-with-text.png";
    link.href = previewUrl;
    link.click();
  };

  // Simple drag handler for the preview (mapping screen coords to canvas coords)
  // This is tricky without a proper library, so we'll stick to sliders for X/Y for MVP stability
  // But we can add a click handler to position text
  const handleCanvasClick = (e) => {
    if (!image) return;
    const rect = e.target.getBoundingClientRect();
    const scaleX = image.width / rect.width;
    const scaleY = image.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setOptions(prev => ({ ...prev, x, y }));
  };

  return (
    <ToolPageLayout
      title="Add Text to Image"
      subtitle="Overlay text on your images with custom fonts and colors."
      toolName="Image Text Overlay"
      toolDescription="Easily add text captions, quotes, or watermarks to your photos. Customize font, size, color, and position."
      currentTool="image-text-overlay"
      steps={[
        "Upload an image.",
        "Type your text and adjust styling.",
        "Click on the image to position the text.",
        "Download the result."
      ]}
      faqs={[
        {
          question: "Can I add multiple text layers?",
          answer: "Currently, this tool supports a single text layer. For multiple layers, download the image and re-upload it."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Add Text to Image", href: "/image-text-overlay" }
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
        <div className="space-y-6 h-fit">
          <div className="space-y-4">
            <Label>Text Content</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
            />

            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={options.fontFamily}
                onValueChange={(v) => setOptions(prev => ({ ...prev, fontFamily: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Impact">Impact</SelectItem>
                  <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size ({options.fontSize}px)</Label>
              <Slider
                value={[options.fontSize]}
                min={10} max={200} step={1}
                onValueChange={(v) => setOptions(prev => ({ ...prev, fontSize: v[0] }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={options.color}
                  onChange={(e) => setOptions(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={options.color}
                  onChange={(e) => setOptions(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Opacity ({options.opacity}%)</Label>
              <Slider
                value={[options.opacity]}
                min={0} max={100} step={1}
                onValueChange={(v) => setOptions(prev => ({ ...prev, opacity: v[0] }))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-2 border-dashed rounded-none p-4 bg-muted/10 min-h-[400px] flex items-center justify-center relative overflow-hidden">
            {!image ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Upload image for text overlay"
                />
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                  <div className="p-4 rounded-none bg-muted">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="font-medium">Click to upload image</p>
                </div>
              </>
            ) : (
              <div className="relative max-w-full max-h-[600px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[600px] object-contain rounded-none shadow-lg cursor-crosshair"
                  onClick={handleCanvasClick}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImage(null);
                    setPreviewUrl(null);
                  }}
                >
                  Change Image
                </Button>
                <div className="absolute bottom-2 left-2 bg-background/50 text-foreground text-xs px-2 py-1 rounded-none pointer-events-none">
                  Click image to position text
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={downloadImage} disabled={!image}>
              <Download className="w-4 h-4 mr-2" /> Download Image
            </Button>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </ToolPageLayout>
  );
}
