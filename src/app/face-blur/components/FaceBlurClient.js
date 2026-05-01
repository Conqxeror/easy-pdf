"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2, AlertCircle, EyeOff } from "lucide-react";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";
import { toast } from "sonner";

export default function FaceBlurClient() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [faceDetector, setFaceDetector] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
            delegate: "GPU"
          },
          runningMode: "IMAGE"
        });
        setFaceDetector(detector);
      } catch {
        toast.error("Failed to load AI model. Please refresh the page.");
        setError("Failed to load AI model. Please refresh the page.");
      }
    };
    loadModel();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (image) safeRevokeObjectURL(image);
      const url = safeCreateObjectURL(file);
      setImage(url);
      setProcessedImage(null);
      setError(null);
      if (faceDetector) {
        processImage(url, faceDetector);
      }
    }
  };

  const processImage = async (imageUrl, detector) => {
    setIsProcessing(true);
    try {
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const detections = detector.detect(img);

      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Blur faces
      detections.detections.forEach((detection) => {
        const { originX, originY, width, height } = detection.boundingBox;

        // Extract face region
        const faceData = ctx.getImageData(originX, originY, width, height);

        // Apply blur (simple pixelation for now, or gaussian blur)
        // Let's do pixelation as it's easier and effective
        const pixelSize = Math.max(5, Math.floor(width / 10));

        for (let y = 0; y < height; y += pixelSize) {
          for (let x = 0; x < width; x += pixelSize) {
            // Get average color of the block
            let r = 0, g = 0, b = 0, count = 0;

            for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
              for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
                const i = ((y + dy) * width + (x + dx)) * 4;
                r += faceData.data[i];
                g += faceData.data[i + 1];
                b += faceData.data[i + 2];
                count++;
              }
            }

            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            // Fill block
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(originX + x, originY + y, pixelSize, pixelSize);
          }
        }
      });

      setProcessedImage(canvas.toDataURL("image/png"));

      if (detections.detections.length === 0) {
        setError("No faces detected in the image.");
      }

    } catch {
      toast.error("Failed to process image.");
      setError("Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.download = "blurred-faces.png";
    link.href = processedImage;
    link.click();
  };

  return (
    <ToolPageLayout
      title="Blur Faces"
      subtitle="Automatically detect and blur faces in photos."
      toolName="Face Blur"
      toolDescription="Protect privacy by automatically blurring faces in your images using AI. Processing happens entirely in your browser."
      currentTool="face-blur"
      steps={[
        "Upload an image.",
        "AI detects faces automatically.",
        "Download the image with blurred faces."
      ]}
      faqs={[
        {
          question: "Is my photo uploaded?",
          answer: "No, face detection runs locally on your device."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Face Blur", href: "/face-blur" }
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input */}
        <div className="space-y-6">
          <div className="border-2 border-dashed rounded-none p-8 text-center bg-muted/10 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden hover:bg-muted/20 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isProcessing || !faceDetector}
              aria-label="Upload image for face blur"
            />
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <div className="p-4 rounded-none bg-muted">
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Click or drag image to upload</p>
                <p className="text-sm">Supports JPG, PNG, WebP</p>
                {!faceDetector && <p className="text-xs text-amber-500">Loading AI model...</p>}
              </div>
            </div>
          </div>

          {image && (
            <div className="relative rounded-none overflow-hidden border bg-muted/50 aspect-video flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Original" className="max-h-full max-w-full object-contain" />
            </div>
          )}
        </div>

        {/* Output */}
        <div className="space-y-6">
          <div className="border rounded-none p-8 text-center bg-muted/10 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Detecting and blurring faces...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : processedImage ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={processedImage} alt="Processed" className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <EyeOff className="w-10 h-10 opacity-20" />
                <p>Image with blurred faces will appear here</p>
              </div>
            )}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={downloadImage}
            disabled={!processedImage}
          >
            <Download className="w-4 h-4 mr-2" /> Download Image
          </Button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </ToolPageLayout>
  );
}
