"use client";
import { Metadata } from 'next';
import { useState, useRef, useEffect, useCallback } from "react";


import { PDFDocument, rgb } from "pdf-lib";
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
  CardDescription, // Import CardDescription
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Assuming Progress is used for conversion feedback
import ToolPageContent from "@/components/ui/ToolPageContent";
import Loader from "@/components/ui/Loader";

// Configure pdfjs worker to run from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function JpgToPdfPage() {
  const [files, setFiles] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [progress, setProgress] = useState(0); // Progress state for conversion
  const pdfPreviewCanvasRef = useRef(null); // Ref for the PDF preview canvas
  const [pdfDocProxy, setPdfDocProxy] = useState(null); // pdf.js document proxy for preview
  const renderTaskRef = useRef(null); // To manage pdf.js render tasks

  // Cleanup function for pdfDocProxy and pdfUrl
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      if (pdfDocProxy) {
        pdfDocProxy.destroy();
      }
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfUrl, pdfDocProxy]);

  // Function to render the first page of the generated PDF to the preview canvas
  const renderPdfPreview = useCallback(async () => {
    const canvas = pdfPreviewCanvasRef.current;
    if (!canvas || !pdfDocProxy) {
      if (canvas) {
        // Clear canvas if no PDF or invalid proxy
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.height = 0; // Collapse canvas if no PDF
      }
      return;
    }

    // Cancel any ongoing render task
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    const context = canvas.getContext("2d");
    try {
      const page = await pdfDocProxy.getPage(1); // Get the first page for preview
      const viewport = page.getViewport({ scale: 1 });

      const desiredWidth = 800; // Fixed width for preview
      const scale = desiredWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale: scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };

      context.clearRect(0, 0, canvas.width, canvas.height);

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;
    } catch (e) {
      if (e.name === "RenderingCancelledException") {
        console.log("PDF rendering cancelled during preview:", e);
      } else {
        console.error("Error rendering PDF preview:", e);
        setError("Failed to render PDF preview.");
      }
    }
  }, [pdfDocProxy]);

  // Effect to trigger PDF preview render when pdfDocProxy changes
  useEffect(() => {
    renderPdfPreview();
  }, [renderPdfPreview]);

  const handleFiles = (selectedFiles) => {
    setFiles(selectedFiles);
    setPdfUrl(null);
    setError("");
    setProgress(0); // Reset progress on new file selection

    // Clear previous PDF proxy and preview if a new file is dropped
    if (pdfDocProxy) {
      pdfDocProxy.destroy();
      setPdfDocProxy(null);
    }
  };

  const createPdf = async () => {
    if (files.length === 0) {
      setError("Please upload at least one JPG or PNG image.");
      return;
    }

    setIsProcessing(true);
    setProcessingMessage("Creating new PDF document...");
    setError("");
    setPdfUrl(null); // Clear previous URL
    setProgress(0);

    try {
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessingMessage(`Embedding image ${i + 1} of ${files.length}...`);
        const imgData = await file.arrayBuffer();
        let img;
        let dims;

        if (file.type === "image/jpeg") {
          img = await pdfDoc.embedJpg(imgData);
        } else if (file.type === "image/png") {
          img = await pdfDoc.embedPng(imgData);
        } else {
          throw new Error(`Unsupported file type: ${file.type}`);
        }

        // Scale image to fit page or use original dimensions
        // For simplicity, let's just use original image dimensions for now
        dims = img.scale(1); // Use original scale. Consider scaling to fit standard page sizes later if needed.

        const page = pdfDoc.addPage([dims.width, dims.height]);
        page.drawImage(img, {
          x: 0,
          y: 0,
          width: dims.width,
          height: dims.height,
        });

        // Update progress for each image processed
        setProgress(Math.round(((i + 1) / files.length) * 90)); // 90% for image processing
      }

      setProcessingMessage("Saving PDF...");
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const newPdfUrl = URL.createObjectURL(blob);
      setPdfUrl(newPdfUrl); // Set URL for download

      // Load the generated PDF into pdf.js for preview
      const loadingTask = pdfjs.getDocument({ data: pdfBytes });
      const pdf = await loadingTask.promise;
      setPdfDocProxy(pdf); // This will trigger renderPdfPreview via useEffect

      setProgress(100); // Final progress
      setProcessingMessage("Conversion complete!");
    } catch (err) {
      console.error("Conversion error:", err);
      setError(
        "Failed to convert images to PDF. Please ensure your files are valid JPG or PNG images and try again. Error: " +
          err.message
      );
      setPdfUrl(null);
      setPdfDocProxy(null);
    } finally {
      setIsProcessing(false);
      // Reset progress after a short delay
      setTimeout(() => {
        setProgress(0);
        setProcessingMessage("");
      }, 1000);
    }
  };

  return (
    <>
      <main className="flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        {" "}
        {/* Centering the main content */}
        <Card className="bg-gray-800 border-gray-700 w-full">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              JPG to PDF Converter
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Combine multiple JPG or PNG images into a single PDF file. All
              processing is done securely in your browser.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <FileDropzone
              accept="image/jpeg,image/png"
              multiple
              onFiles={handleFiles}
              error={error}
              setError={setError}
              label="Choose Images"
              description="Drag & drop or click to select JPG/PNG images. Multiple files can be selected."
              maxSize={50 * 1024 * 1024} // Max 50MB per file or total for this context
              isLoading={isProcessing}
            />

            {files.length > 0 && (
              <div className="space-y-2 text-gray-200">
                <h3 className="text-xl font-semibold text-gray-100 mb-2">
                  Selected Images:
                </h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {files.map((file, idx) => (
                    <li key={idx}>
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <Progress
                  value={progress}
                  className="h-2 bg-gray-600 [&::-webkit-progress-bar]:bg-gray-600 [&::-webkit-progress-value]:bg-blue-500"
                />
                <p className="text-sm text-center text-gray-400">
                  {processingMessage || `Converting images to PDF... ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                {error}
              </Alert>
            )}

            <Button
              onClick={createPdf}
              className="w-full max-w-xs mx-auto block"
              variant="default" // Using default variant for the action button
              disabled={isProcessing || files.length === 0}
              aria-label="Convert selected images to PDF"
            >
              {isProcessing ? "Converting..." : "Convert to PDF"}
            </Button>
          </CardContent>

          {pdfUrl && !isProcessing && (
            <CardFooter className="flex flex-col gap-4 border-t border-gray-700 pt-6">
              <div className="w-full text-center space-y-2 text-gray-100">
                <h3 className="text-xl font-semibold">PDF Preview</h3>
                <div className="w-full flex justify-center items-center bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative">
                  <canvas
                    ref={pdfPreviewCanvasRef}
                    className="max-w-full h-auto border border-gray-600 rounded-md shadow-lg"
                    style={{ maxWidth: "100%", height: "auto" }}
                    aria-label="Generated PDF preview"
                  ></canvas>
                </div>
              </div>

              <Button
                asChild
                variant="success"
                className="w-full max-w-xs mx-auto block"
              >
                <a
                  href={pdfUrl}
                  download="converted.pdf"
                  className="text-center" // Ensure text is centered if button expands
                >
                  Download Converted PDF
                </a>
              </Button>
            </CardFooter>
          )}
        </Card>
        <ToolPageContent
          toolName="JPG to PDF Converter"
          toolDescription="Convert your JPG and PNG images into a single, high-quality PDF document. Our free online tool allows you to combine multiple images, arrange their order, and create a professional-looking PDF. All processing is done securely in your browser, ensuring your files remain private."
          steps={[
            "Upload your JPG or PNG images by dragging them into the dropzone or clicking to select files. You can select multiple images at once.",
            "Once uploaded, you can review the list of selected images. The tool will combine them in the order they were uploaded.",
            "Click the 'Convert to PDF' button to start the conversion process.",
            "A preview of the generated PDF will appear. You can then download your new PDF file to your device.",
          ]}
          faqs={[
            {
              question: "Is it free to convert JPG to PDF?",
              answer:
                "Yes, our JPG to PDF converter is completely free to use. You can convert as many images as you need without any hidden costs or limitations.",
            },
            {
              question: "Are my files secure when converting images to PDF?",
              answer:
                "Absolutely. Your privacy is our top priority. All image to PDF conversion happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential.",
            },
            {
              question: "Can I convert multiple images at once?",
              answer:
                "Yes, you can upload multiple JPG and PNG images simultaneously. They will be combined into a single PDF document, with each image appearing on a new page.",
            },
            {
              question: "Does the tool support PNG images as well?",
              answer:
                "Yes, in addition to JPG, our tool also fully supports converting PNG images to PDF. You can mix and match both formats in a single conversion.",
            },
            {
              question: "Is there a file size limit for images?",
              answer:
                "While there's not a strict limit on the total number of images, individual image files should ideally be under 50MB for optimal performance during client-side processing.",
            },
          ]}
        />
      </main>
    </>
  );
}
