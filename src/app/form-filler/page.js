"use client";

import { Metadata } from 'next';

import React, { useState, useRef, useEffect, useCallback } from "react";


import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToolPageContent from "@/components/ui/ToolPageContent";

// Import pdfjs-dist for PDF rendering
import * as pdfjs from "pdfjs-dist";
// Set the worker source for pdf.js. Using a CDN for simplicity.
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
  const canvasRef = useRef(null); // Ref for the main visible canvas element
  const [pdfDocProxy, setPdfDocProxy] = useState(null); // Stores PDFDocumentProxy from pdfjs

  // New state for dragging functionality
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0); // Mouse X when drag starts (canvas pixels)
  const [dragStartY, setDragStartY] = useState(0); // Mouse Y when drag starts (canvas pixels)
  const [initialTextX, setInitialTextX] = useState(0); // Text X when drag starts (PDF units)
  const [initialTextY, setInitialTextY] = useState(0); // Text Y when drag starts (PDF units)
  const [pdfPageDimensions, setPdfPageDimensions] = useState({
    width: 0,
    height: 0,
  }); // Dimensions of the PDF page in PDF units (from pdf.js viewport)

  // Ref to store the pre-rendered PDF page as an ImageBitmap (for fast drawing)
  const pdfImageRef = useRef(null);

  // Helper function to convert hex color to RGB (0-1 range for pdf-lib)
  const hexToRgbNormalized = (hex) => {
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    return rgb(r, g, b);
  };

  // 1. Function to render PDF background to an offscreen buffer (ImageBitmap)
  // This is a heavy operation, only triggered when PDF file or page changes.
  const renderPdfBackgroundToImage = useCallback(async () => {
    if (!pdfDocProxy || numPages === 0) {
      if (pdfImageRef.current) {
        pdfImageRef.current.close(); // Release ImageBitmap memory
        pdfImageRef.current = null;
      }
      setPdfPageDimensions({ width: 0, height: 0 });
      return;
    }

    try {
      const page = await pdfDocProxy.getPage(pageIdx + 1); // pdfjs pages are 1-based
      const viewport = page.getViewport({ scale: 1 }); // Get original PDF page dimensions

      // Create an offscreen canvas for rendering
      const offscreenCanvas = document.createElement("canvas");
      const offscreenContext = offscreenCanvas.getContext("2d");

      // Set offscreen canvas dimensions based on a fixed width for consistent quality
      const renderWidth = 800; // This matches the main canvas width
      const renderScale = renderWidth / viewport.width;
      const renderScaledViewport = page.getViewport({ scale: renderScale });

      offscreenCanvas.width = renderScaledViewport.width;
      offscreenCanvas.height = renderScaledViewport.height;

      const renderContext = {
        canvasContext: offscreenContext,
        viewport: renderScaledViewport,
      };

      // Perform the PDF rendering to the offscreen canvas
      await page.render(renderContext).promise;

      // Create an ImageBitmap from the offscreen canvas for fast drawing
      if (pdfImageRef.current) {
        pdfImageRef.current.close(); // Close previous ImageBitmap if exists
      }
      pdfImageRef.current = await createImageBitmap(offscreenCanvas);

      // Store the actual PDF page dimensions for coordinate calculations later
      setPdfPageDimensions({ width: viewport.width, height: viewport.height });
    } catch (e) {
      console.error("Error rendering PDF background to image:", e);
      setError("Failed to render PDF preview.");
      if (pdfImageRef.current) {
        pdfImageRef.current.close();
        pdfImageRef.current = null;
      }
      setPdfPageDimensions({ width: 0, height: 0 });
    }
  }, [pdfDocProxy, pageIdx, numPages]); // Dependencies: only re-render background when PDF or page changes

  // 2. Function to draw the entire live preview (background + text) onto the main canvas
  // This is a fast operation, triggered by any text/position/style changes.
  const drawLivePreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pdfImageRef.current || !pdfPageDimensions.width) {
      // Clear canvas if no PDF image is ready or dimensions are missing
      if (canvas) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const context = canvas.getContext("2d");
    const pdfImage = pdfImageRef.current; // The pre-rendered PDF background ImageBitmap

    // Set main canvas dimensions based on the pre-rendered image's aspect ratio
    // The main canvas width is fixed at 800px as before
    const canvasWidth = 800;
    const canvasHeight = (pdfImage.height / pdfImage.width) * canvasWidth;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear and draw the pre-rendered PDF background
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(pdfImage, 0, 0, canvas.width, canvas.height);

    // Draw the text preview on top
    if (text.trim()) {
      // Scale based on the original PDF page dimensions to canvas width
      const currentCanvasScale = canvas.width / pdfPageDimensions.width;
      context.font = `${fontSize * currentCanvasScale}px Helvetica`; // Scale font size
      context.fillStyle = color;

      // Convert PDF Y coordinate (bottom-left origin) to Canvas Y coordinate (top-left origin)
      const canvasX = x * currentCanvasScale;
      const canvasY = canvas.height - y * currentCanvasScale;

      context.fillText(text, canvasX, canvasY);
    }
  }, [text, x, y, fontSize, color, pdfPageDimensions]); // Dependencies for live text drawing and preview

  // Effect to trigger rendering of PDF background to offscreen buffer
  useEffect(() => {
    renderPdfBackgroundToImage();
  }, [renderPdfBackgroundToImage]);

  // Effect to trigger drawing of the live preview (after background is ready or text/pos changes)
  useEffect(() => {
    drawLivePreview();
  }, [drawLivePreview]);

  // Effect to clean up the PDF document proxy and ImageBitmap
  useEffect(() => {
    return () => {
      if (pdfDocProxy) {
        pdfDocProxy.destroy();
      }
      if (pdfImageRef.current) {
        pdfImageRef.current.close();
        pdfImageRef.current = null;
      }
    };
  }, [pdfDocProxy]);

  // Load PDF and set number of pages
  const handleFiles = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    setNumPages(0);
    setPageIdx(0);
    if (pdfDocProxy) {
      // Destroy previous PDF if exists
      pdfDocProxy.destroy();
      setPdfDocProxy(null);
    }
    // `renderPdfBackgroundToImage` will handle clearing pdfImageRef and dimensions
    // when pdfDocProxy becomes null.

    if (newFiles.length === 0) return;

    try {
      const file = newFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPdfDocProxy(pdf);
      setNumPages(pdf.numPages);

      // The pdfPageDimensions will be set by renderPdfBackgroundToImage
      // after the first page is successfully loaded and rendered to ImageBitmap.
    } catch (e) {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      console.error("PDF loading error:", e);
      setFiles([]); // Clear files on error
    }
  };

  // --- Dragging Handlers ---
  const handleMouseDown = useCallback(
    (e) => {
      // Only allow dragging if a PDF is loaded and text is present
      if (
        !canvasRef.current ||
        !pdfImageRef.current ||
        !text.trim() ||
        pdfPageDimensions.width === 0
      ) {
        return;
      }

      e.preventDefault(); // Prevent default browser behavior (e.g., text selection)
      e.stopPropagation(); // Prevent event from bubbling up

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate current canvas scale relative to PDF units
      const currentCanvasScale = canvas.width / pdfPageDimensions.width;

      // Set dragging state and initial positions
      setIsDragging(true);
      setDragStartX(mouseX);
      setDragStartY(mouseY);
      setInitialTextX(x); // Store current text's PDF X
      setInitialTextY(y); // Store current text's PDF Y
    },
    [pdfPageDimensions, text, x, y]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !canvasRef.current || !pdfPageDimensions.width) {
        return;
      }

      e.preventDefault(); // Prevent default browser behavior
      e.stopPropagation(); // Prevent event from bubbling up

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const currentMouseX = e.clientX - rect.left;
      const currentMouseY = e.clientY - rect.top;

      // Calculate current canvas scale relative to PDF units
      const currentCanvasScale = canvas.width / pdfPageDimensions.width;

      // Calculate delta in canvas pixels
      const deltaCanvasX = currentMouseX - dragStartX;
      const deltaCanvasY = currentMouseY - dragStartY;

      // Convert canvas pixel delta to PDF unit delta
      const deltaPdfX = deltaCanvasX / currentCanvasScale;
      const deltaPdfY = -deltaCanvasY / currentCanvasScale; // Y is inverted in PDF vs Canvas

      // Calculate new PDF coordinates
      let newX = initialTextX + deltaPdfX;
      let newY = initialTextY + deltaPdfY;

      // Clamp values to stay within page bounds
      newX = Math.max(0, Math.min(newX, pdfPageDimensions.width));
      newY = Math.max(0, Math.min(newY, pdfPageDimensions.height));

      setX(Math.round(newX)); // Round to nearest integer for cleaner input values
      setY(Math.round(newY));
    },
    [
      isDragging,
      dragStartX,
      dragStartY,
      initialTextX,
      initialTextY,
      pdfPageDimensions,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []); // No dependencies as it just sets a boolean

  const handleFormFill = async () => {
    if (files.length === 0) {
      setError("Please upload a PDF file to fill forms.");
      return;
    }
    if (!text.trim()) {
      setError("Please enter text to add to the PDF.");
      return;
    }
    setIsProcessing(true);
    setError(""); // Clear previous errors

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      if (pageIdx >= pages.length || pageIdx < 0) {
        setError("Selected page is out of bounds.");
        return;
      }

      const page = pages[pageIdx];

      page.drawText(text, {
        x: Number(x),
        y: Number(y),
        size: Number(fontSize),
        font,
        color: hexToRgbNormalized(color), // Use the helper function
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `filled_form_${files[0].name || "document"}.pdf`; // Dynamic filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Revoke the object URL

      setError(""); // Clear error on success
    } catch (err) {
      setError(
        "An error occurred while filling the form. Please check your inputs."
      );
      console.error("Form fill error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <main className="flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
        <Card className="bg-gray-800 border-gray-700 w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              PDF Form Filler
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Add text anywhere on your PDF documents. Upload, specify text,
              position, and style for quick form filling.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
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

            {files.length > 0 && numPages > 0 && (
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleFormFill();
                }}
                aria-label="Form Filler Controls"
              >
                <div className="space-y-4">
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
                      aria-label="Text to add"
                      required
                      className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="pageSelect"
                      className="text-sm font-medium text-gray-200"
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
                        className="w-full mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      >
                        <SelectValue placeholder="Select a page" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 text-gray-100 border-gray-100">
                        {Array.from({ length: numPages }, (_, i) => (
                          <SelectItem key={i} value={String(i)}>
                            Page {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="xPosition"
                        className="text-sm font-medium text-gray-200"
                      >
                        X Position (PDF Units)
                      </Label>
                      <Input
                        id="xPosition"
                        type="number"
                        value={x}
                        onChange={(e) => setX(Number(e.target.value))}
                        aria-label="X position"
                        min={0}
                        className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="yPosition"
                        className="text-sm font-medium text-gray-200"
                      >
                        Y Position (PDF Units)
                      </Label>
                      <Input
                        id="yPosition"
                        type="number"
                        value={y}
                        onChange={(e) => setY(Number(e.target.value))}
                        aria-label="Y position"
                        min={0}
                        className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="fontSize"
                      className="text-sm font-medium text-gray-200"
                    >
                      Font Size
                    </Label>
                    <Input
                      id="fontSize"
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      aria-label="Font size"
                      min={6}
                      max={72}
                      className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="textColor"
                      className="text-sm font-medium text-gray-200"
                    >
                      Text Color
                    </Label>
                    <Input
                      id="textColor"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      aria-label="Text color"
                      className="w-16 h-8 p-0 border-none mt-1"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative">
                  {pdfImageRef.current ? ( // Check pdfImageRef.current instead of pdfDocProxy for rendering
                    <canvas
                      ref={canvasRef}
                      className={`w-full h-full object-contain ${
                        isDragging ? "cursor-grabbing" : "cursor-grab"
                      }`}
                      width="800"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp} // Important: stop dragging if mouse leaves
                    ></canvas>
                  ) : (
                    <div className="text-gray-400 text-center p-4">
                      Upload a PDF to see the preview and place text.
                    </div>
                  )}
                  {isDragging && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm rounded-full shadow-lg pointer-events-none z-10">
                      {" "}
                      {/* Subtle "DRAGGING" banner */}
                      DRAGGING
                    </div>
                  )}
                </div>
              </form>
            )}

            {error && (
              <Alert variant="destructive" className="mt-2">
                {error}
              </Alert>
            )}

            <Button
              variant="success"
              className="mt-6 w-full max-w-xs mx-auto block"
              onClick={handleFormFill}
              disabled={
                isProcessing ||
                !text.trim() ||
                files.length === 0 ||
                numPages === 0
              }
              aria-label="Fill PDF Form"
            >
              {isProcessing ? "Processing..." : "Fill Form & Download"}
            </Button>
          </CardContent>
        </Card>
        <ToolPageContent
          toolName="PDF Form Filler"
          toolDescription="Fill out your PDF forms online for free. Add text, checkmarks, and signatures to any PDF document."
          steps={[
            "Upload your PDF file by dragging it into the dropzone or clicking to select a file.",
            "Add text, checkmarks, and signatures to your PDF by clicking on the desired location.",
            "Customize the font, size, and color of your text.",
            "Download your filled PDF form.",
          ]}
          faqs={[
            {
              question: "Is it free to fill out PDF forms online?",
              answer:
                "Yes, our tool is completely free to use. You can fill out as many PDF forms as you like without any hidden costs.",
            },
            {
              question: "Is my data secure?",
              answer:
                "We prioritize your privacy and security. All files are processed on the client-side, meaning your files are never uploaded to our servers.",
            },
            {
              question: "Can I add a signature to my PDF form?",
              answer:
                "Yes, you can add a signature to your PDF form. You can draw your signature, type it, or upload an image of your signature.",
            },
          ]}
        />
      </main>
    </>
  );
}
