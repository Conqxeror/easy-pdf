"use client";
import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib"; // Added StandardFonts
import MetaHead from "@/components/ui/MetaHead";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription, // Added CardDescription
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
import { HexColorPicker } from "react-colorful"; // Assuming this is installed
import Image from "next/image"; // Import Next.js Image component

export default function WatermarkPdfPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [watermarkType, setWatermarkType] = useState("text"); // 'text' or 'image'
  const [watermarkText, setWatermarkText] = useState("Confidential");
  const [watermarkImage, setWatermarkImage] = useState(null); // Data URL of the image
  const [position, setPosition] = useState("center"); // 'top-left', 'top-right', 'center', 'bottom-left', 'bottom-right', 'diagonal', 'tiled'
  const [opacity, setOpacity] = useState(40); // 0-100
  const [rotation, setRotation] = useState(0); // degrees
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#808080"); // Hex color
  const [watermarkedUrl, setWatermarkedUrl] = useState(null); // URL of the output PDF
  const [isProcessing, setIsProcessing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef(null); // Ref for image file input

  // Cleanup function for object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (watermarkedUrl) {
        URL.revokeObjectURL(watermarkedUrl);
      }
      // If there's a watermark image, also revoke its URL if it was an object URL
      // (though it's a DataURL here, good practice to consider for future changes)
    };
  }, [watermarkedUrl]); // Runs when watermarkedUrl changes or component unmounts

  // Color change handler for react-colorful
  const handleColorChange = (newColor) => {
    setColor(newColor);
  };

  /**
   * Handles PDF file selection from the dropzone.
   * @param {File[]} files - An array of selected files (should be only one PDF).
   */
  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    setError("");
    setWatermarkedUrl(null); // Clear previous result
  };

  /**
   * Handles watermark image file upload.
   * Reads the image as a Data URL for embedding.
   * @param {Event} e - The file input change event.
   */
  const handleImageUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) {
      setWatermarkImage(null); // Clear image if nothing selected
      if (fileInputRef.current) fileInputRef.current.value = "";
      setError("");
      return;
    }

    if (!uploadedFile.type.match("image/(jpeg|png)")) {
      setError("Please upload a JPEG or PNG image file for the watermark.");
      setWatermarkImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Max 5MB for watermark image
    if (uploadedFile.size > 5 * 1024 * 1024) {
      setError(
        "Watermark image size exceeds 5MB. Please choose a smaller image."
      );
      setWatermarkImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setWatermarkImage(event.target.result); // Set Data URL for preview and embedding
      setError(""); // Clear error on successful read
    };
    reader.readAsDataURL(uploadedFile);
  };

  /**
   * Converts a hex color string to an RGB array (0-255 values).
   * @param {string} hex - The hex color string (e.g., "#RRGGBB").
   * @returns {number[]} An array [r, g, b] with values from 0-255.
   */
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [128, 128, 128]; // default gray if invalid hex
  };

  /**
   * Helper function to draw a single watermark instance on a PDF page.
   * @param {PDFPage} page - The pdf-lib page object.
   * @param {number} x - X coordinate for drawing.
   * @param {number} y - Y coordinate for drawing.
   * @param {'text' | 'image'} type - Type of watermark ('text' or 'image').
   * @param {string} text - Watermark text (if type is 'text').
   * @param {PDFImage | null} image - Embedded PDFImage object (if type is 'image').
   * @param {number} imgW - Width for image watermark.
   * @param {number} imgH - Height for image watermark.
   * @param {number} fSize - Font size for text watermark.
   * @param {RGB} colorRgb - PDF-lib RGB color object for text watermark.
   * @param {number} opacityVal - Opacity value (0-1).
   * @param {Degrees} rotationVal - Rotation object for pdf-lib.
   * @param {PDFFont} font - The embedded font for text.
   */
  const drawSingleWatermark = (
    page,
    x,
    y,
    type,
    text,
    image,
    imgW,
    imgH,
    fSize,
    colorRgb,
    opacityVal,
    rotationVal,
    font
  ) => {
    if (type === "text") {
      page.drawText(text, {
        x: x,
        y: y,
        size: fSize,
        font: font,
        color: colorRgb,
        opacity: opacityVal,
        rotate: rotationVal,
        // pdf-lib drawText anchors from bottom-left by default.
        // For 'center' or 'top-right' like positions, we might adjust x/y here.
        // However, the outer `addWatermark` function is already calculating x,y
        // to be the bottom-left corner of the watermark for those positions.
      });
    } else if (type === "image" && image) {
      page.drawImage(image, {
        x: x,
        y: y,
        width: imgW,
        height: imgH,
        opacity: opacityVal,
        rotate: rotationVal,
      });
    }
  };

  /**
   * Adds the watermark (text or image) to the uploaded PDF.
   */
  const addWatermark = async () => {
    setError("");
    setWatermarkedUrl(null); // Clear previous output
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }
    if (watermarkType === "text" && !watermarkText.trim()) {
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

      // Convert hex color to RGB (0-1 range for pdf-lib)
      const [r, g, b] = hexToRgb(color);
      const textColorRgb = rgb(r / 255, g / 255, b / 255);
      const watermarkOpacity = opacity / 100;
      const watermarkRotation = degrees(rotation);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold); // Embed a standard font

      let embeddedWatermarkImg = null;
      let watermarkImgWidth = 0;
      let watermarkImgHeight = 0;

      // Embed image once if watermarkType is image
      if (watermarkType === "image" && watermarkImage) {
        const imgBytes = await fetch(watermarkImage).then((res) =>
          res.arrayBuffer()
        );
        if (watermarkImage.startsWith("data:image/jpeg")) {
          embeddedWatermarkImg = await pdfDoc.embedJpg(imgBytes);
        } else if (watermarkImage.startsWith("data:image/png")) {
          embeddedWatermarkImg = await pdfDoc.embedPng(imgBytes);
        } else {
          throw new Error(
            "Unsupported image format for embedding (must be JPEG or PNG)."
          );
        }
        watermarkImgWidth = embeddedWatermarkImg.width;
        watermarkImgHeight = embeddedWatermarkImg.height;
      }

      for (const page of pages) {
        const { width, height } = page.getSize();

        let currentWatermarkWidth, currentWatermarkHeight;

        if (watermarkType === "text") {
          // Rough text dimension estimation (better with font metrics but complex)
          currentWatermarkWidth = watermarkText.length * fontSize * 0.6; // Avg char width * 0.6
          currentWatermarkHeight = fontSize;
        } else {
          // Image watermark
          const imgAspectRatio = watermarkImgWidth / watermarkImgHeight;
          // Scale image watermark to occupy 30% of page width, maintaining aspect ratio
          currentWatermarkWidth = width * 0.3; // Desired width (30% of page width)
          currentWatermarkHeight = currentWatermarkWidth / imgAspectRatio;

          // Ensure image doesn't become too large vertically if page is narrow horizontally
          if (currentWatermarkHeight > height * 0.8) {
            currentWatermarkHeight = height * 0.8;
            currentWatermarkWidth = currentWatermarkHeight * imgAspectRatio;
          }
        }

        // Calculate position based on selection
        let x, y;
        switch (position) {
          case "top-left":
            x = 20; // Padding
            y = height - currentWatermarkHeight - 20; // Adjusted for bottom-left anchor
            break;
          case "top-right":
            x = width - currentWatermarkWidth - 20;
            y = height - currentWatermarkHeight - 20;
            break;
          case "bottom-left":
            x = 20;
            y = 20; // Padding
            break;
          case "bottom-right":
            x = width - currentWatermarkWidth - 20;
            y = 20;
            break;
          case "diagonal":
            // For diagonal, draw from a fixed corner to allow rotation around center of text/image
            // and have it span across. A simple diagonal involves drawing multiple times.
            // For a single diagonal watermark, calculate the starting point to look centered on diagonal
            // This is a rough estimation. For true diagonal, you might need to adjust based on text/image bounds and rotation.
            x = width * 0.1;
            y = height * 0.1;
            // The rotation property will handle the actual diagonal appearance
            break;
          case "tiled":
            // Calculate tile spacing based on watermark dimensions + some padding
            const tileStepX = currentWatermarkWidth + 50; // Watermark width + spacing
            const tileStepY = currentWatermarkHeight + 50; // Watermark height + spacing

            for (let tileY = 0; tileY < height; tileY += tileStepY) {
              for (let tileX = 0; tileX < width; tileX += tileStepX) {
                drawSingleWatermark(
                  page,
                  tileX,
                  tileY,
                  watermarkType,
                  watermarkText,
                  embeddedWatermarkImg,
                  currentWatermarkWidth,
                  currentWatermarkHeight,
                  fontSize,
                  textColorRgb,
                  watermarkOpacity,
                  watermarkRotation,
                  font
                );
              }
            }
            continue; // Skip the single watermark drawing below
          default: // center
            x = (width - currentWatermarkWidth) / 2;
            y = (height - currentWatermarkHeight) / 2;
        }

        // Only draw if not in tiled mode (tiled mode handles its own drawing loop)
        if (position !== "tiled") {
          drawSingleWatermark(
            page,
            x,
            y,
            watermarkType,
            watermarkText,
            embeddedWatermarkImg,
            currentWatermarkWidth,
            currentWatermarkHeight,
            fontSize,
            textColorRgb,
            watermarkOpacity,
            watermarkRotation,
            font
          );
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setWatermarkedUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error("Watermark error:", e);
      setError(
        "Failed to add watermark. Please ensure the PDF is valid and the image (if used) is a valid JPEG/PNG and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <MetaHead
        title="Watermark PDF – Free, Fast & Secure | easy-pdf"
        description="Add text or image watermarks to your PDF, 100% client-side. No uploads, no privacy risk."
        url="/watermark"
        alternates={[
          {
            hrefLang: "en",
            href: "https://easy-pdf-murex.vercel.app/watermark",
          },
          {
            hrefLang: "hi",
            href: "https://easy-pdf-murex.vercel.app/hi/watermark",
          },
          {
            hrefLang: "mr",
            href: "https://easy-pdf-murex.vercel.app/mr/watermark",
          },
        ]}
      />

      <main className="container max-w-4xl py-8 mx-auto">
        {" "}
        {/* Centering the main card */}
        <Card className="bg-gray-800 border-gray-700 w-full">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              Add Watermark to PDF
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Apply custom text or image watermarks to your PDF documents
              securely in your browser.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <FileDropzone
              accept="application/pdf"
              multiple={false}
              onFiles={handleFiles}
              error={error}
              setError={setError}
              label="Choose a PDF File"
              description="Drag & drop or click to select a PDF file (Max 50MB)"
              maxSize={50 * 1024 * 1024}
              isLoading={isProcessing} // Use isProcessing for FileDropzone isLoading state
            />

            {fileName && (
              <div className="flex justify-between items-center text-gray-200">
                <span className="text-gray-300">Selected file:</span>
                <span className="font-medium">{fileName}</span>
              </div>
            )}

            <Tabs
              defaultValue="text"
              className="w-full bg-gray-900 rounded-md p-4 border border-gray-700"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger
                  value="text"
                  onClick={() => setWatermarkType("text")}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-gray-700 data-[state=inactive]:text-gray-300 transition-colors"
                >
                  Text Watermark
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  onClick={() => setWatermarkType("image")}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-gray-700 data-[state=inactive]:text-gray-300 transition-colors"
                >
                  Image Watermark
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="watermarkText"
                    className="text-sm font-medium text-gray-200"
                  >
                    Watermark Text
                  </Label>
                  <Input
                    id="watermarkText"
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text"
                    className="w-full bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-200">
                    Text Color
                  </Label>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-md border border-gray-600 cursor-pointer shadow-md"
                      style={{ backgroundColor: color }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      aria-label="Toggle color picker"
                    />
                    <span className="text-sm text-gray-300">{color}</span>
                  </div>
                  {showColorPicker && (
                    <div className="p-4 border border-gray-600 rounded-md bg-gray-700 mt-2">
                      <HexColorPicker
                        color={color}
                        onChange={handleColorChange}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="fontSizeSlider"
                      className="text-sm font-medium text-gray-200"
                    >
                      Font Size: {fontSize}px
                    </Label>
                    <Slider
                      id="fontSizeSlider"
                      value={[fontSize]}
                      onValueChange={([value]) => setFontSize(value)}
                      min={12}
                      max={120}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="rotationSlider"
                      className="text-sm font-medium text-gray-200"
                    >
                      Rotation: {rotation}°
                    </Label>
                    <Slider
                      id="rotationSlider"
                      value={[rotation]}
                      onValueChange={([value]) => setRotation(value)}
                      min={-180}
                      max={180}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4 mt-4">
                {watermarkImage ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-200">
                      Watermark Image
                    </Label>
                    <div className="flex items-center gap-4">
                      {/* Replaced <img> with <Image> from next/image */}
                      <Image
                        src={watermarkImage}
                        alt="Watermark preview"
                        width={80} // Specify appropriate width
                        height={80} // Specify appropriate height
                        className="object-contain border border-gray-600 rounded-md shadow-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/80x80/333/FFF?text=Error";
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setWatermarkImage(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="text-gray-200 border-gray-600 hover:bg-gray-600 hover:text-white"
                      >
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label
                      htmlFor="imageUpload"
                      className="text-sm font-medium text-gray-200"
                    >
                      Upload Watermark Image
                    </Label>
                    <Input
                      id="imageUpload"
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png" // Only allow JPG and PNG
                      onChange={handleImageUpload}
                      className="cursor-pointer bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-400">
                      Recommended: Transparent PNG, JPEG (Max 5MB)
                    </p>
                  </div>
                )}
                {/* Opacity and Rotation sliders also apply to images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="imageOpacitySlider"
                      className="text-sm font-medium text-gray-200"
                    >
                      Image Opacity: {opacity}%
                    </Label>
                    <Slider
                      id="imageOpacitySlider"
                      value={[opacity]}
                      onValueChange={([value]) => setOpacity(value)}
                      min={5}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="imageRotationSlider"
                      className="text-sm font-medium text-gray-200"
                    >
                      Image Rotation: {rotation}°
                    </Label>
                    <Slider
                      id="imageRotationSlider"
                      value={[rotation]}
                      onValueChange={([value]) => setRotation(value)}
                      min={-180}
                      max={180}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-200">
                Watermark Position
              </Label>
              <RadioGroup
                value={position}
                onValueChange={setPosition}
                className="grid grid-cols-3 gap-2 p-2 rounded-md bg-gray-700 border border-gray-600"
              >
                <div>
                  <RadioGroupItem
                    value="top-left"
                    id="top-left"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="top-left"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 text-gray-300"
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
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 text-gray-300"
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
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 text-gray-300"
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
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 text-gray-300"
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
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 text-gray-300"
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
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 text-gray-300"
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
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-2 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 text-gray-300"
                  >
                    Tiled
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="opacitySlider"
                className="text-sm font-medium text-gray-200"
              >
                Overall Watermark Opacity: {opacity}%
              </Label>
              <Slider
                id="opacitySlider"
                value={[opacity]}
                onValueChange={([value]) => setOpacity(value)}
                min={5}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                {error}
              </Alert>
            )}

            <Button
              onClick={addWatermark}
              disabled={
                isProcessing ||
                !file ||
                (watermarkType === "text" && !watermarkText.trim()) || // Ensure text is not just whitespace
                (watermarkType === "image" && !watermarkImage)
              }
              className="w-full max-w-xs mx-auto block" // Consistent styling
              variant="default" // Using default variant
              size="lg"
              aria-label="Add watermark to PDF"
            >
              {isProcessing ? "Processing..." : "Add Watermark"}
            </Button>
          </CardContent>

          {watermarkedUrl && !isProcessing && (
            <CardFooter className="flex flex-col gap-4 border-t border-gray-700 pt-6">
              <h3 className="text-xl font-semibold text-center text-gray-100">
                Watermarked PDF Ready
              </h3>
              <iframe
                src={watermarkedUrl}
                width="100%"
                height="500px"
                className="border border-gray-600 rounded-md shadow-inner"
                title="PDF Preview"
              />
              <Button
                asChild
                variant="success"
                className="w-full max-w-xs mx-auto block"
                aria-label="Download watermarked PDF"
              >
                <a
                  href={watermarkedUrl}
                  download={`watermarked_${fileName || "document"}.pdf`}
                >
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
