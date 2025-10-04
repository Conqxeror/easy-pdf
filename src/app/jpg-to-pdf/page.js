"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from '@/lib/enhancedUX';

export default function JpgToPdfPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);

  // Cleanup function for object URLs
  useEffect(() => {
    return () => {
      try { safeRevokeObjectURL(pdfUrl); } catch {}
      files.forEach(file => { try { safeRevokeObjectURL(file.objectURL); } catch {} });
    };
  }, [pdfUrl, files]);

  const handleFiles = (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => {
      const objUrl = safeCreateObjectURL(file);
      return Object.assign(file, { objectURL: objUrl });
    });
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    setError("");
    setPdfUrl(null);
    setPdfFileName("");
    setCurrentProgress(0);
  };

  const removeFile = (fileName) => {
    setFiles(prevFiles => {
      const toRemove = prevFiles.find(file => file.name === fileName);
      if (toRemove && toRemove.objectURL) {
        try { safeRevokeObjectURL(toRemove.objectURL); } catch { /* ignore */ }
      }
      return prevFiles.filter(file => file.name !== fileName);
    });
  };

  const convertToPdf = async () => {
    if (files.length === 0) {
      setError("Please upload at least one image file.");
      return;
    }

    setError("");
    setIsProcessing(true);
    setProcessingMessage("Creating PDF document...");
    setPdfUrl(null);
    setPdfFileName("");
    setCurrentProgress(0);

    try {
      const pdfDoc = await PDFDocument.create();
      

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessingMessage(`Embedding image ${i + 1} of ${files.length}...`);
        setCurrentProgress(Math.round(((i + 1) / files.length) * 100));

        let image;
        const arrayBuffer = await file.arrayBuffer();

        if (file.type.startsWith("image/jpeg")) {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type.startsWith("image/png")) {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          setError(`Unsupported image format: ${file.type}`);
          setIsProcessing(false);
          return;
        }

        const page = pdfDoc.addPage();
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();

        const imageWidth = image.width;
        const imageHeight = image.height;

        // Calculate scale factors for width and height
        const scaleX = pageWidth / imageWidth;
        const scaleY = pageHeight / imageHeight;

        // Use the smaller scale factor to ensure the image fits within the page
        const scale = Math.min(scaleX, scaleY);

        const scaledWidth = imageWidth * scale;
        const scaledHeight = imageHeight * scale;

        // Calculate position to center the image on the page
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;

        page.drawImage(image, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      setProcessingMessage("Saving PDF...");
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = safeCreateObjectURL(blob);

      const newFileName = files.length === 1
        ? sanitizeFileName(files[0].name) + ".pdf"
        : `${sanitizeFileName("converted_images")}.pdf`;

      setPdfUrl((prev) => { try { safeRevokeObjectURL(prev); } catch {} return url; });
      setPdfFileName(newFileName);
      setProcessingMessage("Conversion complete!");
    } catch (err) {
      console.error("Conversion error:", err);
      setError("Failed to convert images to PDF. Please try again.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setCurrentProgress(0);
        setProcessingMessage("");
      }, 1000);
    }
  };

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const toolName = "JPG to PDF Converter";
  const toolDescription = "Convert your JPG, PNG, and other image files into a single PDF document with our free online tool. Our converter processes your images directly in your browser, ensuring your privacy and providing instant results. Combine multiple images into one PDF quickly and securely.";
  const steps = [
    "Upload your image files (JPG, PNG, GIF, WEBP) by dragging them into the dropzone or clicking to select files.",
    "Review the selected images. You can remove any unwanted images before conversion.",
    "Click the 'Convert to PDF' button to start the conversion process.",
    "Download your newly created PDF document containing all your images.",
  ];
  const faqs = [
    {
      question: "Is it free to convert JPG to PDF?",
      answer:
        "Yes, our JPG to PDF converter is completely free to use. You can convert as many image files as you need without any hidden costs or limitations.",
    },
    {
      question: "Are my files secure when converting JPG to PDF?",
      answer:
        "Absolutely. Your privacy is our top priority. All JPG to PDF conversion happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential.",
    },
    {
      question: "What image formats are supported?",
      answer:
        "Our tool supports JPG, PNG, GIF, and WEBP image formats. You can combine different image types into a single PDF.",
    },
    {
      question: "Can I combine multiple images into one PDF?",
      answer:
        "Yes, you can upload multiple image files, and our tool will combine them into a single PDF document, with each image appearing on a new page.",
    },
    {
      question: "Is there a file size limit for JPG to PDF conversion?",
      answer:
        "While there isn't a strict limit on the number of images, the total size of all uploaded images should ideally not exceed 50MB for optimal performance, as all processing occurs client-side.",
    },
  ];

  return (
    <ToolPageLayout
      title="JPG to PDF Converter"
      subtitle="Convert your JPG, PNG, and other image files into a single PDF document."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="jpg-to-pdf"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'JPG to PDF', href: '/jpg-to-pdf' }
      ]}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="image/jpeg, image/png, image/gif, image/webp"
          multiple={true}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Choose Image Files"
          description="Drag & drop or click to select JPG, PNG, GIF, or WEBP files (Max 50MB total)"
          maxSize={50 * 1024 * 1024}
          isLoading={isProcessing}
        />

        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Selected Images:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {files.map((file) => (
                <div key={file.name} className="border border-gray-200 p-3 bg-white flex flex-col items-center text-center relative">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeFile(file.name)}
                  >
                    X
                  </Button>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.objectURL}
                    alt={file.name}
                    width={100}
                    height={100}
                    className="object-cover shadow mb-2"
                    onError={(e) => {
                      const t = e.currentTarget;
                      // @ts-ignore
                      t.onerror = null;
                      t.src = "https://placehold.co/100x100/EEE/333?text=Error";
                    }}
                  />
                  <p className="font-medium text-sm break-all">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {processingMessage}
              </span>
              <span className="font-medium">
                {currentProgress}%
              </span>
            </div>
            <Progress
              value={currentProgress}
              className="h-2 bg-gray-200 [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:bg-gray-700"
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
            onClick={convertToPdf}
            disabled={isProcessing || files.length === 0}
            variant="default"
            size="lg"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></span>
                Converting...
              </span>
            ) : (
              "Convert to PDF"
            )}
          </Button>
        </div>

        {pdfUrl && (
          <div className="flex flex-col gap-6 p-6 bg-gray-100 shadow-lg border border-gray-200">
            <div className="w-full text-center space-y-4">
              <h3 className="text-2xl font-semibold flex items-center justify-center text-green-600">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Conversion Complete!
              </h3>
              <p className="text-gray-600">
                Your images have been successfully converted to a PDF document.
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                asChild
                variant="success"
                size="lg"
              >
                <a
                  href={pdfUrl}
                  download={pdfFileName}
                  className="text-center flex items-center"
                  onClick={() => {
                    const u = pdfUrl;
                    setTimeout(() => {
                      try {
                        if (u && typeof URL !== 'undefined' && !String(u).startsWith('data:')) {
                          try { if (u && typeof URL !== 'undefined' && !String(u).startsWith('data:')) URL.revokeObjectURL(u); } catch {}
                        }
                      } catch {}
                    }, 500);
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Download Converted PDF
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}