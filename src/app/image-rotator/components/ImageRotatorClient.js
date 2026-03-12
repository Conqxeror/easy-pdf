"use client";

import React, { useState, useRef, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, RotateCw } from "lucide-react";

const ACCEPT = "image/*"; // Accept all image formats
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB guard

export default function ImageRotatorClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [outputFormat, setOutputFormat] = useState("jpg");
  const [quality, setQuality] = useState(90); // For JPEG output

  const imageRef = useRef(null);

  useEffect(() => {
    return () => {
      // Clean up object URLs on unmount
      if (previewUrl) {
        try { safeRevokeObjectURL(previewUrl); } catch { };
      }
      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { };
      }
    };
  }, [previewUrl, downloadUrl]);

  const handleFiles = (files) => {
    setError("");
    if (!files?.length) {
      setFile(null);
      setPreviewUrl(null);
      setDownloadUrl(null);
      return;
    }

    const selected = files[0];
    if (selected.size > MAX_FILE_SIZE) {
      setError("File too large. Please use images under 50MB for client-side processing.");
      return;
    }

    if (!selected.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setFile(selected);

    // Create preview URL
    if (previewUrl) {
      try { safeRevokeObjectURL(previewUrl); } catch { };
    }
    const newPreviewUrl = safeCreateObjectURL(selected);
    setPreviewUrl(newPreviewUrl);
    setDownloadUrl(null);
  };

  const rotateImage = async () => {
    if (!file || !imageRef.current) {
      setError("Please upload an image file first.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Get the original image dimensions
      const imgWidth = imageRef.current.naturalWidth;
      const imgHeight = imageRef.current.naturalHeight;

      // For rotation, we may need to adjust canvas size to fit rotated image
      // If rotating by 90 or 270 degrees, the canvas dimensions change
      if (rotationAngle % 180 === 0) {
        // 0, 180, 360 degree rotations - keep original dimensions
        canvas.width = imgWidth;
        canvas.height = imgHeight;
      } else {
        // 90, 270 degree rotations - swap width and height
        canvas.width = imgHeight;
        canvas.height = imgWidth;
      }

      // Clear the canvas
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Translate to center, rotate, then translate back
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotationAngle * Math.PI) / 180); // Convert degrees to radians
      ctx.drawImage(
        imageRef.current,
        -imgWidth / 2,
        -imgHeight / 2,
        imgWidth,
        imgHeight
      );
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Convert canvas to blob based on output format
      const rotatedBlob = await new Promise(resolve => {
        if (outputFormat === "png") {
          canvas.toBlob(resolve, "image/png", 1.0);
        } else if (outputFormat === "webp") {
          canvas.toBlob(resolve, "image/webp", quality / 100);
        } else {
          // Default to JPEG
          canvas.toBlob(resolve, "image/jpeg", quality / 100);
        }
      });

      if (!rotatedBlob) {
        setError("Failed to rotate the image. Please try again.");
        return;
      }

      // Create download URL
      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { };
      }
      const newDownloadUrl = safeCreateObjectURL(rotatedBlob);
      setDownloadUrl(newDownloadUrl);

      setError("");
    } catch {
      setError("Failed to rotate the image. Please try again with a different file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetRotation = () => {
    setRotationAngle(0);
  };

  const rotateClockwise = () => {
    setRotationAngle(prev => (prev + 90) % 360);
  };

  const rotateCounterClockwise = () => {
    setRotationAngle(prev => (prev - 90 + 360) % 360);
  };

  const toolName = "Image Rotator";
  const toolDescription = "Rotate images by custom angles or predefined rotations (90°, 180°, 270°). Adjust image orientation directly in your browser without uploading to a server.";
  const steps = [
    "Upload an image file via drag & drop or the file picker",
    "Select the rotation angle",
    "Rotate the image and download the result"
  ];
  const faqs = [
    {
      question: "Is my image uploaded to a server?",
      answer: "No. All image processing happens in your browser. Your image never leaves your device."
    },
    {
      question: "What image formats are supported?",
      answer: "This tool supports all common image formats including JPG, PNG, WebP, GIF, and others that browsers can render."
    },
    {
      question: "How much can I rotate an image?",
      answer: "You can rotate images by any angle (0-360°), or use the quick buttons for 90° increments."
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
        { label: "Image Rotator", href: "/image-rotator" },
      ]}
      currentTool="image-rotator"
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
            {/* Rotation controls */}
            <div className="p-4 bg-background dark:bg-background rounded-none space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rotationAngle" className="block text-sm font-medium mb-2">Rotation Angle (degrees)</Label>
                  <Input
                    id="rotationAngle"
                    type="number"
                    min="0"
                    max="360"
                    value={rotationAngle}
                    onChange={(e) => setRotationAngle(Number(e.target.value) % 360)}
                    className="w-full text-sm"
                  />
                  <p className="text-xs text-foreground mt-1">Enter angle in degrees (0-360)</p>
                </div>

                <div>
                  <Label htmlFor="outputFormat" className="block text-sm font-medium mb-2">Output Format</Label>
                  <Select value={outputFormat} onValueChange={setOutputFormat}>
                    <SelectTrigger id="outputFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpg">JPG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {outputFormat === "jpg" || outputFormat === "webp" ? (
                  <div>
                    <Label htmlFor="quality" className="block text-sm font-medium mb-2">Quality: {quality}%</Label>
                    <input
                      id="quality"
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div></div> // Empty div to maintain grid alignment
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={resetRotation}>
                  Reset to 0°
                </Button>
                <Button variant="outline" onClick={rotateCounterClockwise}>
                  <RotateCcw className="w-4 h-4 mr-2" /> -90°
                </Button>
                <Button variant="outline" onClick={rotateClockwise}>
                  <RotateCw className="w-4 h-4 mr-2" /> +90°
                </Button>
                <Button variant="outline" onClick={() => setRotationAngle((rotationAngle + 180) % 360)}>
                  +180°
                </Button>
              </div>
            </div>

            {/* Image preview */}
            <div className="flex justify-center">
              <div className="border border-border bg-background overflow-hidden inline-block" style={{ maxHeight: '60vh' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[60vh]"
                  style={{
                    transform: `rotate(${rotationAngle}deg)`,
                    transformOrigin: 'center center'
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={rotateImage} disabled={isProcessing}>
                {isProcessing ? 'Rotating...' : 'Rotate Image'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setDownloadUrl(null);
                  setError("");
                }}
              >
                Clear
              </Button>
            </div>

            {downloadUrl && file && (
              <div className="p-4 bg-muted border border-border rounded-none">
                <p className="font-semibold text-foreground">Image rotation complete!</p>
                <a
                  className="text-primary-foreground underline inline-block mt-2 px-4 py-2 bg-primary rounded-none hover:bg-primary/90 transition-colors"
                  href={downloadUrl}
                  download={`${sanitizeFileName(file.name.replace(/\.[^.]+$/, "")) || "rotated-image"}.${outputFormat}`}
                >
                  Download Rotated Image ({rotationAngle}°)
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
