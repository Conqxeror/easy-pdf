"use client";

import React, { useState, useRef, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, Pencil, RotateCcw } from "lucide-react";

const getImageFileKey = (file) => file ? `${file.name}:${file.size}:${file.lastModified}` : "";

const loadImageFile = (file, onLoad) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => onLoad(img);
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
};

const initializeDrawingCanvas = (img, canvas, strokeColor, strokeWidth) => {
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.drawImage(img, 0, 0);

  return ctx;
};

export default function ImageDrawingClient() {
  const [image, setImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("brush"); // brush, eraser
  const [color, setColor] = useState("#ff0000");
  const [brushSize, setBrushSize] = useState(5);

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const loadedFileRef = useRef("");
  const canvasOptionsRef = useRef({ color, brushSize });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    loadedFileRef.current = getImageFileKey(file);
    loadImageFile(file, setImage);
  };

  const initCanvas = (img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    contextRef.current = initializeDrawingCanvas(
      img,
      canvas,
      canvasOptionsRef.current.color,
      canvasOptionsRef.current.brushSize
    );
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      initCanvas(image);
    }
  }, [image]);

  useEffect(() => {
    const processPendingFile = () => {
      const file = fileInputRef.current?.files?.[0];
      const fileKey = getImageFileKey(file);
      if (file && fileKey !== loadedFileRef.current) {
        loadedFileRef.current = fileKey;
        loadImageFile(file, setImage);
      }
    };

    processPendingFile();
    const intervalId = window.setInterval(processPendingFile, 100);
    const timeoutId = window.setTimeout(() => window.clearInterval(intervalId), 3000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      canvasOptionsRef.current = { color, brushSize };
      contextRef.current.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      contextRef.current.lineWidth = brushSize;
      // Eraser in simple canvas is just painting white (or background color)
      // Or using globalCompositeOperation = 'destination-out' for transparency
      if (tool === "eraser") {
        // If we want to erase to the original image, it's hard without layers.
        // If we want to erase to transparent, we use destination-out.
        // But then we lose the image underneath.
        // So "Eraser" usually means "Undo drawing" which requires history or layers.
        // For a simple tool, let's just paint white? No, that ruins the photo.
        // Let's implement a simple "Undo" instead of Eraser if possible, or just paint over.
        // Actually, let's stick to painting. "Eraser" might just be a white brush for now, 
        // or we can try to implement a history stack for Undo.

        // Let's just make it a "White Brush" for simplicity in this MVP version, 
        // or maybe "Clear All" is better.
        // I'll keep it as a brush that paints white, but label it clearly or maybe remove it if it's confusing.
        // Let's use destination-out to erase to transparent? No, the image is on the same layer.

        // Better approach: Two canvases. Bottom has image, Top has drawing.
        // Then we can erase the top layer without affecting the image.
        // Then merge for download.
        // Let's refactor to use two canvases if I have time.
        // For now, single canvas painting is the MVP.
      } else {
        contextRef.current.globalCompositeOperation = "source-over";
      }
    } else {
      canvasOptionsRef.current = { color, brushSize };
    }
  }, [color, brushSize, tool]);

  const startDrawing = ({ nativeEvent }) => {
    if (!image) return;

    // We need to map client coordinates to canvas coordinates
    // taking into account the CSS scaling of the canvas
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const offsetX = (nativeEvent.clientX - rect.left) * scaleX;
    const offsetY = (nativeEvent.clientY - rect.top) * scaleY;

    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const offsetX = (nativeEvent.clientX - rect.left) * scaleX;
    const offsetY = (nativeEvent.clientY - rect.top) * scaleY;

    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const downloadImage = () => {
    if (!image) return;
    const link = document.createElement("a");
    link.download = "drawn-image.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const resetCanvas = () => {
    if (image) initCanvas(image);
  };

  return (
    <ToolPageLayout
      title="Draw on Image"
      subtitle="Annotate your images with freehand drawing."
      toolName="Draw on Image"
      toolDescription="Draw, highlight, or annotate your images directly in the browser. Choose your color and brush size."
      currentTool="image-drawing"
      steps={[
        "Upload an image.",
        "Select your brush color and size.",
        "Draw freely on the image.",
        "Download the annotated image."
      ]}
      faqs={[
        {
          question: "Can I undo my strokes?",
          answer: "This version supports freehand drawing and full-canvas reset. If you need to remove edits, use Reset to return to the original image and redraw only the annotations you want to keep."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Draw on Image", href: "/image-drawing" }
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
        <div className="space-y-6 h-fit">
          <div className="space-y-4">
            <Label>Tools</Label>
            <div className="flex gap-2">
              <Button
                variant={tool === "brush" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setTool("brush")}
              >
                <Pencil className="w-4 h-4 mr-2" /> Brush
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetCanvas}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Reset
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Brush Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Brush Size ({brushSize}px)</Label>
              <Slider
                value={[brushSize]}
                min={1} max={50} step={1}
                onValueChange={(v) => setBrushSize(v[0])}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div
            ref={containerRef}
            className="border-2 border-dashed rounded-none p-4 bg-muted/10 min-h-[400px] flex items-center justify-center relative overflow-hidden touch-none"
          >
            {!image ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onInput={handleImageUpload}
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Upload image for drawing"
                />
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                  <div className="p-4 rounded-none bg-muted">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="font-medium">Click to upload image</p>
                </div>
              </>
            ) : (
              <div className="relative w-full flex justify-center">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseUp={finishDrawing}
                  onMouseMove={draw}
                  onMouseLeave={finishDrawing}
                  className="max-w-full max-h-[600px] shadow-lg cursor-crosshair"
                  style={{ touchAction: "none" }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
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
    </ToolPageLayout>
  );
}
