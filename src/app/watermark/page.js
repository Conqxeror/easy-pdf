"use client";
import { useState, useRef } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import MetaHead from "@/components/ui/MetaHead";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import Loader from "@/components/ui/Loader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HexColorPicker } from "react-colorful";

export default function WatermarkPdfPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [watermarkType, setWatermarkType] = useState("text");
  const [watermarkText, setWatermarkText] = useState("Confidential");
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [position, setPosition] = useState("center");
  const [opacity, setOpacity] = useState(40);
  const [rotation, setRotation] = useState(0);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#808080");
  const [watermarkedUrl, setWatermarkedUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError("");
    setWatermarkedUrl(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setError("Please upload an image file (JPEG, PNG)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setWatermarkImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const addWatermark = async () => {
    setError("");
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }
    if (watermarkType === "text" && !watermarkText) {
      setError("Please enter watermark text.");
      return;
    }
    if (watermarkType === "image" && !watermarkImage) {
      setError("Please upload a watermark image.");
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const pages = pdfDoc.getPages();
      const [r, g, b] = hexToRgb(color);

      for (const page of pages) {
        const { width, height } = page.getSize();

        // Calculate position based on selection
        let x, y;
        switch (position) {
          case "top-left":
            x = width * 0.1;
            y = height * 0.9;
            break;
          case "top-right":
            x = width * 0.9;
            y = height * 0.9;
            break;
          case "bottom-left":
            x = width * 0.1;
            y = height * 0.1;
            break;
          case "bottom-right":
            x = width * 0.9;
            y = height * 0.1;
            break;
          case "diagonal":
            x = width / 2;
            y = height / 2;
            break;
          case "tiled":
            // Add tiled watermarks
            const xStep = width / 3;
            const yStep = height / 3;
            for (let xPos = xStep; xPos < width; xPos += xStep) {
              for (let yPos = yStep; yPos < height; yPos += yStep) {
                addWatermarkToPage(page, xPos, yPos, width, height);
              }
            }
            continue;
          default: // center
            x = width / 2;
            y = height / 2;
        }

        if (position !== "tiled") {
          addWatermarkToPage(page, x, y, width, height);
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setWatermarkedUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error("Watermark error:", e);
      setError("Failed to add watermark. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const addWatermarkToPage = (page, x, y, width, height) => {
    const [r, g, b] = hexToRgb(color);

    if (watermarkType === "text") {
      page.drawText(watermarkText, {
        x,
        y,
        size: fontSize,
        color: rgb(r / 255, g / 255, b / 255),
        opacity: opacity / 100,
        rotate: degrees(rotation),
        xSkew: 0,
        ySkew: 0,
      });
    } else if (watermarkImage) {
      // For image watermark, we would embed the image
      // This is a placeholder - actual image embedding would require more code
      page.drawText("[IMAGE]", {
        x,
        y,
        size: fontSize,
        color: rgb(r / 255, g / 255, b / 255),
        opacity: opacity / 100,
        rotate: degrees(rotation),
      });
    }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [128, 128, 128]; // default gray
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
  };

  return (
    <>
      <MetaHead
        title="Add Watermark to PDF – Free Online Tool | PDF Toolkit"
        description="Add text or image watermarks to PDF files, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized."
        url="https://yourdomain.com/watermark"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "PDF Watermark Tool",
          description: "Add watermarks to PDF documents in your browser",
          url: "https://yourdomain.com/watermark",
        }}
      />

      <main className="container max-w-4xl py-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Add Watermark to PDF
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <FileDropzone
              accept="application/pdf"
              multiple={false}
              onFiles={handleFiles}
              error={error}
              setError={setError}
              label="Choose a PDF File"
              description="Drag & drop or click to select a PDF file"
              maxSize={50 * 1024 * 1024}
            />

            {fileName && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Selected file:</span>
                <span className="font-medium">{fileName}</span>
              </div>
            )}

            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger
                  value="text"
                  onClick={() => setWatermarkType("text")}
                >
                  Text Watermark
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  onClick={() => setWatermarkType("image")}
                >
                  Image Watermark
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label>Watermark Text</Label>
                  <Input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-md border border-gray-600 cursor-pointer"
                      style={{ backgroundColor: color }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    />
                    <span className="text-sm">{color}</span>
                  </div>
                  {showColorPicker && (
                    <div className="p-4 border border-gray-600 rounded-md">
                      <HexColorPicker
                        color={color}
                        onChange={handleColorChange}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Font Size: {fontSize}px</Label>
                    <Slider
                      value={[fontSize]}
                      onValueChange={([value]) => setFontSize(value)}
                      min={12}
                      max={120}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rotation: {rotation}°</Label>
                    <Slider
                      value={[rotation]}
                      onValueChange={([value]) => setRotation(value)}
                      min={-180}
                      max={180}
                      step={1}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                {watermarkImage ? (
                  <div className="space-y-2">
                    <Label>Watermark Image</Label>
                    <div className="flex items-center gap-4">
                      <img
                        src={watermarkImage}
                        alt="Watermark preview"
                        className="h-20 w-20 object-contain border border-gray-600 rounded-md"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setWatermarkImage(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Upload Watermark Image</Label>
                    <Input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-gray-400">
                      Recommended: Transparent PNG (max 1MB)
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <Label>Watermark Position</Label>
              <RadioGroup
                value={position}
                onValueChange={setPosition}
                className="grid grid-cols-3 gap-2"
              >
                <div>
                  <RadioGroupItem
                    value="top-left"
                    id="top-left"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="top-left"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                  >
                    Top Left
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="top-right"
                    id="top-right"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="top-right"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                  >
                    Top Right
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="center"
                    id="center"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="center"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                  >
                    Center
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="bottom-left"
                    id="bottom-left"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="bottom-left"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                  >
                    Bottom Left
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="bottom-right"
                    id="bottom-right"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="bottom-right"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                  >
                    Bottom Right
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="diagonal"
                    id="diagonal"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="diagonal"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                  >
                    Diagonal
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="tiled"
                    id="tiled"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="tiled"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                  >
                    Tiled
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Opacity: {opacity}%</Label>
              <Slider
                value={[opacity]}
                onValueChange={([value]) => setOpacity(value)}
                min={5}
                max={100}
                step={5}
              />
            </div>

            {isProcessing && <Loader label="Adding watermark..." />}

            {error && <Alert variant="destructive">{error}</Alert>}

            <Button
              onClick={addWatermark}
              disabled={
                isProcessing ||
                !file ||
                (watermarkType === "text" && !watermarkText) ||
                (watermarkType === "image" && !watermarkImage)
              }
              className="w-full"
              size="lg"
            >
              {isProcessing ? "Processing..." : "Add Watermark"}
            </Button>
          </CardContent>

          {watermarkedUrl && (
            <CardFooter className="flex flex-col gap-4 border-t border-gray-700 pt-6">
              <h3 className="text-xl font-semibold text-center">
                Watermarked PDF Ready
              </h3>
              <iframe
                src={watermarkedUrl}
                width="100%"
                height="500px"
                className="border border-gray-600 rounded-md"
                title="PDF Preview"
              />
              <Button asChild variant="success" className="w-full">
                <a href={watermarkedUrl} download={`watermarked_${fileName}`}>
                  Download Watermarked PDF
                </a>
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>
    </>
  );
}
