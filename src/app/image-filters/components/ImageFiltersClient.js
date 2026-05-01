"use client";

import React, { useState, useRef } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, RotateCcw } from "lucide-react";

const defaultFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  blur: 0,
  hueRotate: 0,
};

export default function ImageFiltersClient() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
        const img = new Image();
        img.onload = () => setImage(img);
        img.src = event.target.result;
        setFilters(defaultFilters);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getFilterString = () => {
    return `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) invert(${filters.invert}%) blur(${filters.blur}px) hue-rotate(${filters.hueRotate}deg)`;
  };

  const downloadImage = () => {
    if (!image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;

    // Apply filters
    ctx.filter = getFilterString();
    ctx.drawImage(image, 0, 0);

    const link = document.createElement("a");
    link.download = "filtered-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <ToolPageLayout
      title="Image Filters"
      subtitle="Apply artistic filters and adjustments to your photos."
      toolName="Image Filters"
      toolDescription="Enhance your images with brightness, contrast, saturation, and artistic filters like sepia and grayscale. All processing happens in your browser."
      currentTool="image-filters"
      steps={[
        "Upload an image.",
        "Adjust the sliders to apply filters.",
        "Download the enhanced image."
      ]}
      faqs={[
        {
          question: "Does this reduce image quality?",
          answer: "No, we process the image at its original resolution using your browser's canvas capabilities."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image Filters", href: "/image-filters" }
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
        <div className="space-y-6 h-fit overflow-y-auto max-h-[800px] pr-2">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Adjustments</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(defaultFilters)}
                className="h-8 px-2 text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" /> Reset
              </Button>
            </div>

            <FilterSlider
              label="Brightness"
              value={filters.brightness}
              min={0} max={200}
              onChange={(v) => updateFilter("brightness", v)}
            />
            <FilterSlider
              label="Contrast"
              value={filters.contrast}
              min={0} max={200}
              onChange={(v) => updateFilter("contrast", v)}
            />
            <FilterSlider
              label="Saturation"
              value={filters.saturation}
              min={0} max={200}
              onChange={(v) => updateFilter("saturation", v)}
            />
            <FilterSlider
              label="Grayscale"
              value={filters.grayscale}
              min={0} max={100}
              onChange={(v) => updateFilter("grayscale", v)}
            />
            <FilterSlider
              label="Sepia"
              value={filters.sepia}
              min={0} max={100}
              onChange={(v) => updateFilter("sepia", v)}
            />
            <FilterSlider
              label="Invert"
              value={filters.invert}
              min={0} max={100}
              onChange={(v) => updateFilter("invert", v)}
            />
            <FilterSlider
              label="Blur"
              value={filters.blur}
              min={0} max={20}
              onChange={(v) => updateFilter("blur", v)}
            />
            <FilterSlider
              label="Hue Rotate"
              value={filters.hueRotate}
              min={0} max={360}
              onChange={(v) => updateFilter("hueRotate", v)}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-2 border-dashed rounded-none p-8 text-center bg-muted/10 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
            {!preview ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Upload image for filters"
                />
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                  <div className="p-4 rounded-none bg-muted">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Click or drag image to upload</p>
                    <p className="text-sm">Supports JPG, PNG, WebP</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  style={{ filter: getFilterString() }}
                  className="max-w-full max-h-[600px] object-contain rounded-none shadow-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4 z-20"
                  onClick={() => {
                    setPreview(null);
                    setImage(null);
                  }}
                >
                  Change Image
                </Button>
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

function FilterSlider({ label, value, min, max, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <Label className="font-normal text-muted-foreground">{label}</Label>
        <span className="font-mono text-xs">{value}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(vals) => onChange(vals[0])}
      />
    </div>
  );
}
