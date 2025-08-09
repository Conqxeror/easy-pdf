"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";
import ToolPageContent from "@/components/ui/ToolPageContent";

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
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      files.forEach(file => {
        if (file.objectURL) URL.revokeObjectURL(file.objectURL);
      });
    };
  }, [pdfUrl, files]);

  const handleFiles = (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      objectURL: URL.createObjectURL(file)
    }));
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    setError("");
    setPdfUrl(null);
    setPdfFileName("");
    setCurrentProgress(0);
  };

  const removeFile = (fileName) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
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
      const url = URL.createObjectURL(blob);
      
      const newFileName = files.length === 1 
        ? files[0].name.replace(/\.[^/.]+$/, ".pdf") 
        : "converted_images.pdf";

      setPdfUrl(url);
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

  return (
    <>
      <main className="container max-w-4xl py-8 mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              JPG to PDF Converter
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Convert your JPG, PNG, and other image files into a single PDF document.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
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
              <div className="space-y-4 text-gray-200">
                <h3 className="text-xl font-semibold text-gray-100">Selected Images:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <div key={file.name} className="border border-gray-600 rounded-md p-3 bg-gray-700 flex flex-col items-center text-center relative">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeFile(file.name)}
                      >
                        X
                      </Button>
                      <Image
                        src={file.objectURL}
                        alt={file.name}
                        width={100}
                        height={100}
                        className="object-cover rounded shadow mb-2"
                      />
                      <p className="font-medium text-white text-sm break-all">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">
                    {processingMessage}
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

            <Button
              onClick={convertToPdf}
              disabled={isProcessing || files.length === 0}
              className="w-full max-w-xs mx-auto block bg-blue-700 text-white"
              variant="default"
              size="lg"
            >
              {isProcessing ? "Converting..." : "Convert to PDF"}
            </Button>
          </CardContent>

          {pdfUrl && (
            <CardFooter className="flex flex-col gap-6 border-t border-gray-700 pt-6">
              <h3 className="text-xl font-semibold text-center text-gray-100">
                Conversion Complete!
              </h3>
              <div className="w-full text-center">
                <Button
                  asChild
                  variant="success"
                  className="w-full max-w-md mx-auto"
                >
                  <a href={pdfUrl} download={pdfFileName}>
                    Download Converted PDF
                  </a>
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
        <ToolPageContent
          toolName="JPG to PDF Converter"
          toolDescription="Convert your JPG, PNG, and other image files into a single PDF document with our free online tool. Our converter processes your images directly in your browser, ensuring your privacy and providing instant results. Combine multiple images into one PDF quickly and securely."
          currentTool="jpg-to-pdf"
          steps={[
            "Upload your image files (JPG, PNG, GIF, WEBP) by dragging them into the dropzone or clicking to select files.",
            "Review the selected images. You can remove any unwanted images before conversion.",
            "Click the 'Convert to PDF' button to start the conversion process.",
            "Download your newly created PDF document containing all your images.",
          ]}
          faqs={[
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
          ]}
        />
      </main>
    </>
  );
}