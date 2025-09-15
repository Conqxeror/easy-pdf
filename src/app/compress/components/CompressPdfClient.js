"use client";

import React, { useState, useCallback, useEffect  } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
import { Download, FileText, Zap } from "lucide-react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import ToolPageLayout from "@/components/ui/ToolPageLayout";

// Configure pdfjs worker only on the client to avoid SSR/runtime errors
if (typeof window !== 'undefined' && pdfjs && pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

export default function CompressPdfClient() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [compressedPdfUrl, setCompressedPdfUrl] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState("balanced");
  const [compressionPercentage, setCompressionPercentage] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [imageQuality, setImageQuality] = useState(75);

  // Cleanup function for object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (compressedPdfUrl) {
        try { URL.revokeObjectURL(compressedPdfUrl); } catch { /* ignore */ }
      }
    };
  }, [compressedPdfUrl]);

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    setOriginalSize(selectedFile ? selectedFile.size : 0);
    setCompressedPdfUrl(null);
    setCompressionPercentage(null);
    setCompressedSize(0);
    setError("");
    setProgress(0);
  };

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const compressPDF = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    setError("");
    setIsCompressing(true);
    setProcessingMessage("Loading PDF document...");
    setProgress(0);
    setCompressedPdfUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      const numPages = pdf.numPages;
      setProgress(10);
      setProcessingMessage("Processing pages...");

      const newPdfDoc = await PDFDocument.create();
      const finalJpegQuality = imageQuality;

      for (let i = 1; i <= numPages; i++) {
        setProcessingMessage(`Compressing page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imageDataUrl = canvas.toDataURL(
          "image/jpeg",
          finalJpegQuality / 100
        );

        const embeddedImage = await newPdfDoc.embedJpg(imageDataUrl);

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

        setProgress(10 + Math.round((i / numPages) * 80));
      }

      setProcessingMessage("Saving compressed PDF...");

      const compressedPdfBytes = await newPdfDoc.save();
      const blob = new Blob([compressedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      // Revoke previous URL if present to avoid memory leaks
      setCompressedPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });

      const newSize = blob.size;
      setCompressedSize(newSize);
      const reduction = ((originalSize - newSize) / originalSize) * 100;
      setCompressionPercentage(Math.max(0, Math.round(reduction)));

      setProgress(100);
      setProcessingMessage("Compression complete!");
    } catch (error) {
      console.error("Error compressing PDF:", error);
      setError(
        "Failed to compress PDF. Please try again with a different file."
      );
    } finally {
      setIsCompressing(false);
      setProcessingMessage("");
    }
  };

  return (
    <ToolPageLayout>
      <div className="space-y-6">
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
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-lg bg-blue-900/50 mr-3">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-100">{fileName}</h3>
                <p className="text-sm text-gray-400">
                  {formatFileSize(originalSize)}
                </p>
              </div>
            </div>
            
            {compressedSize > 0 && !isCompressing && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Original Size:</span>
                  <span className="font-medium">
                    {formatFileSize(originalSize)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Compressed Size:</span>
                  <span className="font-medium text-green-400">
                    {formatFileSize(compressedSize)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Reduction:</span>
                  <span className="font-medium text-blue-400">
                    {compressionPercentage}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <Label className="text-gray-200 mb-3 block">Compression Level</Label>
            <RadioGroup
              value={compressionLevel}
              onValueChange={(value) => {
                setCompressionLevel(value);
                if (value === "mild") {
                  setImageQuality(85);
                } else if (value === "balanced") {
                  setImageQuality(75);
                } else if (value === "aggressive") {
                  setImageQuality(50);
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <div>
                <RadioGroupItem
                  value="mild"
                  id="mild"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="mild"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-600 bg-gray-800 p-4 hover:bg-gray-700 peer-data-[state=checked]:border-blue-400 [&:has([data-state=checked])]:border-blue-400 text-gray-200 cursor-pointer transition-colors"
                >
                  <span className="font-medium">Mild</span>
                  <span className="text-xs text-gray-400 mt-1">
                    Good Quality (85%)
                  </span>
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
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-600 bg-gray-800 p-4 hover:bg-gray-700 peer-data-[state=checked]:border-blue-400 [&:has([data-state=checked])]:border-blue-400 text-gray-200 cursor-pointer transition-colors"
                >
                  <span className="font-medium">Balanced</span>
                  <span className="text-xs text-gray-400 mt-1">
                    Recommended (75%)
                  </span>
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
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-600 bg-gray-800 p-4 hover:bg-gray-700 peer-data-[state=checked]:border-blue-400 [&:has([data-state=checked])]:border-blue-400 text-gray-200 cursor-pointer transition-colors"
                >
                  <span className="font-medium">Aggressive</span>
                  <span className="text-xs text-gray-400 mt-1">
                    Smallest Size (50%)
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-gray-200">
                Image Quality: {imageQuality}%
              </Label>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <Slider
              value={[imageQuality]}
              onValueChange={([value]) => setImageQuality(value)}
              min={10}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Smaller File</span>
              <span>Better Quality</span>
            </div>
          </div>
        </div>

        {isCompressing && (
          <div className="space-y-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <Progress
              value={progress}
              className="h-2.5 bg-gray-700 [&::-webkit-progress-bar]:bg-gray-700 [&::-webkit-progress-value]:bg-blue-600 rounded-full"
            />
            <p className="text-sm text-center text-gray-300">
              {processingMessage || `Compressing PDF... ${progress}%`}
            </p>
          </div>
        )}

        {error && <Alert variant="destructive">{error}</Alert>}

        <div className="flex justify-center">
          <Button
            onClick={compressPDF}
            disabled={isCompressing || !file}
            size="lg"
          >
            {isCompressing ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Compressing...
              </span>
            ) : (
              "Compress PDF"
            )}
          </Button>
        </div>

        {compressedPdfUrl && !isCompressing && (
          <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="w-full text-center space-y-4 text-gray-200">
              <h3 className="text-2xl font-semibold flex items-center justify-center text-green-400">
                <Download className="w-6 h-6 mr-2" />
                Compression Complete
              </h3>
              
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-gray-400 text-sm">Original Size</div>
                    <div className="font-medium">{formatFileSize(originalSize)}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-gray-400 text-sm">Compressed Size</div>
                    <div className="font-medium text-green-400">{formatFileSize(compressedSize)}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-gray-400 text-sm">Saved</div>
                    <div className="font-medium text-blue-400">{compressionPercentage}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button asChild variant="success" size="lg" className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl">
                <a
                  href={compressedPdfUrl}
                  download={`compressed_${fileName}`}
                  className="text-center flex items-center"
                  onClick={() => {
                    const urlToRevoke = compressedPdfUrl;
                    setTimeout(() => {
                      try { if (urlToRevoke) URL.revokeObjectURL(urlToRevoke); } catch { /* ignore */ }
                    }, 500);
                  }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Compressed PDF
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}