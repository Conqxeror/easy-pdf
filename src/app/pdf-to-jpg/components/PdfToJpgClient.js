"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { loadPdfJs } from "@/lib/pdfjsWorker";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JSZip from "jszip";
// Use native <img> for blob/object URLs (next/image optimizations don't apply to blob URLs)
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from '@/lib/enhancedUX';

// Helper to convert data URI to Blob
function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

export default function PdfToJpgPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [images, setImages] = useState([]); // Stores { url, fileName, size, isZip? }
  const [selectedPages, setSelectedPages] = useState("all");
  const [totalPages, setTotalPages] = useState(0);

  // New states for detailed progress
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentConvertingPage, setCurrentConvertingPage] = useState(0);
  const [totalConvertingPages, setTotalConvertingPages] = useState(0);

  // Ref for the single image preview canvas
  const imagePreviewCanvasRef = useRef(null);

  // Cleanup function for object URLs created for images
  useEffect(() => {
    // This effect runs on component unmount or when `images` state changes
    return () => {
      images.forEach((img) => {
        try { safeRevokeObjectURL(img?.url); } catch { /* ignore */ }
      });
    };
  }, [images]); // Dependency array: run when `images` array changes

  // Draw a preview into the canvas when a single converted image exists
  useEffect(() => {
    const nonZip = images.filter((img) => !img.isZip);
    if (nonZip.length === 1 && imagePreviewCanvasRef.current) {
      const previewImg = new window.Image();
      previewImg.onload = () => {
        const canvas = imagePreviewCanvasRef.current;
        const ctx = canvas.getContext("2d");
        // Resize the canvas to the image size for a crisp preview
        canvas.width = previewImg.width;
        canvas.height = previewImg.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(previewImg, 0, 0);
      };
      previewImg.src = nonZip[0].url;
      return () => {
        previewImg.onload = null;
      };
    } else if (imagePreviewCanvasRef.current) {
      // Clear the canvas when there is no single preview
      const canvas = imagePreviewCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [images]);

  /**
   * Handles file selection from the dropzone.
   * Loads the PDF and sets total pages for the range input.
   * @param {File[]} files - An array of selected files (should be only one PDF).
   */
  const handleFiles = async (files) => {
    const selectedFile = files[0];
    // Reset all related states for a new file
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    setError("");
    setImages([]);
    setTotalPages(0); // Reset page count
    setSelectedPages("all"); // Reset selected pages option
    setCurrentProgress(0);
    setCurrentConvertingPage(0);
    setTotalConvertingPages(0);

    // Clear previous images object URLs
    // The useEffect above handles this, but explicitly clearing state helps
    // if a new file is dropped quickly before old URLs are revoked.
    if (images.length > 0) {
      images.forEach((img) => {
        try {
          if (img && img.url && typeof URL !== "undefined" && !String(img.url).startsWith("data:")) {
            try { if (img.url && typeof URL !== 'undefined' && !String(img.url).startsWith('data:')) URL.revokeObjectURL(img.url); } catch { }
          }
        } catch {
          /* ignore */
        }
      });
      setImages([]); // Clear the array
    }

    if (files.length === 0) {
      return;
    }

    const currentFile = selectedFile;

    if (currentFile.type === "application/pdf") {
      try {
        const arrayBuffer = await currentFile.arrayBuffer();

        // Dynamically load pdfjs and configure worker
        const pdfjs = await loadPdfJs();

        const loadingTask = pdfjs.getDocument({
          data: arrayBuffer,
        });

        const pdf = await loadingTask.promise;
        setTotalPages(pdf.numPages);

      } catch {
        setError("Failed to load PDF. Please ensure it's a valid PDF file.");
        setFile(null);
      }
    } else if (currentFile.type.startsWith("image/")) {
      setTotalPages(1);
    } else {
      setError("Unsupported file type. Please upload a PDF or image file.");
      setFile(null);
    }
  };

  /**
   * Converts the uploaded PDF file to JPG images.
   */
  const convertToJpg = async () => {

    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setProcessingMessage("Loading PDF document...");
    setImages([]); // Clear previous images
    setCurrentProgress(0);
    setCurrentConvertingPage(0);
    setTotalConvertingPages(0);

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Dynamically load pdfjs and configure worker
      const pdfjs = await loadPdfJs();

      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const totalPdfPages = pdf.numPages;

      let pagesToConvert = [];
      if (selectedPages === "all") {
        pagesToConvert = Array.from({ length: totalPdfPages }, (_, i) => i + 1);
      } else {
        const pageNum = parseInt(selectedPages);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPdfPages) {
          setError("Invalid page number selected.");
          setIsProcessing(false);
          return;
        }
        pagesToConvert = [pageNum];
      }

      setTotalConvertingPages(pagesToConvert.length);

      const zip = new JSZip();
      const convertedImages = [];

      for (let i = 0; i < pagesToConvert.length; i++) {
        const pageNumber = pagesToConvert[i];
        setProcessingMessage(`Rendering page ${pageNumber} of ${pagesToConvert.length}...`);
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better image quality

        // Create canvas for rendering
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Convert canvas to JPG with a fixed quality (e.g., 90%)
        const imageData = canvas.toDataURL("image/jpeg", 0.9); // Fixed quality to 90%
        // const blob = await (await fetch(imageData)).blob(); // Convert data URL to Blob
        const blob = dataURItoBlob(imageData);

        const imageName = `${sanitizeFileName(fileName)}_page_${pageNumber}.jpg`;
        // Add to zip (use Blob directly, JSZip handles it)
        zip.file(imageName, blob);

        // Create an object URL for preview where possible. Fall back to data URL if creation fails.
        const imgUrl = safeCreateObjectURL(blob) || imageData;

        convertedImages.push({
          pageNumber,
          url: imgUrl,
          fileName: imageName,
          size: blob.size,
        });

        // Update progress
        const currentProgressValue = Math.round(
          ((i + 1) / pagesToConvert.length) * 100
        );
        setCurrentProgress(currentProgressValue);
        setCurrentConvertingPage(pageNumber);
      }

      // Add zip file to convertedImages if multiple pages were converted
      if (pagesToConvert.length > 1) {
        setProcessingMessage("Compressing images into ZIP...");
        const zipBlob = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 9 },
        });
        const zipUrl = safeCreateObjectURL(zipBlob);

        convertedImages.push({
          isZip: true,
          url: zipUrl,
          fileName: `${sanitizeFileName(fileName)}_images.zip`,
          size: zipBlob.size,
        });
      }
      setImages(convertedImages);
      setProcessingMessage("Conversion complete!");

    } catch (e) {
      setError(
        `Failed to convert PDF to JPG. Error: ${e.message}`
      );
    } finally {
      // Always terminate the worker
      setIsProcessing(false);
      setTimeout(() => setProcessingMessage(""), 2000);
    }
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

  const toolName = "PDF to JPG Converter";
  const toolDescription = "Convert PDF pages into JPG images directly in your browser. Choose a single page or the full document, then download each JPG individually or use the ZIP archive when the browser can create it.";
  const steps = [
    "Upload your PDF file by dragging it into the dropzone or clicking to select a file.",
    "Choose which pages to convert: all pages, or a specific page number.",
    "Click the 'Convert to JPG' button to start the conversion process.",
    "Download your JPG images. If you converted multiple pages, the tool will also provide a ZIP archive when the browser can create the combined download link.",
  ];

  return (
    <ToolPageLayout
      title="PDF to JPG Converter"
      subtitle="Convert your PDF document into high-quality JPG images. Process specific pages or the entire document."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      currentTool="pdf-to-jpg"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'PDF to JPG', href: '/pdf-to-jpg' }
      ]}
    >
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
          isLoading={isProcessing}
        />

        {fileName && (
          <div className="space-y-4 text-foreground">
            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground">Selected file:</span>
              <span className="font-medium">{fileName}</span>
            </div>
            {totalPages > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="pagesToConvert"
                    className="text-sm font-medium text-foreground"
                  >
                    Pages to Convert
                  </Label>
                  <Select
                    value={selectedPages}
                    onValueChange={setSelectedPages}
                  >
                    <SelectTrigger
                      id="pagesToConvert"
                      className="w-full bg-background/80 text-foreground border-border focus:border-border focus:ring-gray-600"
                    >
                      <SelectValue placeholder="Select pages" />
                    </SelectTrigger>
                    <SelectContent className="bg-background text-foreground border-border">
                      <SelectItem value="all">
                        All Pages ({totalPages})
                      </SelectItem>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <SelectItem key={i + 1} value={`${i + 1}`}>
                          Page {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Removed Image Quality Slider and its Label */}
              </div>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground">
                {processingMessage ||
                  `Converting page ${currentConvertingPage} of ${totalConvertingPages}`}
              </span>
              <span className="font-medium text-foreground">
                {currentProgress}%
              </span>
            </div>
            <Progress
              value={currentProgress}
              className="h-2 bg-background [&::-webkit-progress-bar]:bg-background [&::-webkit-progress-value]:bg-background/70"
            />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}

        <div className="flex justify-center">
          <Button
            onClick={convertToJpg}
            disabled={isProcessing || !file || totalPages === 0}
            className="px-8 py-3 bg-background text-foreground shadow-lg hover:shadow-xl border border-border"
            variant="default"
            size="lg"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></span>
                Converting...
              </span>
            ) : (
              "Convert to JPG"
            )}
          </Button>
        </div>

        {images.length > 0 && (
          <div className="flex flex-col gap-6 p-6 bg-background/90 shadow-lg border border-border">
            <div className="w-full text-center space-y-4 text-foreground">
              <h3 className="text-2xl font-semibold flex items-center justify-center">
                {images.filter((img) => !img.isZip).length > 1
                  ? "Converted Images"
                  : "Converted Image"}
              </h3>

              {images.filter((img) => !img.isZip).length === 1 && (
                <div className="w-full flex justify-center items-center bg-background border border-border overflow-hidden relative p-4">
                  <canvas
                    ref={imagePreviewCanvasRef}
                    className="max-w-full h-auto border border-border shadow-lg"
                    style={{ maxWidth: "100%", height: "auto" }}
                    aria-label="Converted image preview"
                  ></canvas>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {images
                  .filter((img) => !img.isZip)
                  .map((image, _index) => (
                    <div
                      key={image.fileName}
                      className="border border-border p-3 bg-background text-foreground flex flex-col items-center text-center"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt={`Page ${image.pageNumber}`}
                          width={64}
                          height={64}
                          className="object-cover shadow"
                          onError={(e) => {
                            const t = e.currentTarget;
                            // @ts-ignore - currentTarget is HTMLImageElement
                            t.onerror = null;
                            t.src = "https://placehold.co/64x64/333/FFF?text=Error";
                          }}
                        />
                        <div className="flex flex-col items-start">
                          <p className="font-medium text-foreground">
                            {image.fileName}
                          </p>
                          <p className="text-sm text-foreground">
                            {formatFileSize(image.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        aria-label={`Download ${image.fileName}`}
                        asChild
                        variant="outline"
                        className="w-full mt-2"
                      >
                        <a
                          href={image.url}
                          download={image.fileName}
                          onClick={() => {
                            const url = image.url;
                            // Only attempt to revoke blob/object URLs (not data URLs)
                            if (!url || String(url).startsWith("data:")) return;
                            setTimeout(() => {
                              try {
                                try { if (typeof URL !== "undefined" && !String(url).startsWith('data:')) URL.revokeObjectURL(url); } catch { }
                              } catch { /* ignore revoke errors */ }
                            }, 500);
                          }}
                        >
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
              </div>

              {(() => {
                const zipItem = images.find((img) => img.isZip);
                if (!zipItem) return null;
                return (
                  <div className="flex justify-center mt-4">
                    {zipItem.url ? (
                      <Button
                        asChild
                        variant="success"
                        size="lg"
                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-foreground shadow-lg hover:shadow-xl"
                      >
                        <a
                          href={zipItem.url}
                          download={zipItem.fileName}
                          className="text-center flex items-center"
                          onClick={() => {
                            const zipUrl = zipItem.url;
                            if (!zipUrl || String(zipUrl).startsWith('data:')) return;
                            setTimeout(() => {
                              try {
                                try { if (typeof URL !== "undefined" && !String(zipUrl).startsWith('data:')) URL.revokeObjectURL(zipUrl); } catch { }
                              } catch { /* ignore */ }
                            }, 500);
                          }}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                          Download All as ZIP
                        </a>
                      </Button>
                    ) : (
                      <Alert className="max-w-xl text-left">
                        ZIP packaging finished, but this browser session could not create a download link for the archive. You can still download each JPG individually from the cards above.
                      </Alert>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout >
  );
}
