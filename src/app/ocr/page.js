"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Tesseract from "tesseract.js";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import Loader from "@/components/ui/Loader";
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

// Import pdfjs-dist for PDF rendering
import * as pdfjs from "pdfjs-dist";
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.js`;

export default function OcrPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [result, setResult] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
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
          
          allExtractedText.push(`--- Page ${pageNum} ---\n${data.text.trim()}`);
        }
      }

      console.log("OCR completed successfully");
      setResult(allExtractedText.join("\n\n"));
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

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-12 md:py-20 px-4">
        <div className="max-w-4xl w-full">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            OCR (Text Recognition)
          </h1>
          <p className="mb-8 text-lg text-gray-300 text-center">
            Extract readable text from scanned PDF documents and image files.
          </p>
          
          {/* OCR Engine Status */}
          {(workerInitializing || processingMessage) && (
            <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Loader className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300">
                  {processingMessage || "Initializing OCR engine..."}
                </span>
              </div>
            </div>
          )}
          
          {workerReady && !workerInitializing && !processingMessage && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-green-300">OCR engine ready</span>
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
              <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700 flex flex-col items-center">
                <h2 className="font-semibold text-xl mb-3 text-gray-100">
                  File Preview
                </h2>
                <div className="w-full flex justify-center items-center overflow-hidden">
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full h-auto border border-gray-600 rounded-md shadow-lg"
                    style={{ maxWidth: "100%", height: "auto" }}
                  ></canvas>
                </div>
              </div>

              {numPages > 0 && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700 space-y-4">
                  <h2 className="font-semibold text-xl mb-3 text-gray-100">
                    OCR Options
                  </h2>
                  <div>
                    <Label htmlFor="ocrMode" className="text-sm font-medium text-gray-200">
                      Select OCR Scope
                    </Label>
                    <Select
                      value={ocrMode}
                      onValueChange={(value) => setOcrMode(value)}
                      disabled={files.length === 0}
                    >
                      <SelectTrigger className="w-full mt-1 bg-gray-700 border-gray-600 text-gray-100">
                        <SelectValue placeholder="Choose OCR scope" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="all" className="text-gray-100 hover:bg-gray-600">
                          All Pages ({numPages} page{numPages > 1 ? "s" : ""})
                        </SelectItem>
                        {numPages > 1 && (
                          <>
                            <SelectItem value="single" className="text-gray-100 hover:bg-gray-600">
                              Single Page
                            </SelectItem>
                            <SelectItem value="range" className="text-gray-100 hover:bg-gray-600">
                              Page Range
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {ocrMode === "single" && numPages > 1 && (
                    <div>
                      <Label htmlFor="selectedPage" className="text-sm font-medium text-gray-200">
                        Select Page (1-{numPages})
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max={numPages}
                        value={selectedOcrPage + 1}
                        onChange={(e) => setSelectedOcrPage(Math.max(0, parseInt(e.target.value) - 1))}
                        className="w-full mt-1 bg-gray-700 border-gray-600 text-gray-100"
                      />
                    </div>
                  )}

                  {ocrMode === "range" && numPages > 1 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startPage" className="text-sm font-medium text-gray-200">
                          Start Page
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max={numPages}
                          value={pageRangeStart}
                          onChange={(e) => setPageRangeStart(parseInt(e.target.value))}
                          className="w-full mt-1 bg-gray-700 border-gray-600 text-gray-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endPage" className="text-sm font-medium text-gray-200">
                          End Page
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max={numPages}
                          value={pageRangeEnd}
                          onChange={(e) => setPageRangeEnd(parseInt(e.target.value))}
                          className="w-full mt-1 bg-gray-700 border-gray-600 text-gray-100"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleOcr}
                  disabled={isProcessing || !workerReady || workerInitializing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <Loader className="w-5 h-5" />
                      <span>Processing...</span>
                    </div>
                  ) : !workerReady ? (
                    <div className="flex items-center space-x-2">
                      <Loader className="w-5 h-5" />
                      <span>Loading OCR Engine...</span>
                    </div>
                  ) : (
                    "Extract Text"
                  )}
                </Button>
              </div>
            </>
          )}

          {result && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-xl text-gray-100">Extracted Text</h2>
                <Button
                  onClick={handleCopyText}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Copy Text
                </Button>
              </div>
              <Textarea
                value={result}
                readOnly
                className="w-full h-64 bg-gray-700 border-gray-600 text-gray-100 font-mono text-sm resize-none"
                placeholder="Extracted text will appear here..."
              />
            </div>
          )}

          {error && (
            <Alert className="mt-4 border-red-500 bg-red-900/30 text-red-300">
              {error}
            </Alert>
          )}
        </div>
      </div>
    </>
  );
}