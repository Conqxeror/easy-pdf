"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";
import { removeBackground } from "@imgly/background-removal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";

export default function RemoveBackgroundClient() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (image) safeRevokeObjectURL(image);
      setImage(safeCreateObjectURL(file));
      setProcessedImage(null);
      setError(null);
      processImage(file);
    }
  };

  const processImage = async (file) => {
    setIsProcessing(true);
    setError(null);
    try {
      // Using default configuration which fetches models from CDN
      const blob = await removeBackground(file);
      const url = safeCreateObjectURL(blob);
      setProcessedImage(url);
    } catch {
      toast.error("Failed to remove background. Please try another image.");
      setError("Failed to remove background. Please try another image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.download = "removed-background.png";
    link.href = processedImage;
    link.click();
  };

  return (
    <ToolPageLayout
      title="Remove Background"
      subtitle="Automatically remove background from images using AI."
      toolName="Remove Background"
      toolDescription="Remove image backgrounds instantly in your browser. No data leaves your device."
      currentTool="remove-background"
      steps={[
        "Upload an image.",
        "Wait for the AI to process the image.",
        "Download the transparent PNG."
      ]}
      faqs={[
        {
          question: "Is my image uploaded to a server?",
          answer: "No, all processing happens locally in your browser using WebAssembly."
        },
        {
          question: "What image formats are supported?",
          answer: "We support JPG, PNG, and WebP formats."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Remove Background", href: "/remove-background" }
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="border-2 border-dashed rounded-none p-8 text-center bg-muted/10 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden hover:bg-muted/20 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isProcessing}
              aria-label="Upload image for background removal"
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
          </div>

          {image && (
            <div className="relative rounded-none overflow-hidden border bg-muted/50 aspect-video flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Original" className="max-h-full max-w-full object-contain" />
              <div className="absolute top-2 left-2 bg-background/50 text-foreground text-xs px-2 py-1 rounded-none">Original</div>
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <div className="border rounded-none p-8 text-center bg-muted/10 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary-foreground" />
                <p className="text-muted-foreground">Removing background... (this may take a moment)</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : processedImage ? (
              <div className="relative w-full h-full flex items-center justify-center bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[length:20px_20px] bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={processedImage} alt="Processed" className="max-h-full max-w-full object-contain relative z-10" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <ImageIcon className="w-10 h-10 opacity-20" />
                <p>Processed image will appear here</p>
              </div>
            )}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={downloadImage}
            disabled={!processedImage}
          >
            <Download className="w-4 h-4 mr-2" /> Download Transparent Image
          </Button>
        </div>
      </div>
    </ToolPageLayout>
  );
}
