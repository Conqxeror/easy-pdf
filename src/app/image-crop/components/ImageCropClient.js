"use client";

import React, { useState, useRef, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ACCEPT = "image/*"; // Accept all image formats
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB guard

export default function ImageCropClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [cropArea, setCropArea] = useState({ x: 10, y: 10, width: 80, height: 80 }); // As percentages
  const [aspectRatio, setAspectRatio] = useState("");
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });

  const imageRef = useRef(null);
  const containerRef = useRef(null);

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

  const handleFiles = (incomingFiles) => {
    setError("");
    if (!incomingFiles?.length) {
      setFile(null);
      setPreviewUrl(null);
      setDownloadUrl(null);
      setOriginalDimensions({ width: 0, height: 0 });
      return;
    }

    const selected = incomingFiles[0];
    if (selected.size > MAX_FILE_SIZE) {
      setError("File too large. Please use images under 50MB for client-side processing.");
      return;
    }

    if (!selected.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setFile(selected);

    // Create new preview URL
    if (previewUrl) {
      try { safeRevokeObjectURL(previewUrl); } catch { };
    }
    const newPreviewUrl = safeCreateObjectURL(selected);
    setPreviewUrl(newPreviewUrl);
    setDownloadUrl(null);
    setCropArea({ x: 10, y: 10, width: 80, height: 80 }); // Reset to default crop area
  };

  const handleImageLoad = (e) => {
    if (e.target) {
      const { naturalWidth, naturalHeight } = e.target;
      setOriginalDimensions({ width: naturalWidth, height: naturalHeight });
    }
  };

  const handleCrop = async () => {
    if (!file || !imageRef.current) {
      setError("Please upload an image file first.");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Get image dimensions
      const imgWidth = imageRef.current.naturalWidth;
      const imgHeight = imageRef.current.naturalHeight;

      // Calculate crop coordinates in pixels
      const cropX = (cropArea.x / 100) * imgWidth;
      const cropY = (cropArea.y / 100) * imgHeight;
      const cropWidth = (cropArea.width / 100) * imgWidth;
      const cropHeight = (cropArea.height / 100) * imgHeight;

      // Set canvas dimensions to the crop size
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Draw the cropped portion of the image onto the canvas
      ctx.drawImage(
        imageRef.current,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );

      // Convert canvas to blob
      const croppedBlob = await new Promise(resolve => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!croppedBlob) {
        setError("Failed to crop the image. Please try again.");
        return;
      }

      // Create download URL
      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { };
      }
      const newDownloadUrl = safeCreateObjectURL(croppedBlob);
      setDownloadUrl(newDownloadUrl);

      setError("");
    } catch (err) {
      console.error("Image cropping failed", err);
      setError("Failed to crop the image. Please try again with a different file.");
    }
  };

  const handleAspectRatioChange = (ratio) => {
    setAspectRatio(ratio);
    if (ratio && originalDimensions.width && aspectRatio !== ratio) {
      // Calculate new height based on the specified aspect ratio
      const [widthRatio, heightRatio] = ratio.split(":").map(Number);
      const ratioValue = widthRatio / heightRatio;

      // Keep the crop area within bounds
      const maxWidth = 100 - cropArea.x;
      const calculatedWidth = Math.min(maxWidth, 80); // Default width 80% if under bound
      const calculatedHeight = calculatedWidth / ratioValue;

      setCropArea(prev => ({
        ...prev,
        width: calculatedWidth,
        height: Math.min(100 - prev.y, calculatedHeight)
      }));
    }
  };

  const toolName = "Image Cropper";
  const toolDescription = "Crop images to custom dimensions or predefined aspect ratios. Adjust, rotate, and flip images directly in your browser without uploading to a server.";
  const steps = [
    "Upload an image file via drag & drop or the file picker",
    "Define your crop area using the visual editor or manual inputs",
    "Apply transformations if needed",
    "Crop the image and download the result"
  ];
  const faqs = [
    {
      question: "Does this tool require server processing?",
      answer: "No. All image processing happens in your browser using canvas. Your image never leaves your device."
    },
    {
      question: "What image formats are supported?",
      answer: "This tool supports all common image formats including JPG, PNG, WebP, GIF, and others that browsers can render."
    },
    {
      question: "Can I maintain aspect ratios while cropping?",
      answer: "Yes. You can select predefined aspect ratios (square, 4:3, 16:9) or maintain the original image ratio while cropping."
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
            {/* Crop options */}
            <div className="p-4 bg-background dark:bg-background rounded-none space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aspect-ratio" className="block text-sm font-medium mb-2">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
                    <SelectTrigger id="aspect-ratio">
                      <SelectValue placeholder="Free-form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Free-form</SelectItem>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                      <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                      <SelectItem value="3:2">3:2 (Classic Photo)</SelectItem>
                      <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                      <SelectItem value="9:16">9:16 (Vertical Video)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="cropX" className="block text-sm font-medium mb-1">X% ({cropArea.x}%)</Label>
                  <Input
                    id="cropX"
                    type="range"
                    min="0"
                    max="100"
                    value={cropArea.x}
                    onChange={(e) => setCropArea(prev => ({
                      ...prev,
                      x: Math.max(0, Math.min(100 - prev.width, Number(e.target.value)))
                    }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="cropY" className="block text-sm font-medium mb-1">Y% ({cropArea.y}%)</Label>
                  <Input
                    id="cropY"
                    type="range"
                    min="0"
                    max="100"
                    value={cropArea.y}
                    onChange={(e) => setCropArea(prev => ({
                      ...prev,
                      y: Math.max(0, Math.min(100 - prev.height, Number(e.target.value)))
                    }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="cropWidth" className="block text-sm font-medium mb-1">Width% ({cropArea.width}%)</Label>
                  <Input
                    id="cropWidth"
                    type="range"
                    min="5"
                    max="100"
                    value={cropArea.width}
                    onChange={(e) => setCropArea(prev => ({
                      ...prev,
                      width: Math.max(5, Math.min(100 - prev.x, Number(e.target.value)))
                    }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="cropHeight" className="block text-sm font-medium mb-1">Height% ({cropArea.height}%)</Label>
                  <Input
                    id="cropHeight"
                    type="range"
                    min="5"
                    max="100"
                    value={cropArea.height}
                    onChange={(e) => setCropArea(prev => ({
                      ...prev,
                      height: Math.max(5, Math.min(100 - prev.y, Number(e.target.value)))
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Image preview with crop overlay */}
            <div className="flex justify-center">
              <div
                ref={containerRef}
                className="relative border border-border bg-background overflow-hidden inline-block"
                style={{ maxHeight: '60vh' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Preview"
                  onLoad={handleImageLoad}
                  style={{
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

            <div className="flex justify-center gap-4">
              <Button onClick={handleCrop} size="lg">
                Crop Image
              </Button>
              {downloadUrl && (
                <Button asChild variant="success" size="lg">
                  <a href={downloadUrl} download={`cropped-${file.name}`}>
                    Download Result
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
