"use client";

import React, { useState, useRef, useEffect, useCallback  } from "react";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
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
import Image from "next/image";
import ToolPageLayout from "@/components/ui/ToolPageLayout";

// Configure pdfjs worker
if (typeof window !== 'undefined' && pdfjs && pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
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
        try {
          if (img && img.url) URL.revokeObjectURL(img.url);
  } catch {
          // ignore
        }
      });
    };
  }, [images]); // Dependency array: run when `images` array changes

  /**
   * Handles file selection from the dropzone.
   * Loads the PDF and sets total pages.
   * @param {File[]} files - An array of selected files.
   */
  const handleFiles = async (files) => {
    const selectedFile = files[0];
    // Reset all related states for a new file
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    setError("");
    setImages([]);
    setTotalPages(0); // Reset total pages
    setSelectedPages("all"); // Reset selected pages option
    setCurrentProgress(0);
    setCurrentConvertingPage(0);
    setTotalConvertingPages(0);

    // Clear previous images object URLs
    // The useEffect above handles this, but explicitly clearing state helps
    // if a new file is dropped quickly before old URLs are revoked.
    if (images.length > 0) {
      images.forEach((img) => {
        if (img.url) URL.revokeObjectURL(img.url);
      });
      setImages([]); // Clear the array
    }

    if (!selectedFile) return;

    // Temporarily set processing for PDF loading
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      setTotalPages(pdf.numPages);
    } catch {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      setFile(null);
      setFileName("");
    } finally {
      setIsProcessing(false); // End processing after PDF load attempt
    }
  };

  /**
   * Renders a single image to the preview canvas.
   * @param {string} imageUrl - Data URL or Object URL of the image.
   */
  const renderImagePreview = useCallback((imageUrl) => {
    const canvas = imagePreviewCanvasRef.current;
    if (!canvas || !imageUrl) {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.height = 0; // Collapse canvas if no image
      }
      return;
    }

    const ctx = canvas.getContext("2d");
    const img = new window.Image(); // Use window.Image to avoid conflict with next/image
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const desiredWidth = 300; // Fixed width for preview
      canvas.width = desiredWidth;
      canvas.height = desiredWidth / aspectRatio;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.onerror = () => {
      console.error("Failed to load image for preview.");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "red";
      ctx.fillText("Error loading image", 10, 20);
    };
    img.src = imageUrl;
  }, []);

  // Effect to update image preview when `images` changes and there's a single non-zip image
  useEffect(() => {
    if (images.length === 1 && !images[0].isZip) {
      renderImagePreview(images[0].url);
    } else {
      // Clear canvas if multiple or no images
      renderImagePreview(null);
    }
  }, [images, renderImagePreview]);

  /**
   * Converts the uploaded PDF file to JPG images.
   */
  const convertToJpg = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    setError("");
    setIsProcessing(true);
    setProcessingMessage("Loading PDF document...");
    setImages([]); // Clear previous images
    setCurrentProgress(0);
    setCurrentConvertingPage(0);
    setTotalConvertingPages(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
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
        setProcessingMessage(
          `Rendering page ${pageNumber} of ${pagesToConvert.length}...`
        );
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
        const blob = await (await fetch(imageData)).blob(); // Convert data URL to Blob

        const imageName = `${fileName.replace(
          ".pdf",
          ""
        )}_page_${pageNumber}.jpg`;
        // Add to zip (use Blob directly, JSZip handles it)
        zip.file(imageName, blob);

        convertedImages.push({
          pageNumber,
          url: URL.createObjectURL(blob), // Create object URL for preview/individual download
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
        const zipUrl = URL.createObjectURL(zipBlob);
        convertedImages.push({
          isZip: true,
          url: zipUrl,
          fileName: `${fileName.replace(".pdf", "")}_images.zip`,
          size: zipBlob.size,
        });
      }
      setImages(convertedImages);
      setProcessingMessage("Conversion complete!");
    } catch {
      console.error("Conversion error:");
      setError(
        "Failed to convert PDF to JPG. The file may be corrupted or password protected."
      );
    } finally {
      setIsProcessing(false);
      // Reset progress after a short delay
      setTimeout(() => {
        setCurrentProgress(0);
        setCurrentConvertingPage(0);
        setTotalConvertingPages(0);
        setProcessingMessage("");
      }, 1000);
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
  const toolDescription = "Convert your PDF files to high-quality JPG images with our free online tool. Select the pages you want to convert and download them as individual JPG files or as a single ZIP file. Our tool ensures excellent image quality while processing your files securely in your browser, keeping your documents private.";
  const steps = [
    "Upload your PDF file by dragging it into the dropzone or clicking to select a file.",
    "Choose which pages to convert: all pages, or a specific page number.",
    "Click the 'Convert to JPG' button to start the conversion process.",
    "Download your JPG images. If you converted multiple pages, they will be provided in a convenient ZIP archive.",
  ];
  const faqs = [
    {
      question: "Is it free to convert PDF to JPG?",
      answer:
        "Yes, our PDF to JPG converter is completely free to use. You can convert as many PDF files as you need without any hidden costs or limitations.",
    },
    {
      question: "Are my files secure when converting PDF to JPG?",
      answer:
        "Absolutely. Your privacy is our top priority. All PDF to JPG conversion happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential.",
    },
    {
      question: "Can I convert multiple pages at once?",
      answer:
        "Yes, you can convert all pages of a PDF to JPG at once. If you choose this option, all individual JPG images will be bundled into a single ZIP file for easy download.",
    },
    {
      question: "What quality are the output JPG images?",
    answer:
      "Our tool converts PDF pages to JPG images with high quality (90% compression) to balance file size and visual fidelity. This ensures your images look great without being excessively large.",
    },
    {
      question: "Is there a file size limit for PDF to JPG conversion?",
    answer:
      "Yes, the maximum file size for a PDF to be converted to JPG is 50MB. For larger files, processing might be slower due to client-side operations.",
    },
  ];

  return (
    <ToolPageLayout
      title="PDF to JPG Converter"
      subtitle="Convert your PDF document into high-quality JPG images. Process specific pages or the entire document."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
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
          <div className="space-y-4 text-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Selected file:</span>
              <span className="font-medium">{fileName}</span>
            </div>
            {totalPages > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="pagesToConvert"
                    className="text-sm font-medium text-gray-200"
                  >
                    Pages to Convert
                  </Label>
                  <Select
                    value={selectedPages}
                    onValueChange={setSelectedPages}
                  >
                    <SelectTrigger
                      id="pagesToConvert"
                      className="w-full bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <SelectValue placeholder="Select pages" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 text-gray-100 border-gray-600">
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
              <span className="text-gray-300">
                {processingMessage ||
                  `Converting page ${currentConvertingPage} of ${totalConvertingPages}`}
              </span>
              <span className="font-medium text-gray-100">
                {currentProgress}%
              </span>
            </div>
            <Progress
              value={currentProgress}
              className="h-2 bg-gray-600 [&::-webkit-progress-bar]:bg-gray-600 [&::-webkit-progress-value]:bg-blue-500"
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
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
            variant="default"
            size="lg"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Converting...
              </span>
            ) : (
              "Convert to JPG"
            )}
          </Button>
        </div>

        {images.length > 0 && (
          <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="w-full text-center space-y-4 text-gray-100">
              <h3 className="text-2xl font-semibold flex items-center justify-center">
                {images.filter((img) => !img.isZip).length > 1
                  ? "Converted Images"
                  : "Converted Image"}
              </h3>

              {images.filter((img) => !img.isZip).length === 1 && (
                <div className="w-full flex justify-center items-center bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative p-4">
                  <canvas
                    ref={imagePreviewCanvasRef}
                    className="max-w-full h-auto border border-gray-600 rounded-md shadow-lg"
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
                      className="border border-gray-600 rounded-md p-3 bg-gray-700 text-gray-100 flex flex-col items-center text-center"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Image
                          src={image.url}
                          alt={`Page ${image.pageNumber}`}
                          width={64}
                          height={64}
                          className="object-cover rounded shadow"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/64x64/333/FFF?text=Error";
                          }}
                        />
                        <div className="flex flex-col items-start">
                          <p className="font-medium text-white">
                            {image.fileName}
                          </p>
                          <p className="text-sm text-gray-400">
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
                            setTimeout(() => {
                              try { URL.revokeObjectURL(image.url); } catch { /* ignore */ }
                            }, 500);
                          }}
                        >
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
              </div>

              {images.find((img) => img.isZip) && (
                <div className="flex justify-center mt-4">
                  <Button
                    asChild
                    variant="success"
                    size="lg"
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
                  >
                    <a
                      href={images.find((img) => img.isZip).url}
                      download={images.find((img) => img.isZip).fileName}
                      className="text-center flex items-center"
                      onClick={() => {
                        const zipUrl = images.find((img) => img.isZip)?.url;
                        setTimeout(() => {
                          try { if (zipUrl) URL.revokeObjectURL(zipUrl); } catch { /* ignore */ }
                        }, 500);
                      }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      Download All as ZIP
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}