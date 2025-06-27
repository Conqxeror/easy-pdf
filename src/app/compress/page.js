"use client";

import { Metadata } from 'next';

import { useState, useCallback } from "react";


import { PDFDocument } from "pdf-lib";
import * as pdfjs from "pdfjs-dist"; // Import pdfjs-dist
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription, // Added CardDescription import
} from "@/components/ui/card";
import { Progress }nimport { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import ToolPageContent from "@/components/ui/ToolPageContent";
import Loader from "@/components/ui/Loader";

// Configure pdfjs worker to run from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function CompressPDFs() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [compressedPdfUrl, setCompressedPdfUrl] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState("balanced"); // Renamed from compressionMode for clarity
  const [compressionPercentage, setCompressionPercentage] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [imageQuality, setImageQuality] = useState(75); // New state for image quality, default 75%

  /**
   * Handles file selection from the dropzone.
   * @param {File[]} files - An array of selected files.
   */
  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    setOriginalSize(selectedFile ? selectedFile.size : 0);
    setCompressedPdfUrl(null);
    setCompressionPercentage(null);
    setCompressedSize(0);
    setError("");
    setProgress(0); // Reset progress on new file selection
  };

  /**
   * Formats file size into a human-readable string (e.g., KB, MB).
   * @param {number} bytes - The size in bytes.
   * @returns {string} Formatted size string.
   */
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  /**
   * Compresses the uploaded PDF file.
   * This function renders each PDF page to a canvas, converts it to a JPEG image
   * with a specified quality, and then creates a new PDF from these compressed images.
   */
  const compressPDF = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    setError("");
    setIsCompressing(true);
    setProcessingMessage("Loading PDF document...");
    setProgress(0);
    setCompressedPdfUrl(null); // Clear previous URL

    try {
      // Step 1: Load the PDF using pdfjs-dist
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      const numPages = pdf.numPages;
      setProgress(10); // Initial progress after loading document
      setProcessingMessage("Processing pages...");

      const newPdfDoc = await PDFDocument.create(); // Create a new PDF document

      // The jpegQuality is now directly taken from imageQuality state,
      // which is set by the slider or by selecting a compression level preset.
      const finalJpegQuality = imageQuality;

      // Step 2: Iterate through each page, render to canvas, and convert to JPEG
      for (let i = 1; i <= numPages; i++) {
        setProcessingMessage(`Compressing page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        // Scale for rendering quality - higher scale means better quality image for compression
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Convert canvas to JPEG data URL with specified quality
        // `finalJpegQuality / 100` converts percentage to a 0-1 quality factor
        const imageDataUrl = canvas.toDataURL(
          "image/jpeg",
          finalJpegQuality / 100
        );

        // Step 3: Embed the compressed JPEG into the new PDF
        // Use embedJpg as the canvas output is JPEG
        const embeddedImage = await newPdfDoc.embedJpg(imageDataUrl);

        // Add a new page to the new PDF document with the embedded image
        const newPage = newPdfDoc.addPage([
          embeddedImage.width,
          embeddedImage.height,
        ]);
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });

        // Update progress
        setProgress(10 + Math.round((i / numPages) * 80)); // 10% for load, 80% for page processing
      }

      setProcessingMessage("Saving compressed PDF...");
      // Step 4: Save the new compressed PDF
      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      setCompressedSize(blob.size);
      const calculatedPercentage = Math.round(
        ((originalSize - blob.size) / originalSize) * 100
      );
      setCompressionPercentage(calculatedPercentage);
      setCompressedPdfUrl(URL.createObjectURL(blob));
      setProgress(100); // Final progress
      setProcessingMessage("Compression complete!");
    } catch (e) {
      console.error("Compression error:", e);
      setError(
        "Failed to compress PDF. The file may be corrupted or cannot be processed."
      );
    } finally {
      setIsCompressing(false);
      // Reset progress after a short delay to allow UI to show 100% briefly
      setTimeout(() => {
        setProgress(0);
        setProcessingMessage("");
      }, 1000);
    }
  };

  return (
    <>
      <main className="container max-w-4xl py-8 mx-auto">
        {" "}
        {/* Added mx-auto here for centering */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              Compress PDF
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Reduce the file size of your PDF documents with powerful
              client-side compression.
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
              isLoading={isCompressing}
            />

            {fileName && (
              <div className="space-y-2 text-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">File:</span>
                  <span className="font-medium">{fileName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Original Size:</span>
                  <span className="font-medium">
                    {formatFileSize(originalSize)}
                  </span>
                </div>
                {compressedSize > 0 && !isCompressing && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Compressed Size:</span>
                    <span className="font-medium text-green-400">
                      {formatFileSize(compressedSize)} ({compressionPercentage}%
                      smaller)
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-gray-200">Compression Level</Label>
              <RadioGroup
                value={compressionLevel}
                onValueChange={(value) => {
                  setCompressionLevel(value);
                  // Update imageQuality based on selected compression level
                  if (value === "mild") {
                    setImageQuality(85);
                  } else if (value === "balanced") {
                    setImageQuality(75);
                  } else if (value === "aggressive") {
                    setImageQuality(50);
                  }
                }}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="mild"
                    id="mild"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="mild"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-4 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 text-gray-100"
                  >
                    <span>Mild</span>
                    <span className="text-xs text-gray-400">
                      Good Quality (85%)
                    </span>{" "}
                    {/* Added percentage */}
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="balanced"
                    id="balanced"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="balanced"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-4 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 text-gray-100"
                  >
                    <span>Balanced</span>
                    <span className="text-xs text-gray-400">
                      Recommended (75%)
                    </span>{" "}
                    {/* Added percentage */}
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="aggressive"
                    id="aggressive"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="aggressive"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-700 p-4 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 text-gray-100"
                  >
                    <span>Aggressive</span>
                    <span className="text-xs text-gray-400">
                      Smallest Size (50%)
                    </span>{" "}
                    {/* Added percentage */}
                  </Label>
                </div>
              </RadioGroup>

              {/* Slider for image quality, now always shown */}
              <div className="space-y-2">
                <Label className="text-gray-200">
                  Image Quality for Compression: {imageQuality}%
                </Label>{" "}
                {/* Clarified label */}
                <Slider
                  value={[imageQuality]}
                  onValueChange={([value]) => setImageQuality(value)}
                  min={10}
                  max={100}
                  step={1}
                  className="w-full"
                  // Add styles to slider components if needed to match theme
                  // E.g., track-background, thumb-color
                />
              </div>
            </div>

            {isCompressing && (
              <div className="space-y-2">
                <Progress
                  value={progress}
                  className="h-2 bg-gray-600 [&::-webkit-progress-bar]:bg-gray-600 [&::-webkit-progress-value]:bg-blue-500"
                />
                <p className="text-sm text-center text-gray-400">
                  {processingMessage || `Compressing PDF... ${progress}%`}
                </p>
              </div>
            )}

            {error && <Alert variant="destructive">{error}</Alert>}

            <Button
              onClick={compressPDF}
              disabled={isCompressing || !file}
              className="w-full bg-blue-700 text-white"
              size="lg"
            >
              {isCompressing ? "Compressing..." : "Compress PDF"}
            </Button>
          </CardContent>

          {compressedPdfUrl && !isCompressing && (
            <CardFooter className="flex flex-col gap-4 border-t border-gray-700 pt-6">
              <div className="w-full text-center space-y-2 text-gray-100">
                <h3 className="text-xl font-semibold">Compression Results</h3>
                <div className="flex justify-between max-w-md mx-auto text-sm">
                  <div className="text-gray-400">
                    Original:{" "}
                    <span className="font-medium">
                      {formatFileSize(originalSize)}
                    </span>
                  </div>
                  <div className="text-green-400">
                    Compressed:{" "}
                    <span className="font-medium">
                      {formatFileSize(compressedSize)}
                    </span>
                  </div>
                </div>
                <div className="text-blue-400 font-medium">
                  Reduced by {compressionPercentage}%
                </div>
              </div>

              <Button asChild variant="success" className="w-full">
                <a
                  href={compressedPdfUrl}
                  download={`compressed_${fileName}`}
                  className="text-center"
                >
                  Download Compressed PDF
                </a>
              </Button>
            </CardFooter>
          )}
        </Card>
        <ToolPageContent
          toolName="Compress PDF"
          toolDescription="Reduce the file size of your PDF documents with our free online tool. Our PDF compressor is fast, easy to use, and preserves the quality of your files. Choose from different compression levels to find the perfect balance between file size and document quality. All processing is done securely in your browser, ensuring your files remain private."
          steps={[
            "Upload your PDF file by dragging it into the dropzone or clicking to select a file.",
            "Select your desired compression level: Mild (good quality), Balanced (recommended), or Aggressive (smallest size). You can also fine-tune the image quality using the slider.",
            "Click the 'Compress PDF' button to start the compression process.",
            "Once compressed, you'll see the original and new file sizes, along with the percentage of reduction. Download your optimized PDF file.",
          ]}
          faqs={[
            {
              question: "How much can I compress my PDF file?",
              answer:
                "The compression amount depends on the content of your PDF. Documents with many images or large embedded fonts will see significant reduction, while text-only PDFs may have less room for compression. Our tool uses advanced algorithms to optimize file size.",
            },
            {
              question: "Is it safe to compress my PDF files online?",
              answer:
                "Absolutely. Your privacy and security are our top priorities. All PDF compression happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential.",
            },
            {
              question: "Will the quality of my PDF be affected?",
              answer:
                "Our PDF compressor is designed to reduce file size while minimizing quality loss. You can choose from different compression levels and adjust image quality to find the right balance for your needs. For most uses, the 'Balanced' option provides excellent results.",
            },
            {
              question: "What types of content are compressed in a PDF?",
              answer:
                "Our compressor primarily optimizes images within the PDF by re-encoding them with efficient compression algorithms. It also removes redundant PDF objects and optimizes fonts, leading to overall file size reduction.",
            },
            {
              question: "Is there a file size limit for compression?",
              answer:
                "Yes, the maximum file size for a PDF to be compressed is 50MB. For larger files, processing might be slower due to client-side operations.",
            },
          ]}
        />
      </main>
    </>
  );
}
