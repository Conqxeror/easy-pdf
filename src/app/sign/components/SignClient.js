"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { loadPdfJs, loadPdfLib } from "@/lib/pdfjsWorker";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from '@/lib/enhancedUX';

export default function SignClient() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [signedPdfUrl, setSignedPdfUrl] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState("");
  const [fileName, setFileName] = useState(""); // Add missing state variable
  const [processingMessage, setProcessingMessage] = useState(""); // Add missing state variable
  const [currentPageIdx, setCurrentPageIdx] = useState(0); // Current page index (0-based)
  const [numPages, setNumPages] = useState(0); // Total number of pages in the PDF

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
    height: 0
  }); // Current PDF preview page dimensions in PDF units

  // --- Helper Functions ---
  // Helper to convert hex color to RGB for pdf-lib
  const hexToRgb = (hex) => { // eslint-disable-line no-unused-vars
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
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
        viewport: scaledViewport
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
        try { previousPdfDocProxy.destroy(); } catch { /* ignore */ }
        console.log("Previous PDF document proxy destroyed.");
      }
      // renderTaskRef cleanup is already handled inside renderPdfPreview or when a new file is loaded.
      // Revoke object URL to prevent memory leaks
      if (signedPdfUrl) {
        try {
          if (typeof URL !== 'undefined' && !String(signedPdfUrl).startsWith('data:')) {
            try { if (signedPdfUrl && typeof URL !== 'undefined' && !String(signedPdfUrl).startsWith('data:')) URL.revokeObjectURL(signedPdfUrl); } catch { }
          }
        } catch { /* ignore */ }
      }
    };
  }, [pdfDocProxy, signedPdfUrl]); // Only triggers when pdfDocProxy or signedPdfUrl state changes

  // --- File Handling ---
  const handleFiles = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    setSignedPdfUrl(null); // Clear previous URL on new file selection
    setDownloadFileName(""); // Clear previous filename on new file selection

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
      try { activePdfDocProxyRef.current.destroy(); } catch { /* ignore */ }
      activePdfDocProxyRef.current = null;
    }
    setPdfDocProxy(null); // This will also trigger the useEffect cleanup for the old state value (if any)

    if (newFiles.length === 0) {
      setFileName("");
      return;
    }

    const selectedFile = newFiles[0];
    setFileName(selectedFile ? selectedFile.name : "");

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      // Dynamically load pdfjs and configure worker
      const pdfjs = await loadPdfJs();

      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      activePdfDocProxyRef.current = pdf; // Set the ref directly
      setPdfDocProxy(pdf); // Update state, which will trigger preview render due to the dedicated useEffect
      setNumPages(pdf.numPages);
    } catch {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      setFiles([]);
      setPdfDocProxy(null); // Ensure state is null on error
      activePdfDocProxyRef.current = null; // Ensure ref is null on error
      setFileName("");
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
    setProcessingMessage("Signing PDF document...");
    setError("");

    try {
      const { PDFDocument } = await loadPdfLib();
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
        height: signatureHeight
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      let url = null;
      try {
        url = safeCreateObjectURL(blob);
      } catch {
        url = null;
      }

      // Revoke previous signed PDF URL if present to avoid memory leaks
      try {
        safeRevokeObjectURL(signedPdfUrl);
      } catch { /* ignore */ }

      setSignedPdfUrl(url);
      const safeBase = files[0] && files[0].name ? sanitizeFileName(files[0].name) : 'document';
      setDownloadFileName(url ? `signed_${safeBase}.pdf` : `signed_document.pdf`);

      setProcessingMessage("PDF signed successfully!");
      setError("");
    } catch {
      setError("Failed to sign PDF. Please try again.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingMessage(""), 2000);
    }
  };

  const toolName = "Sign PDF";
  const toolDescription = "Add your digital signature to any PDF document with our intuitive drawing tool. Perfect for signing contracts, forms, or adding personal notes to documents. All processing happens securely in your browser, ensuring your files remain private. Create professional-looking signatures with customizable pen color and stroke width.";
  const steps = [
    "Upload your PDF file by dragging it into the dropzone or clicking to select it from your device.",
    "Use the signature canvas to draw your signature with customizable pen color and stroke width.",
    "Select the page where you want to place your signature and adjust its size if needed.",
    "Click and drag your signature on the PDF preview to position it exactly where you want it.",
    "Click the 'Sign PDF' button to apply your signature and download the signed document.",
  ];
  const faqs = [
    {
      question: "Is it free to sign PDF documents?",
      answer:
        "Yes, our PDF signing tool is completely free to use. You can sign as many PDF documents as you need without any hidden costs or limitations.",
    },
    {
      question: "Are my files secure when signing?",
      answer:
        "Absolutely. Your privacy is our top priority. All PDF processing, including signature placement, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential.",
    },
    {
      question: "Can I add multiple signatures to one document?",
      answer:
        "Currently, you can add one signature per session. To add multiple signatures, you would need to repeat the process with the previously signed PDF.",
    },
    {
      question: "What signature formats are supported?",
      answer:
        "You can draw freehand signatures using your mouse, trackpad, or touch screen. The tool supports customizable pen colors and stroke widths for personalized signatures.",
    },
    {
      question: "Can I sign on any page of the PDF?",
      answer:
        "Yes, you can select any page of your PDF document to place your signature. Use the page selector to choose the specific page where you want to add your signature.",
    },
  ];

  return (
    <ToolPageLayout
      title="Sign PDF"
      subtitle="Add your digital signature to any PDF document. Draw your signature and place it directly on any page."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="sign"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Sign PDF', href: '/sign' }
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

        {files.length > 0 && numPages > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Info */}
            <div className="p-4 bg-background shadow-inner border border-border">
              <h2 className="font-semibold text-xl mb-3 text-foreground">
                File Information
              </h2>
              <p className="text-foreground">
                <span className="font-medium">File:</span> {fileName}
              </p>
              <p className="text-foreground">
                <span className="font-medium">Pages:</span> {numPages}
              </p>
              {processingMessage && (
                <p className="text-foreground mt-2">{processingMessage}</p>
              )}
            </div>
            {/* Signature Drawing Controls */}
            <div className="p-4 bg-background shadow-inner border border-border space-y-4">
              <h2 className="font-semibold text-xl mb-3 text-foreground">
                1. Draw Your Signature
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="penColor"
                    className="text-sm font-medium text-foreground"
                  >
                    Pen Color
                  </Label>
                  <Input
                    id="penColor"
                    type="color"
                    value={penColor}
                    onChange={(e) => setPenColor(e.target.value)}
                    className="w-16 h-8 p-0 border-none mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="strokeWidth"
                    className="text-sm font-medium text-foreground"
                  >
                    Stroke Width
                  </Label>
                  <Input
                    id="strokeWidth"
                    type="range"
                    min="1"
                    max="10"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
              <canvas
                ref={signatureCanvasRef}
                width={400}
                height={200}
                className="w-full h-auto border border-border bg-background cursor-crosshair"
                onMouseDown={handleSignatureMouseDown}
                onMouseMove={handleSignatureMouseMove}
                onMouseUp={handleSignatureMouseUp}
              ></canvas>
              <Button
                onClick={handleClearSignature}
                variant="outline"
                className="w-full"
              >
                Clear Signature
              </Button>
            </div>

            {/* PDF Preview & Placement */}
            <div className="p-4 bg-background shadow-inner border border-border space-y-4">
              <h2 className="font-semibold text-xl mb-3 text-foreground">
                2. Position Signature
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="pageSelect"
                    className="text-sm font-medium text-foreground"
                  >
                    Page
                  </Label>
                  <Select
                    value={String(currentPageIdx)}
                    onValueChange={(value) => setCurrentPageIdx(Number(value))}
                  >
                    <SelectTrigger
                      id="pageSelect"
                      className="w-full mt-1 bg-background text-foreground border-border"
                    >
                      <SelectValue placeholder="Select page" />
                    </SelectTrigger>
                    <SelectContent className="bg-background text-foreground border-border">
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
                    htmlFor="signatureSize"
                    className="text-sm font-medium text-foreground"
                  >
                    Size
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="number"
                      value={signatureWidth}
                      onChange={(e) => setSignatureWidth(Number(e.target.value))}
                      placeholder="Width"
                      className="bg-background text-foreground border-border"
                    />
                    <Input
                      type="number"
                      value={signatureHeight}
                      onChange={(e) => setSignatureHeight(Number(e.target.value))}
                      placeholder="Height"
                      className="bg-background text-foreground border-border"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-center items-center overflow-hidden">
                <canvas
                  ref={pdfPreviewCanvasRef}
                  className={`max-w-full h-auto border border-border ${signatureDataUrl ? "cursor-move" : "cursor-default"
                    }`}
                  onMouseDown={handlePreviewMouseDown}
                  onMouseMove={handlePreviewMouseMove}
                  onMouseUp={handlePreviewMouseUp}
                  onMouseLeave={handlePreviewMouseUp}
                ></canvas>
              </div>
              <p className="text-xs text-foreground text-center">
                {signatureDataUrl
                  ? "Click and drag your signature on the preview to position it"
                  : "Draw a signature first to see it on the preview"}
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
            variant="destructive"
            size="lg"
            className="px-8 py-3"
            onClick={handleSign}
            loading={isProcessing}
            disabled={
              files.length === 0 ||
              !signatureDataUrl ||
              numPages === 0
            }
            aria-label="Sign PDF"
          >
            {isProcessing ? "Processing..." : "Sign PDF"}
          </Button>
        </div>

        {signedPdfUrl && !isProcessing && (
          <div className="flex flex-col gap-6 p-6 bg-background shadow-lg border border-border">
            <div className="w-full text-center space-y-4 text-foreground">
              <h3 className="text-2xl font-semibold flex items-center justify-center text-green-400">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                PDF Signed Successfully
              </h3>
              <p className="text-foreground">
                Your signature has been applied to the PDF document.
              </p>
            </div>

            <div className="flex justify-center">
              <Button asChild variant="success" size="lg" className="px-8 py-3">
                <a
                  href={signedPdfUrl}
                  download={downloadFileName}
                  className="text-center"
                  onClick={() => {
                    const urlToRevoke = signedPdfUrl;
                    setTimeout(() => {
                      try {
                        if (urlToRevoke && typeof URL !== 'undefined' && !String(urlToRevoke).startsWith('data:')) {
                          try { if (urlToRevoke && typeof URL !== 'undefined' && !String(urlToRevoke).startsWith('data:')) URL.revokeObjectURL(urlToRevoke); } catch { }
                        }
                      } catch { /* ignore */ }
                    }, 500);
                  }}
                >
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download Signed PDF
                  </span>
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
