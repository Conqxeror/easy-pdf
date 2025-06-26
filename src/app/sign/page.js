"use client";

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
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function SignPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [numPages, setNumPages] = useState(0); // Total pages in uploaded PDF
  const [currentPageIdx, setCurrentPageIdx] = useState(0); // 0-based index of PDF page being previewed

  // Signature Drawing States & Refs
  const signatureCanvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#000000"); // Default black pen
  const [strokeWidth, setStrokeWidth] = useState(2); // Default stroke width
  const [signatureDataUrl, setSignatureDataUrl] = useState(null); // Base64 Data URL of the drawn signature

  // PDF Preview & Placement States & Refs
  const pdfPreviewCanvasRef = useRef(null);
  const [pdfDocProxy, setPdfDocProxy] = useState(null); // pdf.js document proxy for preview (triggers renders)
  const renderTaskRef = useRef(null); // To manage pdf.js render tasks

  // Ref to hold the *current* active PDF document proxy to ensure it's not destroyed prematurely
  const activePdfDocProxyRef = useRef(null);

  // Signature Placement States (on PDF)
  const [signatureX, setSignatureX] = useState(50); // X position on PDF (PDF units)
  const [signatureY, setSignatureY] = useState(50); // Y position on PDF (PDF units)
  const [signatureWidth, setSignatureWidth] = useState(200); // Width on PDF (PDF units)
  const [signatureHeight, setSignatureHeight] = useState(100); // Height on PDF (PDF units)

  // Dragging states for signature on PDF preview
  const [isDraggingSignature, setIsDraggingSignature] = useState(false);
  const [dragStartMouseX, setDragStartMouseX] = useState(0); // Mouse X when drag starts (canvas pixels)
  const [dragStartMouseY, setDragStartMouseY] = useState(0); // Mouse Y when drag starts (canvas pixels)
  const [initialSignatureX, setInitialSignatureX] = useState(0); // Signature X when drag starts (PDF units)
  const [initialSignatureY, setInitialSignatureY] = useState(0); // Signature Y when drag starts (PDF units)
  const [pdfPageDimensions, setPdfPageDimensions] = useState({
    width: 0,
    height: 0,
  }); // Current PDF preview page dimensions in PDF units

  // --- Helper Functions ---
  // Helper to convert hex color to RGB for pdf-lib
  const hexToRgb = (hex) => {
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    return rgb(r, g, b);
  };

  // --- Signature Drawing Canvas Handlers ---
  const initSignatureCanvas = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = penColor;
      ctx.lineWidth = strokeWidth;
    }
  }, [penColor, strokeWidth]);

  useEffect(() => {
    initSignatureCanvas();
  }, [initSignatureCanvas]);

  const handleSignatureMouseDown = (e) => {
    setDrawing(true);
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleSignatureMouseMove = (e) => {
    if (!drawing) return;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const handleSignatureMouseUp = () => {
    setDrawing(false);
    // Capture signature as Data URL after drawing is finished
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL("image/png"));
    }
  };

  const handleClearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureDataUrl(null); // Clear stored signature data
    }
  };

  // --- PDF Preview Canvas Handlers ---
  const renderPdfPreview = useCallback(async () => {
    const canvas = pdfPreviewCanvasRef.current;
    // Use activePdfDocProxyRef.current as the source of truth for the PDF document
    const currentPdfProxy = activePdfDocProxyRef.current;

    if (!canvas || !currentPdfProxy || numPages === 0) {
      if (canvas) {
        // Clear canvas if no PDF or invalid proxy
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.height = 0; // Collapse canvas height
      }
      return;
    }

    // Cancel any ongoing render task to prevent conflicts
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    const context = canvas.getContext("2d");
    try {
      const page = await currentPdfProxy.getPage(currentPageIdx + 1); // pdf.js pages are 1-based
      const viewport = page.getViewport({ scale: 1 }); // Original PDF dimensions

      // Store page dimensions in PDF units for signature placement calculations
      setPdfPageDimensions({ width: viewport.width, height: viewport.height });

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

      // Draw signature on preview if it exists
      if (signatureDataUrl) {
        // Always draw if data exists, regardless of dragging
        const signatureImg = new Image();
        signatureImg.onload = () => {
          // Calculate signature position and size on canvas
          const canvasX = signatureX * scale;
          // PDF Y is from bottom, Canvas Y is from top. Adjust:
          const canvasY =
            canvas.height - (signatureY + signatureHeight) * scale;
          const canvasWidth = signatureWidth * scale;
          const canvasHeight = signatureHeight * scale;

          context.drawImage(
            signatureImg,
            canvasX,
            canvasY,
            canvasWidth,
            canvasHeight
          );
        };
        signatureImg.src = signatureDataUrl;
      }
    } catch (e) {
      if (e.name === "RenderingCancelledException") {
        console.log("PDF rendering cancelled during preview:", e);
      } else {
        console.error("Error rendering PDF preview:", e);
        setError("Failed to render PDF preview.");
      }
    }
  }, [
    currentPageIdx,
    numPages,
    signatureDataUrl,
    signatureX,
    signatureY,
    signatureWidth,
    signatureHeight,
  ]); // Removed isDraggingSignature from dependencies as it's no longer used in this logic

  // Effect to trigger PDF preview render based on changes that affect the preview
  useEffect(() => {
    // Only call if activePdfDocProxyRef.current is set, or if we are clearing due to numPages becoming 0
    if (activePdfDocProxyRef.current || numPages === 0) {
      renderPdfPreview();
    }
  }, [renderPdfPreview, numPages]); // `numPages` is important for clearing the canvas

  // Cleanup for pdfDocProxy: use a dedicated effect that cleans up the *previous* ref value.
  useEffect(() => {
    const previousPdfDocProxy = pdfDocProxy; // Capture the value from the previous render
    return () => {
      if (previousPdfDocProxy) {
        previousPdfDocProxy.destroy();
        console.log("Previous PDF document proxy destroyed.");
      }
      // renderTaskRef cleanup is already handled inside renderPdfPreview or when a new file is loaded.
    };
  }, [pdfDocProxy]); // Only triggers when pdfDocProxy state changes

  // --- File Handling ---
  const handleFiles = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    setNumPages(0);
    setCurrentPageIdx(0); // Reset to first page

    // Clear previous states
    setSignatureDataUrl(null);
    handleClearSignature(); // Clear drawing canvas
    setSignatureX(50);
    setSignatureY(50);
    setSignatureWidth(200);
    setSignatureHeight(100);
    setPdfPageDimensions({ width: 0, height: 0 });

    // Explicitly set pdfDocProxy to null first to ensure old one is cleared via useEffect cleanup
    // Also clear the activePdfDocProxyRef immediately
    if (activePdfDocProxyRef.current) {
      activePdfDocProxyRef.current.destroy(); // Destroy the old instance immediately
      activePdfDocProxyRef.current = null;
    }
    setPdfDocProxy(null); // This will also trigger the useEffect cleanup for the old state value (if any)

    if (newFiles.length === 0) {
      return;
    }

    try {
      const file = newFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      activePdfDocProxyRef.current = pdf; // Set the ref directly
      setPdfDocProxy(pdf); // Update state, which will trigger preview render due to the dedicated useEffect
      setNumPages(pdf.numPages);
    } catch (e) {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      console.error("PDF loading error:", e);
      setFiles([]);
      setPdfDocProxy(null); // Ensure state is null on error
      activePdfDocProxyRef.current = null; // Ensure ref is null on error
    }
  };

  // --- Signature Drag & Drop on PDF Preview ---
  const handlePreviewMouseDown = useCallback(
    (e) => {
      if (
        !signatureDataUrl ||
        !pdfPreviewCanvasRef.current ||
        pdfPageDimensions.width === 0
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const canvas = pdfPreviewCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const currentCanvasScale = canvas.width / pdfPageDimensions.width;

      // Calculate signature's current canvas position
      const sigCanvasX = signatureX * currentCanvasScale;
      const sigCanvasY =
        canvas.height - (signatureY + signatureHeight) * currentCanvasScale;
      const sigCanvasWidth = signatureWidth * currentCanvasScale;
      const sigCanvasHeight = signatureHeight * currentCanvasScale;

      // Check if mouse click is within the signature bounds
      if (
        mouseX >= sigCanvasX &&
        mouseX <= sigCanvasX + sigCanvasWidth &&
        mouseY >= sigCanvasY &&
        mouseY <= sigCanvasY + sigCanvasHeight
      ) {
        setIsDraggingSignature(true);
        setDragStartMouseX(mouseX);
        setDragStartMouseY(mouseY);
        setInitialSignatureX(signatureX);
        setInitialSignatureY(signatureY);
      }
    },
    [
      signatureDataUrl,
      signatureX,
      signatureY,
      signatureWidth,
      signatureHeight,
      pdfPageDimensions,
    ]
  );

  const handlePreviewMouseMove = useCallback(
    (e) => {
      if (
        !isDraggingSignature ||
        !pdfPreviewCanvasRef.current ||
        pdfPageDimensions.width === 0
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const canvas = pdfPreviewCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const currentMouseX = e.clientX - rect.left;
      const currentMouseY = e.clientY - rect.top;

      const currentCanvasScale = canvas.width / pdfPageDimensions.width;

      const deltaCanvasX = currentMouseX - dragStartMouseX;
      const deltaCanvasY = currentMouseY - dragStartMouseY;

      // Convert canvas pixel delta to PDF unit delta, adjusting for inverted Y
      const deltaPdfX = deltaCanvasX / currentCanvasScale;
      const deltaPdfY = -deltaCanvasY / currentCanvasScale;

      let newX = initialSignatureX + deltaPdfX;
      let newY = initialSignatureY + deltaPdfY;

      // Clamp signature to stay within page bounds
      newX = Math.max(
        0,
        Math.min(newX, pdfPageDimensions.width - signatureWidth)
      );
      newY = Math.max(
        0,
        Math.min(newY, pdfPageDimensions.height - signatureHeight)
      );

      setSignatureX(Math.round(newX));
      setSignatureY(Math.round(newY));

      // Re-render preview immediately to show drag feedback
      renderPdfPreview();
    },
    [
      isDraggingSignature,
      dragStartMouseX,
      dragStartMouseY,
      initialSignatureX,
      initialSignatureY,
      signatureWidth,
      signatureHeight,
      pdfPageDimensions,
      renderPdfPreview,
    ]
  );

  const handlePreviewMouseUp = useCallback(() => {
    setIsDraggingSignature(false);
  }, []);

  // --- Main Sign & Download Logic ---
  const handleSign = async () => {
    if (files.length === 0) {
      setError("Please upload a PDF file.");
      return;
    }
    if (!signatureDataUrl) {
      setError("Please draw a signature first.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      if (currentPageIdx < 0 || currentPageIdx >= pages.length) {
        setError("Selected page for signature is out of bounds.");
        setIsProcessing(false);
        return;
      }

      const page = pages[currentPageIdx];
      const pngImage = await pdfDoc.embedPng(signatureDataUrl);

      // Draw the signature on the selected page with current coordinates and dimensions
      page.drawImage(pngImage, {
        x: signatureX,
        y: signatureY,
        width: signatureWidth,
        height: signatureHeight,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `signed_${files[0].name || "document"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setError("");
    } catch (e) {
      setError("Failed to sign PDF. Please try again.");
      console.error("Sign PDF error:", e);
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
              Sign / Annotate PDF
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Draw your signature or annotation and place it directly onto any
              page of your PDF document.
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* Signature Drawing Controls */}
                <div className="p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700 space-y-4">
                  <h2 className="font-semibold text-xl mb-3 text-gray-100">
                    1. Draw Your Signature
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="penColor"
                        className="text-sm font-medium text-gray-200"
                      >
                        Pen Color
                      </Label>
                      <Input
                        id="penColor"
                        type="color"
                        value={penColor}
                        onChange={(e) => setPenColor(e.target.value)}
                        className="w-full h-8 p-0 border-none mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="strokeWidth"
                        className="text-sm font-medium text-gray-200"
                      >
                        Stroke Width
                      </Label>
                      <Input
                        id="strokeWidth"
                        type="number"
                        value={strokeWidth}
                        onChange={(e) =>
                          setStrokeWidth(Math.max(1, Number(e.target.value)))
                        }
                        min={1}
                        max={10}
                        className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <canvas
                    ref={signatureCanvasRef}
                    width={400}
                    height={150}
                    className="border border-gray-600 mt-2 bg-white rounded-md shadow-md w-full max-w-sm mx-auto cursor-crosshair"
                    onMouseDown={handleSignatureMouseDown}
                    onMouseMove={handleSignatureMouseMove}
                    onMouseUp={handleSignatureMouseUp}
                    onMouseLeave={handleSignatureMouseUp}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleSignatureMouseDown(e.touches[0]);
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      handleSignatureMouseMove(e.touches[0]);
                    }}
                    onTouchEnd={handleSignatureMouseUp}
                    aria-label="Signature drawing canvas"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleClearSignature}
                    className="w-full max-w-xs mx-auto block"
                    aria-label="Clear signature"
                  >
                    Clear Signature
                  </Button>
                </div>

                {/* PDF Preview & Signature Placement Controls */}
                <div className="p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700 space-y-4">
                  <h2 className="font-semibold text-xl mb-3 text-gray-100">
                    2. Place Signature on PDF
                  </h2>
                  <div>
                    <Label
                      htmlFor="pageSelect"
                      className="text-sm font-medium text-gray-200"
                    >
                      Select Page to Sign
                    </Label>
                    <Select
                      value={String(currentPageIdx)}
                      onValueChange={(value) =>
                        setCurrentPageIdx(Number(value))
                      }
                      disabled={numPages === 0}
                    >
                      <SelectTrigger
                        id="pageSelect"
                        className="w-full mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      >
                        <SelectValue placeholder="Select a page" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 text-gray-100 border-gray-600">
                        {Array.from({ length: numPages }, (_, i) => (
                          <SelectItem key={i} value={String(i)}>
                            Page {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {signatureDataUrl && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="signatureX"
                          className="text-sm font-medium text-gray-200"
                        >
                          Signature X
                        </Label>
                        <Input
                          id="signatureX"
                          type="number"
                          value={signatureX}
                          onChange={(e) =>
                            setSignatureX(Number(e.target.value))
                          }
                          min={0}
                          className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="signatureY"
                          className="text-sm font-medium text-gray-200"
                        >
                          Signature Y
                        </Label>
                        <Input
                          id="signatureY"
                          type="number"
                          value={signatureY}
                          onChange={(e) =>
                            setSignatureY(Number(e.target.value))
                          }
                          min={0}
                          className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="signatureWidth"
                          className="text-sm font-medium text-gray-200"
                        >
                          Signature Width
                        </Label>
                        <Input
                          id="signatureWidth"
                          type="number"
                          value={signatureWidth}
                          onChange={(e) =>
                            setSignatureWidth(
                              Math.max(10, Number(e.target.value))
                            )
                          }
                          min={10}
                          max={800} // Example max
                          className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="signatureHeight"
                          className="text-sm font-medium text-gray-200"
                        >
                          Signature Height
                        </Label>
                        <Input
                          id="signatureHeight"
                          type="number"
                          value={signatureHeight}
                          onChange={(e) =>
                            setSignatureHeight(
                              Math.max(10, Number(e.target.value))
                            )
                          }
                          min={10}
                          max={600} // Example max
                          className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="w-full flex justify-center items-center bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative">
                    {numPages > 0 ? (
                      <canvas
                        ref={pdfPreviewCanvasRef}
                        className={`max-w-full h-auto border border-gray-600 rounded-md shadow-lg
                                   ${
                                     signatureDataUrl
                                       ? isDraggingSignature
                                         ? "cursor-grabbing"
                                         : "cursor-grab"
                                       : ""
                                   }`}
                        style={{ maxWidth: "100%", height: "auto" }}
                        onMouseDown={handlePreviewMouseDown}
                        onMouseMove={handlePreviewMouseMove}
                        onMouseUp={handlePreviewMouseUp}
                        onMouseLeave={handlePreviewMouseUp} // Stop dragging if mouse leaves
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handlePreviewMouseDown(e.touches[0]);
                        }}
                        onTouchMove={(e) => {
                          e.preventDefault();
                          handlePreviewMouseMove(e.touches[0]);
                        }}
                        onTouchEnd={handlePreviewMouseUp}
                        aria-label="PDF preview with signature placement"
                      ></canvas>
                    ) : (
                      <div className="text-gray-400 text-center p-4">
                        Upload a PDF to see the preview.
                      </div>
                    )}
                    {isDraggingSignature && (
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm rounded-full shadow-lg pointer-events-none z-10">
                        DRAGGING SIGNATURE
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                {error}
              </Alert>
            )}

            <Button
              variant="success"
              className="mt-6 w-full max-w-xs mx-auto block"
              onClick={handleSign}
              disabled={
                isProcessing ||
                files.length === 0 ||
                !signatureDataUrl ||
                numPages === 0
              }
              aria-label="Download signed PDF"
            >
              {isProcessing ? "Processing..." : "Download Signed PDF"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
