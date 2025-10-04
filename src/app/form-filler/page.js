"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
// Configure pdfjs worker only on the client to avoid SSR/runtime issues
if (typeof window !== 'undefined' && pdfjs && pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

export default function FormFillerPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [text, setText] = useState("");
  const [pageIdx, setPageIdx] = useState(0); // 0-based index for pages
  const [x, setX] = useState(50); // Default X coordinate
  const [y, setY] = useState(700); // Default Y coordinate
  const [fontSize, setFontSize] = useState(12); // Default font size
  const [color, setColor] = useState("#000000"); // Default black color
  const [numPages, setNumPages] = useState(0); // Total number of pages in the PDF
  const [filledPdfUrl, setFilledPdfUrl] = useState(null); // New state for the result PDF URL
  const [downloadFileName, setDownloadFileName] = useState(""); // New state for download filename

  // Refs for canvas and PDF rendering
  const canvasRef = useRef(null);
  const [pdfDocProxy, setPdfDocProxy] = useState(null); // Stores PDFDocumentProxy from pdfjs
  const renderTaskRef = useRef(null); // To manage pdf.js render tasks

  // Dragging state for text positioning
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0); // Mouse X when drag starts (canvas pixels)
  const [dragStartY, setDragStartY] = useState(0); // Mouse Y when drag starts (canvas pixels)
  const [initialTextX, setInitialTextX] = useState(0); // Text X when drag starts (PDF units)
  const [initialTextY, setInitialTextY] = useState(0); // Text Y when drag starts (PDF units)
  const [pdfPageDimensions, setPdfPageDimensions] = useState({
    width: 0,
    height: 0,
  }); // Current PDF page dimensions in PDF units

  // Cleanup function for pdf.js document and render tasks
  useEffect(() => {
    return () => {
      if (pdfDocProxy) {
        pdfDocProxy.destroy();
      }
      // Cancel any ongoing render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      // Revoke object URL to prevent memory leaks
  try { if (filledPdfUrl && typeof URL !== 'undefined' && !String(filledPdfUrl).startsWith('data:')) URL.revokeObjectURL(filledPdfUrl); } catch { /* ignore */ }
    };
  }, [pdfDocProxy, filledPdfUrl]);

  // Function to render the PDF background to an image for use with pdf-lib
  const renderPdfBackgroundToImage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !pdfDocProxy) {
      return null;
    }

    // Cancel any ongoing render task to prevent conflicts
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    try {
      const page = await pdfDocProxy.getPage(pageIdx + 1); // pdf.js pages are 1-based
      const viewport = page.getViewport({ scale: 1 }); // Get original PDF page dimensions

      // Set canvas dimensions to match PDF page
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Update PDF page dimensions state
      setPdfPageDimensions({ width: viewport.width, height: viewport.height });

      // Render the PDF page to the canvas
      const renderContext = {
        canvasContext: canvas.getContext("2d"),
        viewport: viewport,
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;

      // Convert canvas to image data URL
      return canvas.toDataURL("image/png");
    } catch (e) {
      if (e.name === "RenderingCancelledException") {
        console.log("PDF rendering cancelled during background render:", e);
      } else {
        console.error("Error rendering PDF background:", e);
        setError("Failed to render PDF background.");
      }
      return null;
    }
  }, [pdfDocProxy, pageIdx]); // Dependencies: only re-render background when PDF or page changes

  // Function to draw the live text preview on the canvas
  const drawLivePreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || pdfPageDimensions.width === 0) {
      return;
    }

    const context = canvas.getContext("2d");
    const canvasScale = canvas.width / pdfPageDimensions.width;

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the text at the specified position
    if (text) {
      context.fillStyle = color;
      context.font = `${fontSize * canvasScale}px Helvetica`; // Scale font size
      context.fillText(text, x * canvasScale, canvas.height - y * canvasScale);
    }
  }, [text, x, y, fontSize, color, pdfPageDimensions]); // Dependencies for live text drawing and preview

  // Effect to trigger live preview drawing
  useEffect(() => {
    drawLivePreview();
  }, [drawLivePreview]);

  // Effect to trigger PDF background rendering
  useEffect(() => {
    renderPdfBackgroundToImage();
  }, [renderPdfBackgroundToImage]);

  // Effect to draw live preview after PDF background is rendered
  useEffect(() => {
    if (pdfDocProxy && !filledPdfUrl) {
      drawLivePreview();
    }
  }, [pdfDocProxy, filledPdfUrl, drawLivePreview]);

  // Load PDF and set page count
  const handleFiles = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    setNumPages(0); // Reset page count
    setFilledPdfUrl(null); // Clear previous result

    if (pdfDocProxy) {
      // Destroy previous PDF if exists
      pdfDocProxy.destroy();
      setPdfDocProxy(null);
    }

    if (newFiles.length === 0) return;

    try {
      const file = newFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise; // Load PDF with pdfjs-dist
      setPdfDocProxy(pdf); // Store the PDFDocumentProxy
      setNumPages(pdf.numPages);
    } catch (e) {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      console.error("PDF loading error:", e);
      setFiles([]); // Clear files on error
    }
  };

  // Drag and Drop Handlers for text positioning
  const handleMouseDown = (e) => {
    if (!text) return;
    setIsDragging(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    setDragStartX(e.clientX - rect.left);
    setDragStartY(e.clientY - rect.top);
    setInitialTextX(x);
    setInitialTextY(y);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !text) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const canvasScale = canvas.width / pdfPageDimensions.width;
    const deltaX = (currentX - dragStartX) / canvasScale;
    const deltaY = (currentY - dragStartY) / canvasScale;
    setX(Math.max(0, initialTextX + deltaX));
    setY(Math.max(0, initialTextY - deltaY));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Main function to fill the form and generate the PDF
  const handleFormFill = async () => {
    if (files.length === 0) {
      setError("Please upload a PDF file.");
      return;
    }
    if (!text.trim()) {
      setError("Please enter text to add.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer); // Load original PDF
      const pages = srcDoc.getPages();

      if (pageIdx < 0 || pageIdx >= pages.length) {
        setError("Selected page is out of bounds.");
        setIsProcessing(false);
        return;
      }

      const page = pages[pageIdx];

      // Embed the font
      const font = await srcDoc.embedFont(StandardFonts.Helvetica);

      // Convert hex color to RGB for pdf-lib
      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;
      const textColor = rgb(r, g, b);

      // Draw the text on the selected page
      page.drawText(text, {
        x: x,
        y: y,
        size: fontSize,
        font: font,
        color: textColor,
      });

      const pdfBytes = await srcDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      let url = null;
      try { if (typeof URL !== 'undefined') url = URL.createObjectURL(blob); } catch (err) { console.error('Error creating object URL for filled PDF:', err); }

      setFilledPdfUrl((prev) => {
        try {
          if (prev && typeof URL !== 'undefined' && !String(prev).startsWith('data:')) {
            try { if (prev && typeof URL !== 'undefined' && !String(prev).startsWith('data:')) URL.revokeObjectURL(prev); } catch {}
          }
        } catch {
          /* ignore */
        }
        return url;
      });
      const safeBase = files[0]?.name ? files[0].name.replace(/\.pdf$/i, '').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '') : 'document';
      setDownloadFileName(url ? `filled_form_${safeBase}.pdf` : `filled_form_document.pdf`);

      setError("");
    } catch (err) {
      setError("Failed to fill form. Please try again.");
      console.error("Form fill error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const toolName = "PDF Form Filler";
  const toolDescription = "Fill out your PDF forms online for free. Add text, checkmarks, and signatures to any PDF document. Our intuitive tool allows you to easily add text, select font size and color, and precisely position your input on any page. All processing is done securely in your browser, ensuring your sensitive information remains private.";
  const steps = [
    "Upload your PDF file by dragging it into the dropzone or clicking to select a file.",
    "Enter the text you wish to add in the 'Text to Add' field.",
    "Adjust the font size and color of the text. You can also select the page where you want to add the text.",
    "Drag the text box directly on the PDF preview to position it precisely, or use the X and Y coordinate inputs for fine-tuning.",
    "Click the 'Fill Form & Download' button to apply your text and save the updated PDF.",
  ];
  const faqs = [
    {
      question: "Is it free to fill out PDF forms online?",
      answer:
        "Yes, our PDF Form Filler tool is completely free to use. You can add text to as many PDF forms as you need without any hidden costs or limitations.",
    },
    {
      question: "Are my files secure when filling forms?",
      answer:
        "Absolutely. Your privacy is our top priority. All PDF processing, including adding text to forms, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential.",
    },
    {
      question: "Can I add multiple text fields to a PDF?",
      answer:
        "Currently, our tool allows you to add one text field at a time. To add multiple fields, you would need to repeat the process for each text entry.",
    },
    {
      question: "Can I add signatures or images with this tool?",
      answer:
        "This tool is primarily designed for adding text. For adding signatures, please use our dedicated 'Sign PDF' tool. For adding images, you might consider converting your image to PDF first and then merging it.",
    },
    {
      question: "Does this tool work with interactive PDF forms?",
      answer:
        "Our tool adds text as a new layer on top of the PDF. While it works on all PDFs, it does not interact with pre-existing interactive form fields (AcroForm fields) within the PDF. It's best for adding text to non-fillable PDFs or adding additional text to existing forms.",
    },
  ];

  return (
    <ToolPageLayout
      title="PDF Form Filler"
      subtitle="Fill out your PDF forms online for free. Add text, checkmarks, and signatures to any PDF document."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="form-filler"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Form Filler', href: '/form-filler' }
      ]}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="application/pdf"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload PDF"
          description="Drag & drop or click to select a PDF file (Max 50MB)"
          maxSize={50 * 1024 * 1024}
          isLoading={isProcessing}
        />

        {numPages > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Text Input Controls */}
            <div className="p-4 bg-gray-100 shadow-inner border border-gray-200 space-y-4">
              <h2 className="font-semibold text-xl mb-3 text-gray-100">
                Text Settings
              </h2>
              <div>
                <Label
                  htmlFor="textToAdd"
                  className="text-sm font-medium text-gray-200"
                >
                  Text to Add
                </Label>
                <Input
                  id="textToAdd"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to add to PDF"
                  className="mt-1 bg-gray-950 text-gray-100 border-gray-600 focus:border-gray-600 focus:ring-gray-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="pageSelect"
                    className="text-sm font-medium text-gray-700"
                  >
                    Page
                  </Label>
                  <Select
                    value={String(pageIdx)}
                    onValueChange={(value) => setPageIdx(Number(value))}
                    disabled={numPages === 0}
                  >
                    <SelectTrigger
                      id="pageSelect"
                      className="w-full mt-1 bg-white text-gray-800 border-gray-300 focus:border-gray-600 focus:ring-gray-600"
                    >
                      <SelectValue placeholder="Select page" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-gray-800 border-gray-300">
                      {Array.from({ length: numPages }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          Page {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="fontSize"
                    className="text-sm font-medium text-gray-700"
                  >
                    Font Size: {fontSize}px
                  </Label>
                  <Input
                    id="fontSize"
                    type="range"
                    min="6"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="xPosition"
                    className="text-sm font-medium text-gray-700"
                  >
                    X Position: {x.toFixed(0)}
                  </Label>
                  <Input
                    id="xPosition"
                    type="number"
                    value={x}
                    onChange={(e) => setX(Number(e.target.value))}
                    min={0}
                    className="mt-1 bg-white text-gray-800 border-gray-300 focus:border-gray-600 focus:ring-gray-600"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="yPosition"
                    className="text-sm font-medium text-gray-700"
                  >
                    Y Position: {y.toFixed(0)}
                  </Label>
                  <Input
                    id="yPosition"
                    type="number"
                    value={y}
                    onChange={(e) => setY(Number(e.target.value))}
                    min={0}
                    className="mt-1 bg-white text-gray-800 border-gray-300 focus:border-gray-600 focus:ring-gray-600"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="textColor"
                  className="text-sm font-medium text-gray-700"
                >
                  Text Color
                </Label>
                <Input
                  id="textColor"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="mt-1 h-10 p-1 bg-white border-gray-300"
                />
              </div>
            </div>

            {/* PDF Preview */}
            <div className="p-4 bg-white shadow-inner border border-gray-200">
              <h2 className="font-semibold text-xl mb-3 text-gray-800">
                PDF Preview
              </h2>
              <div className="w-full flex justify-center items-center overflow-hidden relative">
                <canvas
                  ref={canvasRef}
                  className={`max-w-full h-auto border border-gray-300 shadow-lg ${
                    isDragging ? "cursor-grabbing" : "cursor-crosshair"
                  }`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp} // Important: stop dragging if mouse leaves
                ></canvas>
                {isDragging && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-gray-950 text-white text-sm shadow-lg pointer-events-none z-10">
                    DRAGGING
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Click and drag on the preview to position your text
              </p>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}

        <div className="flex justify-center">
          <Button
            onClick={handleFormFill}
            disabled={isProcessing || files.length === 0 || !text.trim()}
            aria-label="Fill form and download PDF"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></span>
                Processing...
              </span>
            ) : (
              "Fill Form & Download"
            )}
          </Button>
        </div>

        {filledPdfUrl && !isProcessing && (
          <div className="flex flex-col gap-6 p-6 bg-gray-100 shadow-lg border border-gray-200 mt-6">
            <div className="w-full text-center space-y-4 text-gray-800">
              <h3 className="text-2xl font-semibold flex items-center justify-center text-green-600">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Form Filled Successfully
              </h3>
              <p className="text-gray-500">
                Your PDF form has been filled with the added text.
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                asChild
                variant="success"
                size="lg"
              >
                <a
                  href={filledPdfUrl}
                  download={downloadFileName}
                  className="text-center flex items-center"
                  onClick={() => {
                    const u = filledPdfUrl;
                    setTimeout(() => {
                      try {
                        if (u && typeof URL !== 'undefined' && !String(u).startsWith('data:')) {
                          try { if (u && typeof URL !== 'undefined' && !String(u).startsWith('data:')) URL.revokeObjectURL(u); } catch { }
                        }
                      } catch {}
                    }, 500);
                  }}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    ></path>
                  </svg>
                  Download Filled PDF
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}