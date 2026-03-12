"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const ACCEPT = "image/*";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function ImageCropperClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [cropArea, setCropArea] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [aspectRatio, setAspectRatio] = useState("");
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);

  const imageRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        try { safeRevokeObjectURL(previewUrl); } catch { };
      }
      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { };
      }
    };
  }, [previewUrl, downloadUrl]);

  const handleFiles = useCallback((incomingFiles) => {
    setError("");
    if (!incomingFiles?.length) {
      setFile(null);
      setPreviewUrl(null);
      setDownloadUrl(null);
      return;
    }

    const selected = incomingFiles[0];
    if (selected.size > MAX_FILE_SIZE) {
      setError("File too large. Please use images under 50MB for client-side processing.");
      return;
    }

    if (previewUrl) {
      try { safeRevokeObjectURL(previewUrl); } catch { };
    }

    const newPreviewUrl = safeCreateObjectURL(selected);
    setFile(selected);
    setPreviewUrl(newPreviewUrl);
    setDownloadUrl(null);
    setCropArea({ x: 10, y: 10, width: 80, height: 80 });
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
  }, [previewUrl]);

  const handleImageLoad = () => {
    // Image loaded
  };

  const handleCrop = async () => {
    if (!file || !imageRef.current) {
      setError("Please upload an image and define a crop area.");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const imgWidth = imageRef.current.naturalWidth;
      const imgHeight = imageRef.current.naturalHeight;

      const cropX = (cropArea.x / 100) * imgWidth;
      const cropY = (cropArea.y / 100) * imgHeight;
      const cropWidth = (cropArea.width / 100) * imgWidth;
      const cropHeight = (cropArea.height / 100) * imgHeight;

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.drawImage(
        imageRef.current,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );

      const croppedBlob = await new Promise(resolve => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!croppedBlob) {
        setError("Failed to crop the image. Please try again.");
        return;
      }

      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { };
      }
      const newDownloadUrl = safeCreateObjectURL(croppedBlob);
      setDownloadUrl(newDownloadUrl);

      setError("");
    } catch {
      setError("Failed to crop the image. Please try again with a different file.");
    }
  };

  const resetCrop = () => {
    setCropArea({ x: 10, y: 10, width: 80, height: 80 });
  };

  const toolName = "Image Cropper";
  const toolDescription = "Crop images to custom dimensions or predefined aspect ratios. Adjust, rotate, and flip images directly in your browser without uploading to a server.";
  const steps = [
    "Upload an image file via drag & drop or file picker",
    "Define the crop area using the visual editor or manual input",
    "Apply transformations like rotation or flipping if desired",
    "Crop the image and download the result"
  ];
  const faqs = [
    {
      question: "Is my image uploaded to a server?",
      answer: "No. All image processing happens securely in your browser. Your image never leaves your device."
    },
    {
      question: "What image formats are supported?",
      answer: "This tool supports all common image formats including JPG, PNG, WebP, GIF, BMP, and others that browsers can render."
    },
    {
      question: "Can I maintain aspect ratios while cropping?",
      answer: "Yes. You can select predefined aspect ratios like 1:1 (square), 4:3, 16:9 or maintain the original image ratio while cropping."
    }
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image Cropper", href: "/image-cropper" },
      ]}
      currentTool="image-cropper"
    >
      <div className="space-y-6">
        <FileDropzone
          accept={ACCEPT}
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload image file"
          description="All common image formats (max 50MB)"
          maxSize={MAX_FILE_SIZE}
        />

        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}

        {previewUrl && (
          <div className="space-y-6">
            {/* Image editing controls */}
            <div className="p-4 bg-background dark:bg-background rounded-none space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="block text-sm font-medium mb-2">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Free-form</SelectItem>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                      <SelectItem value="4:3">4:3 (Photo)</SelectItem>
                      <SelectItem value="3:2">3:2 (Classic)</SelectItem>
                      <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rotation" className="block text-sm font-medium mb-2">Rotation</Label>
                  <Select value={rotation.toString()} onValueChange={(val) => setRotation(Number(val))}>
                    <SelectTrigger id="rotation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0°</SelectItem>
                      <SelectItem value="90">90°</SelectItem>
                      <SelectItem value="180">180°</SelectItem>
                      <SelectItem value="270">270°</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-2">Flip</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={flipHorizontal ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFlipHorizontal(!flipHorizontal)}
                    >
                      H
                    </Button>
                    <Button
                      variant={flipVertical ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFlipVertical(!flipVertical)}
                    >
                      V
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-2">Actions</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={resetCrop}>
                      Reset
                    </Button>
                    <Button size="sm" onClick={handleCrop}>
                      Crop Image
                    </Button>
                  </div>
                </div>
              </div>

              {/* Manual crop dimensions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div>
                  <Label htmlFor="cropX" className="block text-sm font-medium mb-1">X%</Label>
                  <Input
                    id="cropX"
                    type="number"
                    min="0"
                    max="100"
                    value={cropArea.x}
                    onChange={(e) => setCropArea(prev => ({
                      ...prev,
                      x: Math.max(0, Math.min(100 - prev.width, Number(e.target.value)))
                    }))}
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="cropY" className="block text-sm font-medium mb-1">Y%</Label>
                  <Input
                    id="cropY"
                    type="number"
                    min="0"
                    max="100"
                    value={cropArea.y}
                    onChange={(e) => setCropArea(prev => ({
                      ...prev,
                      y: Math.max(0, Math.min(100 - prev.height, Number(e.target.value)))
                    }))}
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="cropWidth" className="block text-sm font-medium mb-1">Width%</Label>
                  <Input
                    id="cropWidth"
                    type="number"
                    min="5"
                    max="100"
                    value={cropArea.width}
                    onChange={(e) => setCropArea(prev => ({
                      ...prev,
                      width: Math.max(5, Math.min(100 - prev.x, Number(e.target.value)))
                    }))}
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="cropHeight" className="block text-sm font-medium mb-1">Height%</Label>
                  <Input
                    id="cropHeight"
                    type="number"
                    min="5"
                    max="100"
                    value={cropArea.height}
                    onChange={(e) => setCropArea(prev => ({
                      ...prev,
                      height: Math.max(5, Math.min(100 - prev.y, Number(e.target.value)))
                    }))}
                    className="w-full text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Image preview with crop overlay */}
            <div className="flex justify-center">
              <div className="relative border border-border bg-background overflow-hidden inline-block" style={{ maxHeight: '60vh' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Preview"
                  onLoad={handleImageLoad}
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
                    maxWidth: '100%',
                    maxHeight: '60vh',
                    display: 'block'
                  }}
                />

                {/* Simple crop overlay visualization */}
                <div
                  className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none"
                  style={{
                    left: `${cropArea.x}%`,
                    top: `${cropArea.y}%`,
                    width: `${cropArea.width}%`,
                    height: `${cropArea.height}%`
                  }}
                />
              </div>
            </div>

            {downloadUrl && (
              <div className="flex justify-center p-4 bg-muted rounded-none border border-border">
                <div className="text-center space-y-3">
                  <p className="text-foreground font-medium">Image cropped successfully!</p>
                  <Button asChild variant="success" size="lg">
                    <a href={downloadUrl} download={`cropped-${file.name}`}>
                      Download Cropped Image
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
