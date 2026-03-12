"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { loadPdfLib, loadPdfJs } from "@/lib/pdfjsWorker";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";

export default function WatermarkClient() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState("");

  // Watermark Settings
  const [watermarkType, setWatermarkType] = useState("text"); // 'text' | 'image'
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(50);
  const [opacity, setOpacity] = useState(0.5);
  const [rotation, setRotation] = useState(45);
  const [color, setColor] = useState("#FF0000");
  // const [position, setPosition] = useState("center"); // 'center', 'top-left', etc.

  const [imageFile, setImageFile] = useState(null);
  const [imageScale, setImageScale] = useState(0.5);

  // Preview
  const previewCanvasRef = useRef(null);
  const [pdfDocProxy, setPdfDocProxy] = useState(null);
  const renderTaskRef = useRef(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (pdfDocProxy) {
        try { pdfDocProxy.destroy(); } catch { }
      }
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch { }
      }
      if (watermarkedPdfUrl) {
        try { if (watermarkedPdfUrl && typeof URL !== 'undefined' && !String(watermarkedPdfUrl).startsWith('data:')) URL.revokeObjectURL(watermarkedPdfUrl); } catch { }
      }
    };
  }, [pdfDocProxy, watermarkedPdfUrl]);

  const handleFiles = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    setWatermarkedPdfUrl(null);

    if (pdfDocProxy) {
      try { pdfDocProxy.destroy(); } catch { }
      setPdfDocProxy(null);
    }

    if (newFiles.length === 0) return;

    try {
      const file = newFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await loadPdfJs();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setPdfDocProxy(pdf);
    } catch {
      setError("Failed to load PDF.");
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const renderPreview = useCallback(async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !pdfDocProxy) return;

    const context = canvas.getContext("2d");
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch { }
    }

    try {
      const page = await pdfDocProxy.getPage(1);
      const viewport = page.getViewport({ scale: 1 });

      // Fit to container width (max 600px)
      const containerWidth = Math.min(600, window.innerWidth - 40);
      const scale = containerWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;

      // Draw Watermark Overlay
      context.save();
      context.globalAlpha = opacity;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (watermarkType === "text" && text) {
        context.translate(centerX, centerY);
        context.rotate((rotation * Math.PI) / 180);
        context.font = `${fontSize * scale}px Helvetica`; // Scale font
        context.fillStyle = color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, 0, 0);
      } else if (watermarkType === "image" && imageFile) {
        const img = new Image();
        const imgUrl = safeCreateObjectURL(imageFile);
        img.src = imgUrl;
        await new Promise((resolve) => { img.onload = resolve; });
        safeRevokeObjectURL(imgUrl);

        const imgWidth = img.width * imageScale * scale;
        const imgHeight = img.height * imageScale * scale;

        context.translate(centerX, centerY);
        context.rotate((rotation * Math.PI) / 180);
        context.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
      }

      context.restore();

    } catch (e) {
      if (e.name !== "RenderingCancelledException") {
        toast.error("Preview render failed");
      }
    }
  }, [pdfDocProxy, watermarkType, text, fontSize, opacity, rotation, color, imageFile, imageScale]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  const handleApplyWatermark = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError("");

    try {
      const { PDFDocument, rgb, degrees, StandardFonts } = await loadPdfLib();
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let embeddedImage;
      if (watermarkType === "image" && imageFile) {
        const imageBytes = await imageFile.arrayBuffer();
        if (imageFile.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        }
      }

      pages.forEach((page) => {
        const { width, height } = page.getSize();

        if (watermarkType === "text") {
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          const textHeight = fontSize; // Approximate

          page.drawText(text, {
            x: width / 2 - textWidth / 2, // Center for now (simplified)
            y: height / 2 - textHeight / 2,
            size: fontSize,
            font: font,
            color: rgb(
              parseInt(color.slice(1, 3), 16) / 255,
              parseInt(color.slice(3, 5), 16) / 255,
              parseInt(color.slice(5, 7), 16) / 255
            ),
            opacity: opacity,
            rotate: degrees(rotation),
          });
        } else if (watermarkType === "image" && embeddedImage) {
          const imgDims = embeddedImage.scale(imageScale);

          page.drawImage(embeddedImage, {
            x: width / 2 - imgDims.width / 2,
            y: height / 2 - imgDims.height / 2,
            width: imgDims.width,
            height: imgDims.height,
            opacity: opacity,
            rotate: degrees(rotation),
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      let url = null;
      try { url = safeCreateObjectURL(blob); } catch { url = null; }
      setWatermarkedPdfUrl(url);

      const safeName = files[0].name.replace(/\.pdf$/i, "");
      setDownloadFileName(`${safeName}_watermarked.pdf`);

    } catch {
      toast.error("Failed to apply watermark.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Add Watermark to PDF"
      subtitle="Apply custom text or image watermarks to your PDF documents securely in your browser."
      toolName="Add Watermark to PDF"
      toolDescription="Protect your PDF documents or add important information by applying custom text or image watermarks. Our online tool allows you to easily add a watermark with adjustable position, opacity, rotation, and font settings (for text watermarks). Enhance document security and branding, all while keeping your files private with client-side processing."
      steps={[
        "Upload your PDF file.",
        "Choose 'Text' or 'Image' watermark.",
        "Customize the watermark settings (text, size, opacity, rotation).",
        "Preview the result.",
        "Click 'Add Watermark' and download."
      ]}
      faqs={[
        {
          question: "Is it free?",
          answer: "Yes, completely free."
        },
        {
          question: "Can I use an image?",
          answer: "Yes, PNG or JPG images are supported."
        }
      ]}
      currentTool="watermark"
    >
      <div className="space-y-8">
        <FileDropzone
          accept="application/pdf"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload PDF"
          description="Drag & drop or click to select a PDF file"
          isLoading={isProcessing}
        />

        {files.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Settings Panel */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <Tabs defaultValue="text" onValueChange={(v) => setWatermarkType(v)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Text Watermark</TabsTrigger>
                    <TabsTrigger value="image">Image Watermark</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4 mt-4">
                    <div>
                      <Label>Watermark Text</Label>
                      <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="CONFIDENTIAL"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Font Size</Label>
                        <Input
                          type="number"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-12 p-1 h-10"
                          />
                          <Input
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4 mt-4">
                    <div>
                      <Label>Upload Image</Label>
                      <Input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <div>
                      <Label>Scale: {imageScale}x</Label>
                      <Slider
                        value={[imageScale]}
                        min={0.1}
                        max={2}
                        step={0.1}
                        onValueChange={([v]) => setImageScale(v)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-4">
                  <div>
                    <Label>Opacity: {Math.round(opacity * 100)}%</Label>
                    <Slider
                      value={[opacity]}
                      min={0.1}
                      max={1}
                      step={0.1}
                      onValueChange={([v]) => setOpacity(v)}
                    />
                  </div>
                  <div>
                    <Label>Rotation: {rotation}°</Label>
                    <Slider
                      value={[rotation]}
                      min={0}
                      max={360}
                      step={15}
                      onValueChange={([v]) => setRotation(v)}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleApplyWatermark}
                  disabled={isProcessing}
                  className="w-full"
                  variant="success"
                >
                  {isProcessing ? "Processing..." : "Add Watermark"}
                </Button>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <div className="border border-border dark:border-border shadow-lg bg-background dark:bg-background p-2">
                <canvas ref={previewCanvasRef} className="max-w-full h-auto" />
              </div>
            </div>
          </div>
        )}

        {watermarkedPdfUrl && (
          <div className="mt-8 p-6 bg-muted border border-border text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">Success!</h3>
            <Button asChild size="lg" variant="success">
              <a href={watermarkedPdfUrl} download={downloadFileName}>
                Download Watermarked PDF
              </a>
            </Button>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
