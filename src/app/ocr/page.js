"use client";



import React, { useState, useRef, useEffect, useCallback } from "react";


import Tesseract from "tesseract.js";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import Loader from "@/components/ui/Loader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"; // Import Label
import { Input } from "@/components/ui/input"; // Import Input
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import ToolPageContent from "@/components/ui/ToolPageContent";

// Import pdfjs-dist for PDF rendering
import * as pdfjs from "pdfjs-dist";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function OcrPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [result, setResult] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState(null); // URL for the image passed to Tesseract
  const previewCanvasRef = useRef(null); // Ref for canvas to show PDF/Image preview
  const [pdfDocProxy, setPdfDocProxy] = useState(null); // Stores PDFDocumentProxy from pdfjs
  const renderTaskRef = useRef(null); // Ref to store the ongoing PDF render task
  const [numPages, setNumPages] = useState(0); // Total number of pages in the PDF

  // OCR Options State
  const [ocrMode, setOcrMode] = useState("all"); // 'all', 'single', 'range'
  const [selectedOcrPage, setSelectedOcrPage] = useState(0); // 0-based index for single page OCR
  const [pageRangeStart, setPageRangeStart] = useState(1); // 1-based start page for range OCR
  const [pageRangeEnd, setPageRangeEnd] = useState(1); // 1-based end page for range OCR

  // Initialize Tesseract worker (optional: can be moved to a global context or hook for single instance)
  const workerRef = useRef(null);
  useEffect(() => {
    // Lazy load Tesseract worker
    const loadWorker = async () => {
      workerRef.current = await Tesseract.createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing") {
            // Optional: Update progress for UI
            // console.log(`OCR Progress: ${m.progress * 100}%`);
          }
        },
      });
      console.log("Tesseract worker loaded and initialized."); // Adjusted log message
    };
    loadWorker();

    return () => {
      // Terminate worker on component unmount
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        console.log("Tesseract worker terminated.");
      }
      // Cleanup object URLs
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
      if (pdfDocProxy) {
        pdfDocProxy.destroy();
      }
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [previewImageUrl, pdfDocProxy]); // Added previewImageUrl and pdfDocProxy to dependencies

  // Function to render the uploaded file (image or first PDF page) to canvas
  const renderFileToCanvas = useCallback(async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !files.length) {
      return;
    }

    // Cancel any ongoing render task to prevent conflicts
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    const file = files[0];
    const desiredWidth = 800; // Fixed width for consistent preview size

    try {
      if (file.type === "application/pdf") {
        if (!pdfDocProxy) return; // Wait for pdfDocProxy to be set
        const page = await pdfDocProxy.getPage(1); // Get the first page for preview
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

        // Convert canvas content to image URL for Tesseract
        const imgDataUrl = canvas.toDataURL("image/png", 0.9); // Quality 0.9
        setPreviewImageUrl(imgDataUrl);
      } else if (file.type.startsWith("image/")) {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          canvas.width = desiredWidth;
          canvas.height = desiredWidth / aspectRatio;
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Directly use the image URL for Tesseract if it's already an image
          setPreviewImageUrl(URL.createObjectURL(file));
        };
        img.onerror = () => {
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
  }, [files, pdfDocProxy]); // Re-render if files or PDF proxy changes

  // Effect to trigger canvas rendering when files or pdfDocProxy are updated
  useEffect(() => {
    if (files.length > 0) {
      renderFileToCanvas();
    } else {
      // Clear preview when no files
      const canvas = previewCanvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.height = 0; // Collapse canvas if no file
      }
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }
      if (pdfDocProxy) {
        pdfDocProxy.destroy();
        setPdfDocProxy(null);
      }
    }
  }, [files, pdfDocProxy, previewImageUrl, renderFileToCanvas]); // Added previewImageUrl to dependencies

  const handleFiles = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    setResult(""); // Clear previous OCR result
    setPreviewImageUrl(null); // Clear previous preview URL
    setNumPages(0); // Reset page count

    if (pdfDocProxy) {
      // Destroy previous PDF proxy if exists
      pdfDocProxy.destroy();
      setPdfDocProxy(null);
    }

    if (newFiles.length === 0) return;

    const file = newFiles[0];
    if (file.type === "application/pdf") {
      try {
        const loadingTask = pdfjs.getDocument({
          data: await file.arrayBuffer(),
        });
        const pdf = await loadingTask.promise;
        setPdfDocProxy(pdf);
        setNumPages(pdf.numPages); // Set total pages for PDF
        setPageRangeEnd(pdf.numPages); // Default end range to total pages
      } catch (e) {
        setError("Failed to load PDF. Please ensure it's a valid PDF file.");
        console.error("PDF loading error:", e);
        setFiles([]);
      }
    } else if (file.type.startsWith("image/")) {
      // For images, set files and renderFileToCanvas will handle previewImageUrl
      setNumPages(1); // Single page for image
      // No special pdfDocProxy handling needed here.
    } else {
      setError("Unsupported file type. Please upload a PDF or image file.");
      setFiles([]);
    }
  };

  const handleOcr = async () => {
    if (files.length === 0) {
      setError("Please upload a PDF or image file first.");
      return;
    }
    if (!workerRef.current) {
      setError("Tesseract worker not loaded. Please wait a moment or refresh.");
      return;
    }

    setIsProcessing(true);
    setProcessingMessage("Initializing OCR engine...");
    setError("");
    setResult("");

    try {
      const file = files[0];
      const allExtractedText = [];
      let pagesToOcr = [];

      // Determine which pages to OCR based on mode
      if (file.type === "application/pdf") {
        if (!pdfDocProxy) {
          setError("PDF document not loaded for OCR.");
          setIsProcessing(false);
          return;
        }

        if (ocrMode === "all") {
          pagesToOcr = Array.from({ length: numPages }, (_, i) => i + 1);
        } else if (ocrMode === "single") {
          if (selectedOcrPage < 0 || selectedOcrPage >= numPages) {
            setError(
              `Selected page is out of bounds. Please choose a page between 1 and ${numPages}.`
            );
            setIsProcessing(false);
            return;
          }
          pagesToOcr = [selectedOcrPage + 1]; // Convert 0-based to 1-based
        } else if (ocrMode === "range") {
          if (
            pageRangeStart < 1 ||
            pageRangeEnd > numPages ||
            pageRangeStart > pageRangeEnd
          ) {
            setError(
              `Invalid page range. Please ensure start page is less than or equal to end page, and within 1 to ${numPages}.`
            );
            setIsProcessing(false);
            return;
          }
          pagesToOcr = Array.from(
            { length: pageRangeEnd - pageRangeStart + 1 },
            (_, i) => pageRangeStart + i
          );
        }
      } else {
        // Image file
        pagesToOcr = [1]; // For image, always process as a single "page"
      }

      for (const pageNum of pagesToOcr) {
        setProcessingMessage(
          `Rendering page ${pageNum} for text recognition...`
        );
        let imageUrlToOcr = previewImageUrl; // Default to existing preview for single image or first page

        if (file.type === "application/pdf") {
          // For PDFs, render each specific page to an offscreen canvas
          const offscreenCanvas = document.createElement("canvas");
          const offscreenContext = offscreenCanvas.getContext("2d");

          const page = await pdfDocProxy.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1 });
          const desiredOcrWidth = 1200; // Higher resolution for better OCR
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
          setProcessingMessage(`Recognizing text on page ${pageNum}...`);
          const { data } = await workerRef.current.recognize(imageUrlToOcr);
          allExtractedText.push(`--- Page ${pageNum} ---\n${data.text.trim()}`);
        }
      }

      setResult(allExtractedText.join("\n\n"));
      setProcessingMessage("Text extraction complete!");
    } catch (e) {
      setError(
        "Failed to extract text. Ensure the text is clear and readable."
      );
      console.error("OCR error:", e);
    } finally {
      setIsProcessing(false);
      // Clear message after a short delay
      setTimeout(() => setProcessingMessage(""), 2000);
    }
  };

  const handleCopyText = () => {
    if (result) {
      document.execCommand("copy", false, result); // Use execCommand for broader compatibility in iframes
      setError("Text copied to clipboard!");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <>
      <main className="flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
        <Card className="bg-gray-800 border-gray-700 w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              OCR (Text Recognition)
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Extract readable text from scanned PDF documents and image files.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <FileDropzone
              accept="application/pdf,image/*"
              multiple={false}
              onFiles={handleFiles}
              error={error}
              setError={setError}
              label="Upload PDF or Image"
              description="Drag & drop or click to select a PDF or image file (Max 50MB)"
              maxSize={50 * 1024 * 1024}
              isLoading={isProcessing}
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
                      style={{ maxWidth: "100%", height: "auto" }} // Ensure responsiveness
                    ></canvas>
                  </div>
                </div>

                {numPages > 0 && ( // Only show OCR options if a file (PDF or image) is loaded
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700 space-y-4">
                    <h2 className="font-semibold text-xl mb-3 text-gray-100">
                      OCR Options
                    </h2>
                    <div>
                      <Label
                        htmlFor="ocrMode"
                        className="text-sm font-medium text-gray-200"
                      >
                        Select OCR Scope
                      </Label>
                      <Select
                        value={ocrMode}
                        onValueChange={(value) => setOcrMode(value)}
                        disabled={files.length === 0}
                      >
                        <SelectTrigger
                          id="ocrMode"
                          className="w-full mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                        >
                          <SelectValue placeholder="Select OCR Scope" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-gray-100 border-gray-600">
                          <SelectItem
                            value="all"
                            disabled={
                              numPages === 1 &&
                              files[0]?.type !== "application/pdf"
                            }
                          >
                            All Pages
                          </SelectItem>
                          <SelectItem value="single">Single Page</SelectItem>
                          <SelectItem
                            value="range"
                            disabled={
                              numPages === 1 &&
                              files[0]?.type !== "application/pdf"
                            }
                          >
                            Page Range
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {ocrMode === "single" && (
                      <div>
                        <Label
                          htmlFor="selectedPage"
                          className="text-sm font-medium text-gray-200"
                        >
                          Page Number (1 to {numPages})
                        </Label>
                        <Input
                          id="selectedPage"
                          type="number"
                          value={selectedOcrPage + 1} // Display 1-based, store 0-based
                          onChange={(e) =>
                            setSelectedOcrPage(
                              Math.max(
                                0,
                                Math.min(
                                  Number(e.target.value) - 1,
                                  numPages - 1
                                )
                              )
                            )
                          }
                          min={1}
                          max={numPages}
                          className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {ocrMode === "range" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="pageRangeStart"
                            className="text-sm font-medium text-gray-200"
                          >
                            Start Page (1 to {numPages})
                          </Label>
                          <Input
                            id="pageRangeStart"
                            type="number"
                            value={pageRangeStart}
                            onChange={(e) =>
                              setPageRangeStart(
                                Math.max(
                                  1,
                                  Math.min(Number(e.target.value), numPages)
                                )
                              )
                            }
                            min={1}
                            max={numPages}
                            className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="pageRangeEnd"
                            className="text-sm font-medium text-gray-200"
                          >
                            End Page (1 to {numPages})
                          </Label>
                          <Input
                            id="pageRangeEnd"
                            type="number"
                            value={pageRangeEnd}
                            onChange={(e) =>
                              setPageRangeEnd(
                                Math.max(
                                  1,
                                  Math.min(Number(e.target.value), numPages)
                                )
                              )
                            }
                            min={1}
                            max={numPages}
                            className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                {error}
              </Alert>
            )}

            <Button
              variant="success"
              className="mt-4 w-full max-w-xs mx-auto block"
              onClick={handleOcr}
              disabled={
                isProcessing ||
                !files.length ||
                !workerRef.current ||
                (files[0]?.type === "application/pdf" && numPages === 0)
              }
              aria-label="Extract text from file"
            >
              {isProcessing ? "Processing..." : "Extract Text"}
            </Button>

            {isProcessing && processingMessage && (
              <div className="mt-4 text-center text-gray-400">
                <Loader size="sm" color="gray" className="inline-block mr-2" message={processingMessage} />
              </div>
            )}

            {result && (
              <Card className="mt-6 bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-100">
                    Extracted Text
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    readOnly
                    value={result}
                    className="w-full min-h-[200px] bg-gray-800 text-gray-200 border-gray-600 p-3 rounded-md resize-y font-mono"
                    aria-label="Extracted text"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleCopyText}
                    className="w-full sm:w-auto"
                    aria-label="Copy extracted text to clipboard"
                  >
                    Copy Text
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
        <ToolPageContent
          toolName="OCR (Text Recognition)"
          toolDescription="Extract readable and editable text from your scanned PDF documents and image files with our free online OCR tool. Convert your non-searchable PDFs into searchable and selectable text, making it easy to copy, edit, and reuse content from scanned documents. All processing is done securely in your browser, ensuring your files remain private."
          steps={[
            "Upload your PDF or image file by dragging it into the dropzone or clicking to select a file.",
            "Choose the scope of OCR: all pages, a single page, or a specific page range (for PDFs).",
            "Click the 'Extract Text' button. Our OCR engine will process the visual content and convert it into text.",
            "Once processed, the extracted text will appear in the text area. You can then copy it to your clipboard or save it.",
          ]}
          faqs={[
            {
              question: "Is it free to OCR a PDF or image?",
              answer:
                "Yes, our OCR tool is completely free to use. You can extract text from as many PDFs and images as you need without any hidden costs or limitations.",
            },
            {
              question: "Are my files secure when using OCR?",
              answer:
                "Absolutely. Your privacy is our top priority. All OCR processing happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential.",
            },
            {
              question: "What is the accuracy of the OCR tool?",
              answer:
                "The accuracy of our OCR tool depends heavily on the quality of the uploaded file. For best results, we recommend using high-resolution scans with clear, well-defined text. Blurry or low-quality images may result in lower accuracy.",
            },
            {
              question: "Can I OCR multiple pages from a PDF?",
              answer:
                "Yes, you can choose to OCR all pages of a PDF, a single specific page, or a custom range of pages. The extracted text from multiple pages will be concatenated with clear page separators.",
            },
            {
              question: "What languages does the OCR tool support?",
              answer:
                "Currently, our OCR tool primarily supports English. We are working to expand language support in the future.",
            },
          ]}
        />
      </main>
    </>
  );
}