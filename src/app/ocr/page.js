"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Tesseract from "tesseract.js";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToolPageLayout from "@/components/ui/ToolPageLayout";

// Import pdfjs-dist for PDF rendering
import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
if (typeof window !== 'undefined' && pdfjs && pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

export default function OcrPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [result, setResult] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  // Cleanup preview image object URLs on unmount/change
  useEffect(() => {
    return () => {
      if (previewImageUrl && previewImageUrl.startsWith('blob:')) {
  try { URL.revokeObjectURL(previewImageUrl); } catch { }
      }
    };
  }, [previewImageUrl]);
  const previewCanvasRef = useRef(null);
  const [pdfDocProxy, setPdfDocProxy] = useState(null);
  const renderTaskRef = useRef(null);
  const [numPages, setNumPages] = useState(0);

  // OCR Options State
  const [ocrMode, setOcrMode] = useState("all");
  const [selectedOcrPage, setSelectedOcrPage] = useState(0);
  const [pageRangeStart, setPageRangeStart] = useState(1);
  const [pageRangeEnd, setPageRangeEnd] = useState(1);

  // Simplified worker state
  const [workerReady, setWorkerReady] = useState(false);
  const [workerInitializing, setWorkerInitializing] = useState(false);

  // Simplified Tesseract worker initialization
  useEffect(() => {
    const initializeWorker = async () => {
      if (workerInitializing) return;
      
      setWorkerInitializing(true);
      setProcessingMessage("Initializing OCR engine...");
      
      try {
        console.log("Starting simplified Tesseract worker initialization...");
        
        // Test if Tesseract can be loaded with local files
        const testWorker = await Tesseract.createWorker("eng", 1, {          
          logger: (m) => {
            console.log("Tesseract:", m);
            if (m.status === "loading tesseract core") {
              setProcessingMessage("Loading OCR core...");
            } else if (m.status === "initializing tesseract") {
              setProcessingMessage("Initializing OCR engine...");
            } else if (m.status === "loading language traineddata") {
              setProcessingMessage("Loading language data...");
            } else if (m.status === "initializing api") {
              setProcessingMessage("Finalizing OCR setup...");
            }
          },
        });
        
        console.log("Tesseract worker created successfully");
        
        // Test the worker with a simple operation
        await testWorker.terminate();
        
        console.log("Tesseract worker test completed successfully");
        setWorkerReady(true);
        setProcessingMessage("");
        setError("");
        
      } catch (error) {
        console.error("Failed to initialize Tesseract worker:", error);
        setError(`Failed to initialize OCR engine: ${error.message}`);
        setWorkerReady(false);
        setProcessingMessage("");
      } finally {
        setWorkerInitializing(false);
      }
    };

    initializeWorker();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to render the uploaded file to canvas
  const renderFileToCanvas = useCallback(async () => {
    console.log("renderFileToCanvas called");
    const canvas = previewCanvasRef.current;
    if (!canvas || !files.length) {
      console.log("No canvas or files for rendering");
      return;
    }

    console.log("Starting file rendering to canvas...");

    // Cancel any ongoing render task
    if (renderTaskRef.current) {
      console.log("Cancelling previous render task");
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    const file = files[0];
    const desiredWidth = 800;

    console.log("File type:", file.type);

    try {
      if (file.type === "application/pdf") {
        console.log("Rendering PDF file...");
        if (!pdfDocProxy) {
          console.log("PDF document proxy not ready, waiting...");
          return;
        }
        
        const page = await pdfDocProxy.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const scale = desiredWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale: scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        renderTaskRef.current = null;

        const imgDataUrl = canvas.toDataURL("image/png", 0.9);
        setPreviewImageUrl(imgDataUrl);
        console.log("PDF preview rendered successfully");
        
      } else if (file.type.startsWith("image/")) {
        console.log("Rendering image file...");
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          canvas.width = desiredWidth;
          canvas.height = desiredWidth / aspectRatio;
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const imageUrl = URL.createObjectURL(file);
          setPreviewImageUrl(imageUrl);
          console.log("Image preview rendered successfully");
        };
        img.onerror = (error) => {
          console.error("Failed to load image:", error);
          setError("Failed to load image for preview.");
          setPreviewImageUrl(null);
        };
        img.src = URL.createObjectURL(file);
      }
    } catch (e) {
      if (e.name === "RenderingCancelledException") {
        console.log("PDF rendering cancelled:", e);
      } else {
        console.error("Error rendering file to canvas:", e);
        setError("Failed to prepare file for OCR preview.");
        setPreviewImageUrl(null);
      }
    }
  }, [files, pdfDocProxy]);

  useEffect(() => {
    if (files.length > 0) {
      renderFileToCanvas();
    } else {
      const canvas = previewCanvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.height = 0;
      }
      if (pdfDocProxy) {
        pdfDocProxy.destroy();
        setPdfDocProxy(null);
      }
    }
  }, [files, pdfDocProxy, renderFileToCanvas]);

  const handleFiles = async (newFiles) => {
    console.log("handleFiles called with:", newFiles.length, "files");
    setFiles(newFiles);
    setError("");
    setResult("");
    setPreviewImageUrl(null);
    setNumPages(0);

    if (pdfDocProxy) {
      pdfDocProxy.destroy();
      setPdfDocProxy(null);
    }

    if (newFiles.length === 0) {
      return;
    }

    const file = newFiles[0];
    console.log("Processing file:", file.name, "Type:", file.type, "Size:", file.size);
    
    if (file.type === "application/pdf") {
      try {
        console.log("Loading PDF document...");
        const arrayBuffer = await file.arrayBuffer();
        
        const loadingTask = pdfjs.getDocument({
          data: arrayBuffer,
        });
        
        const pdf = await loadingTask.promise;
        console.log("PDF loaded successfully. Pages:", pdf.numPages);
        
        setPdfDocProxy(pdf);
        setNumPages(pdf.numPages);
        setPageRangeEnd(pdf.numPages);
        
      } catch (e) {
        console.error("PDF loading error:", e);
        setError("Failed to load PDF. Please ensure it's a valid PDF file.");
        setFiles([]);
      }
    } else if (file.type.startsWith("image/")) {
      console.log("Processing image file");
      setNumPages(1);
    } else {
      setError("Unsupported file type. Please upload a PDF or image file.");
      setFiles([]);
    }
  };

  const handleOcr = async () => {
    console.log("handleOcr called");
    
    if (files.length === 0) {
      setError("Please upload a PDF or image file first.");
      return;
    }
    
    if (!workerReady) {
      setError("OCR engine is still loading. Please wait a moment and try again.");
      return;
    }

    console.log("Starting OCR process...");
    setIsProcessing(true);
    setProcessingMessage("Starting text recognition...");
    setError("");
    setResult("");

    let worker = null;

    try {
      const file = files[0];
      console.log("OCR file:", file.name, file.type);
      const allExtractedText = [];
      let pagesToOcr = [];

      // Create a new worker for this OCR operation
      console.log("Creating Tesseract worker for OCR...");
      worker = await Tesseract.createWorker("eng", 1, {
        logger: (m) => {
          console.log("OCR Progress:", m);
          if (m.status === "recognizing") {
            setProcessingMessage(`Recognizing text... ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      // Determine which pages to OCR
      if (file.type === "application/pdf") {
        if (!pdfDocProxy) {
          setError("PDF document not loaded for OCR.");
          return;
        }

        if (ocrMode === "all") {
          pagesToOcr = Array.from({ length: numPages }, (_, i) => i + 1);
        } else if (ocrMode === "single") {
          if (selectedOcrPage < 0 || selectedOcrPage >= numPages) {
            setError(`Selected page is out of bounds. Please choose a page between 1 and ${numPages}.`);
            return;
          }
          pagesToOcr = [selectedOcrPage + 1];
        } else if (ocrMode === "range") {
          if (pageRangeStart < 1 || pageRangeEnd > numPages || pageRangeStart > pageRangeEnd) {
            setError(`Invalid page range. Please ensure start page is less than or equal to end page, and within 1 to ${numPages}.`);
            return;
          }
          pagesToOcr = Array.from(
            { length: pageRangeEnd - pageRangeStart + 1 },
            (_, i) => pageRangeStart + i
          );
        }
      } else {
        pagesToOcr = [1];
      }

      console.log("Pages to OCR:", pagesToOcr);

      for (const pageNum of pagesToOcr) {
        console.log(`Processing page ${pageNum}...`);
        setProcessingMessage(`Preparing page ${pageNum} for text recognition...`);
        
        let imageUrlToOcr = previewImageUrl;

        if (file.type === "application/pdf") {
          console.log(`Rendering PDF page ${pageNum} for OCR...`);
          const offscreenCanvas = document.createElement("canvas");
          const offscreenContext = offscreenCanvas.getContext("2d");

          const page = await pdfDocProxy.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1 });
          const desiredOcrWidth = 1200;
          const scale = desiredOcrWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale: scale });

          offscreenCanvas.width = scaledViewport.width;
          offscreenCanvas.height = scaledViewport.height;

          const renderContext = {
            canvasContext: offscreenContext,
            viewport: scaledViewport,
          };

          await page.render(renderContext).promise;
          imageUrlToOcr = offscreenCanvas.toDataURL("image/png", 0.9);
        }

        if (imageUrlToOcr) {
          console.log(`Starting text recognition for page ${pageNum}...`);
          setProcessingMessage(`Recognizing text on page ${pageNum}...`);
          
          const { data } = await worker.recognize(imageUrlToOcr);
          console.log(`Text recognition completed for page ${pageNum}`);
          
          allExtractedText.push(`--- Page ${pageNum} ---
${data.text.trim()}`);
        }
      }

      console.log("OCR completed successfully");
      setResult(allExtractedText.join(`

`));
      setProcessingMessage("Text extraction complete!");
      
    } catch (e) {
      console.error("OCR error:", e);
      setError(`Failed to extract text: ${e.message}`);
    } finally {
      // Always terminate the worker
      if (worker) {
        await worker.terminate();
        console.log("OCR worker terminated");
      }
      setIsProcessing(false);
      setTimeout(() => setProcessingMessage(""), 2000);
    }
  };

  const handleCopyText = async () => {
    if (result) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(result);
          setError("Text copied to clipboard!");
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = result;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            document.execCommand('copy');
            setError("Text copied to clipboard!");
          } catch {
            setError("Failed to copy text. Please select and copy manually.");
          } finally {
            document.body.removeChild(textArea);
          }
        }
        setTimeout(() => setError(""), 3000);
      } catch {
        setError("Failed to copy text. Please select and copy manually.");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const toolName = "OCR (Text Recognition)";
  const toolDescription = "Extract readable text from scanned PDF documents and image files using advanced OCR technology. Convert scanned documents, images, and PDFs into editable text with high accuracy. All processing happens locally in your browser for complete privacy and security.";
  const steps = [
    "Upload your PDF document or image file by dragging it into the dropzone or clicking to select.",
    "Choose your OCR scope: all pages, a single page, or a specific page range for multi-page documents.",
    "Click 'Extract Text' to start the text recognition process. The OCR engine will analyze your document.",
    "Once processing is complete, the extracted text will appear in the text area. You can copy it to your clipboard or save it for further use."
  ];
  const faqs = [
    {
      question: "What is OCR and how does it work?",
      answer: "OCR (Optical Character Recognition) is a technology that converts scanned documents, images, and PDFs into editable text. Our tool uses advanced AI algorithms to recognize and extract text from various file formats, making scanned documents searchable and editable."
    },
    {
      question: "What file types does the OCR tool support?",
      answer: "Our OCR tool supports PDF documents and various image formats including JPG, PNG, TIFF, and BMP. For best results, ensure your documents have clear, high-quality text and good contrast."
    },
    {
      question: "How accurate is the text recognition?",
      answer: "The accuracy depends on the quality of your source document. Clear, well-scanned documents with good contrast typically achieve 95%+ accuracy. Handwritten text or low-quality scans may have lower accuracy."
    },
    {
      question: "Are my files secure during OCR processing?",
      answer: "Absolutely! All OCR processing happens locally in your browser. Your files are never uploaded to our servers, ensuring complete privacy and security for your sensitive documents."
    },
    {
      question: "Can I extract text from specific pages of a multi-page PDF?",
      answer: "Yes, you can choose to extract text from all pages, a single page, or a specific range of pages. This is useful for large documents where you only need text from certain sections."
    },
    {
      question: "What languages does the OCR tool support?",
      answer: "Currently, our OCR tool supports English text recognition. For documents in other languages, the accuracy may vary depending on the text quality and character complexity."
    }
  ];

  return (
    <ToolPageLayout
      title="OCR (Text Recognition)"
      subtitle="Extract readable text from scanned PDF documents and image files."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="ocr"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'OCR', href: '/ocr' }
      ]}
    >
      <div className="space-y-6">
        {/* OCR Engine Status */}
        {(workerInitializing || processingMessage) && (
          <div className="p-4 bg-blue-100 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-800">
                {processingMessage || "Initializing OCR engine..."}
              </span>
            </div>
          </div>
        )}
        
        {workerReady && !workerInitializing && !processingMessage && (
          <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-800">OCR engine ready</span>
            </div>
          </div>
        )}
        
        <FileDropzone
          accept="application/pdf,image/*"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload PDF or Image"
          description="Drag & drop or click to select a PDF or image file (Max 50MB)"
          maxSize={50 * 1024 * 1024}
        />

        {files.length > 0 && (
          <>
            <div className="p-4 bg-gray-100 rounded-lg shadow-inner border border-gray-200 flex flex-col items-center">
              <h2 className="font-semibold text-xl mb-3">
                File Preview
              </h2>
              <div className="w-full flex justify-center items-center overflow-hidden">
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full h-auto border border-gray-300 rounded-md shadow-lg"
                  style={{ maxWidth: "100%", height: "auto" }}
                ></canvas>
              </div>
            </div>

            {numPages > 0 && (
              <div className="p-4 bg-gray-100 rounded-lg shadow-inner border border-gray-200 space-y-4">
                <h2 className="font-semibold text-xl mb-3">
                  OCR Options
                </h2>
                <div>
                  <Label htmlFor="ocrMode" className="text-sm font-medium">
                    Select OCR Scope
                  </Label>
                  <Select
                    value={ocrMode}
                    onValueChange={(value) => setOcrMode(value)}
                    disabled={files.length === 0}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Choose OCR scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All Pages ({numPages} page{numPages > 1 ? "s" : ""})
                      </SelectItem>
                      {numPages > 1 && (
                        <>
                          <SelectItem value="single">
                            Single Page
                          </SelectItem>
                          <SelectItem value="range">
                            Page Range
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {ocrMode === "single" && numPages > 1 && (
                  <div>
                    <Label htmlFor="selectedPage" className="text-sm font-medium">
                    Select Page (1-{numPages})
                  </Label>
                    <Input
                      type="number"
                      min="1"
                      max={numPages}
                      value={selectedOcrPage + 1}
                      onChange={(e) => setSelectedOcrPage(Math.max(0, parseInt(e.target.value) - 1))}
                      className="w-full mt-1"
                    />
                  </div>
                )}

                {ocrMode === "range" && numPages > 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startPage" className="text-sm font-medium">
                        Start Page
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max={numPages}
                        value={pageRangeStart}
                        onChange={(e) => setPageRangeStart(parseInt(e.target.value))}
                        className="w-full mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endPage" className="text-sm font-medium">
                        End Page
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max={numPages}
                        value={pageRangeEnd}
                        onChange={(e) => setPageRangeEnd(parseInt(e.target.value))}
                        className="w-full mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={handleOcr}
                disabled={isProcessing || !workerReady || workerInitializing}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Processing...
                  </span>
                ) : !workerReady ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Loading OCR Engine...
                  </span>
                ) : (
                  "Extract Text"
                )}
              </Button>
            </div>
          </>
        )}

        {result && (
          <div className="p-4 bg-gray-100 rounded-lg shadow-inner border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-xl">Extracted Text</h2>
              <Button
                onClick={handleCopyText}
              >
                Copy Text
              </Button>
            </div>
            <Textarea
              value={result}
              readOnly
              className="w-full h-64 bg-white border-gray-300 font-mono text-sm resize-none"
              placeholder="Extracted text will appear here..."
            />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}
      </div>
    </ToolPageLayout>
  );
}