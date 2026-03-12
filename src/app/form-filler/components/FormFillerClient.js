"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

import { loadPdfLib, loadPdfJs } from "@/lib/pdfjsWorker";
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
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";
import { toast } from "sonner";

export default function FormFillerClient() {
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
      try { if (filledPdfUrl) safeRevokeObjectURL(filledPdfUrl); } catch { /* ignore */ }
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
      // Load pdfjs dynamically
      const pdfjs = await loadPdfJs();
      const file = newFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise; // Load PDF with pdfjs-dist
      setPdfDocProxy(pdf); // Store the PDFDocumentProxy
      setNumPages(pdf.numPages);
    } catch {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
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
      const { PDFDocument, rgb, StandardFonts } = await loadPdfLib();
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
      const url = safeCreateObjectURL(blob);

      setFilledPdfUrl((prev) => {
        if (prev) safeRevokeObjectURL(prev);
        return url;
      });
      const safeBase = files[0]?.name ? files[0].name.replace(/\.pdf$/i, '').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '') : 'document';
      setDownloadFileName(url ? `filled_form_${safeBase}.pdf` : `filled_form_document.pdf`);

      setError("");
    } catch {
      setError("Failed to fill form. Please try again.");
      toast.error("Failed to fill form. Please try again.");
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
      question: "Is my data secure?",
      answer:
        "Absolutely. All processing is done locally in your browser. Your PDF files are never uploaded to our servers, ensuring your data remains private and secure.",
    },
    {
      question: "Can I add text to multiple pages?",
      answer:
        "Currently, you can add text to one page at a time. However, you can process the same document multiple times to add text to different pages.",
    },
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF Form Filler", href: "/form-filler" },
      ]}
      currentTool="form-filler"
    >
      <div className="space-y-6">
        <FileDropzone
          accept=".pdf"
          onFiles={handleFiles}
          maxFiles={1}
          label="Upload PDF to Fill"
          description="Drag & drop a PDF file here, or click to select one"
        />

        {error && (
          <Alert variant="destructive">
            <div className="text-destructive">{error}</div>
          </Alert>
        )}

        {files.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Controls Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-background dark:bg-background p-6 rounded-none shadow-sm border border-border dark:border-border">
                <h3 className="text-lg font-semibold mb-4">Text Settings</h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="text-input">Text to Add</Label>
                    <Input
                      id="text-input"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Enter text here..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="page-select">Page</Label>
                    <Select
                      value={pageIdx.toString()}
                      onValueChange={(val) => setPageIdx(parseInt(val))}
                    >
                      <SelectTrigger id="page-select" className="mt-1">
                        <SelectValue placeholder="Select Page" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: numPages }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            Page {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="font-size">Font Size</Label>
                      <Input
                        id="font-size"
                        type="number"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        min="1"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="color-picker">Color</Label>
                      <div className="flex items-center mt-1">
                        <Input
                          id="color-picker"
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-12 h-10 p-1 mr-2"
                        />
                        <span className="text-sm text-foreground">{color}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="x-coord">X Position</Label>
                      <Input
                        id="x-coord"
                        type="number"
                        value={Math.round(x)}
                        onChange={(e) => setX(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="y-coord">Y Position</Label>
                      <Input
                        id="y-coord"
                        type="number"
                        value={Math.round(y)}
                        onChange={(e) => setY(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleFormFill}
                  disabled={isProcessing || !text}
                  className="w-full mt-6"
                >
                  {isProcessing ? "Processing..." : "Fill Form & Download"}
                </Button>
              </div>

              {filledPdfUrl && (
                <div className="bg-muted p-4 rounded-none border border-border">
                  <h4 className="font-semibold text-foreground mb-2">Success!</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your PDF has been updated with the text.
                  </p>
                  <a
                    href={filledPdfUrl}
                    download={downloadFileName}
                    className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-none hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Download PDF
                  </a>
                </div>
              )}
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-2">
              <div className="bg-background dark:bg-background p-4 rounded-none border border-border dark:border-border overflow-auto flex justify-center min-h-[600px]">
                <div className="relative shadow-lg">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="max-w-full h-auto cursor-crosshair bg-background"
                    style={{
                      backgroundImage: !pdfDocProxy ? "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiIvPgo8cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlZWUiLz4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlZWUiLz4KPC9zdmc+')" : "none"
                    }}
                  />
                  {!pdfDocProxy && (
                    <div className="absolute inset-0 flex items-center justify-center text-foreground">
                      Preview will appear here
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-foreground mt-2 text-center">
                Drag the text on the preview to position it.
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
