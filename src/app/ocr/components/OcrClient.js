"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
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
import ToolActions from "@/components/ui/ToolActions";

// ✅ OPTIMIZATION: Lazy load heavy dependencies
const loadOCRDependencies = async () => {
  const [{ loadPdfJs }, { createTesseractWorker, terminateWorker }] = await Promise.all([
    import('@/lib/pdfjsWorker'),
    import('@/lib/tesseractWorker')
  ]);
  return { loadPdfJs, createTesseractWorker, terminateWorker };
};

export default function OcrClient() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [result, setResult] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  
  // Cleanup preview image object URLs
  useEffect(() => {
    return () => {
      try {
        if (
          previewImageUrl &&
          typeof URL !== 'undefined' &&
          !String(previewImageUrl).startsWith('data:')
        ) {
          URL.revokeObjectURL(previewImageUrl);
        }
      } catch { /* ignore */ }
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

  // Optimization state
  const [dependencies, setDependencies] = useState(null);
  const [isLoadingDeps, setIsLoadingDeps] = useState(false);

  // Function to render the uploaded file to canvas
  const renderFileToCanvas = useCallback(async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !files.length) return;

    // Cancel any ongoing render task
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    const file = files[0];
    const desiredWidth = 800;

    try {
      if (file.type === "application/pdf") {
        if (!pdfDocProxy) return;

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

      } else if (file.type.startsWith("image/")) {
        const img = new Image();
        let tmpUrl = null;
        img.onload = () => {
          try {
            const aspectRatio = img.width / img.height;
            canvas.width = desiredWidth;
            canvas.height = desiredWidth / aspectRatio;
            context.drawImage(img, 0, 0, canvas.width, canvas.height);

            try {
              tmpUrl = URL.createObjectURL(file);
            } catch {
              tmpUrl = null;
            }

            setPreviewImageUrl((prev) => {
              if (prev && !String(prev).startsWith('data:')) {
                try { URL.revokeObjectURL(prev); } catch { /* ignore */ }
              }
              return tmpUrl || canvas.toDataURL('image/png');
            });
          } catch (err) {
            console.error('Error during image onload processing:', err);
            setError('Failed to load image for preview.');
          }
        };
        img.onerror = () => {
          setError("Failed to load image for preview.");
          if (tmpUrl) try { URL.revokeObjectURL(tmpUrl); } catch { /* ignore */ }
        };
        
        try {
          tmpUrl = URL.createObjectURL(file);
          img.src = tmpUrl;
        } catch {
          setError('Failed to load image for preview.');
        }
      }
    } catch (e) {
      if (e.name !== "RenderingCancelledException") {
        console.error("Error rendering file to canvas:", e);
        setError("Failed to prepare file for preview.");
      }
    }
  }, [files, pdfDocProxy]);

  useEffect(() => {
    if (files.length > 0) {
      renderFileToCanvas();
    } else {
      // Cleanup
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
    setFiles(newFiles);
    setError("");
    setResult("");
    setPreviewImageUrl(null);
    setNumPages(0);

    if (pdfDocProxy) {
      pdfDocProxy.destroy();
      setPdfDocProxy(null);
    }

    if (newFiles.length === 0) return;

    const file = newFiles[0];

    if (file.type === "application/pdf") {
      try {
        // Lazy load PDF.js if needed
        let deps = dependencies;
        if (!deps) {
          setIsLoadingDeps(true);
          deps = await loadOCRDependencies();
          setDependencies(deps);
          setIsLoadingDeps(false);
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdfjs = await deps.loadPdfJs();

        const loadingTask = pdfjs.getDocument({
          data: arrayBuffer,
        });

        const pdf = await loadingTask.promise;
        setPdfDocProxy(pdf);
        setNumPages(pdf.numPages);
        setPageRangeEnd(pdf.numPages);

      } catch (e) {
        console.error("PDF loading error:", e);
        setError("Failed to load PDF. Please ensure it's a valid PDF file.");
        setFiles([]);
        setIsLoadingDeps(false);
      }
    } else if (file.type.startsWith("image/")) {
      setNumPages(1);
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

    setIsProcessing(true);
    setProcessingMessage("Initializing OCR engine...");
    setError("");
    setResult("");

    let worker = null;
    let deps = dependencies;

    try {
      // Lazy load dependencies if not already loaded
      if (!deps) {
        deps = await loadOCRDependencies();
        setDependencies(deps);
      }

      const file = files[0];
      const allExtractedText = [];
      let pagesToOcr = [];

      console.log("Creating Tesseract worker...");
      worker = await deps.createTesseractWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProcessingMessage(`Recognizing text... ${Math.round(m.progress * 100)}%`);
          } else if (m.status === "loading tesseract core") {
            setProcessingMessage("Loading OCR core...");
          }
        },
      });

      // Determine pages
      if (file.type === "application/pdf") {
        if (!pdfDocProxy) {
          throw new Error("PDF document not loaded.");
        }

        if (ocrMode === "all") {
          pagesToOcr = Array.from({ length: numPages }, (_, i) => i + 1);
        } else if (ocrMode === "single") {
          pagesToOcr = [selectedOcrPage + 1];
        } else if (ocrMode === "range") {
          pagesToOcr = Array.from(
            { length: pageRangeEnd - pageRangeStart + 1 },
            (_, i) => pageRangeStart + i
          );
        }
      } else {
        pagesToOcr = [1];
      }

      for (const pageNum of pagesToOcr) {
        setProcessingMessage(`Processing page ${pageNum}...`);
        let imageUrlToOcr = previewImageUrl;

        if (file.type === "application/pdf") {
          const offscreenCanvas = document.createElement("canvas");
          const offscreenContext = offscreenCanvas.getContext("2d");

          const page = await pdfDocProxy.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1 });
          // Use higher resolution for OCR
          const desiredOcrWidth = 1500; 
          const scale = desiredOcrWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale: scale });

          offscreenCanvas.width = scaledViewport.width;
          offscreenCanvas.height = scaledViewport.height;

          await page.render({
            canvasContext: offscreenContext,
            viewport: scaledViewport,
          }).promise;
          
          imageUrlToOcr = offscreenCanvas.toDataURL("image/png", 0.8);
        }

        if (imageUrlToOcr) {
          setProcessingMessage(`Recognizing text on page ${pageNum}...`);
          const { data } = await worker.recognize(imageUrlToOcr);
          allExtractedText.push(`--- Page ${pageNum} ---
${data.text.trim()}`);
        }
      }

      setResult(allExtractedText.join('\n\n'));
      setProcessingMessage("Text extraction complete!");

    } catch (e) {
      console.error("OCR error:", e);
      setError(`Failed to extract text: ${e.message}`);
    } finally {
      if (worker && deps) {
        await deps.terminateWorker(worker);
      }
      setIsProcessing(false);
      setTimeout(() => setProcessingMessage(""), 2000);
    }
  };

  const handleCopyText = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
        setError("Text copied to clipboard!");
        setTimeout(() => setError(""), 3000);
      } catch {
        setError("Failed to copy text.");
      }
    }
  };

  const toolName = "OCR (Text Recognition)";
  const toolDescription = "Extract readable text from scanned PDF documents and image files using advanced OCR technology. All processing happens locally in your browser for complete privacy.";
  
  // Reuse static data props
  const steps = [
    "Upload your PDF document or image file.",
    "Choose your OCR scope: all pages, single page, or range.",
    "Click 'Extract Text' to start recognition.",
    "Copy or save the extracted text."
  ];
  
  const faqs = [
    {
      question: "What is OCR?",
      answer: "OCR (Optical Character Recognition) converts scanned documents and images into editable text."
    },
    {
      question: "Is it secure?",
      answer: "Yes, all processing happens in your browser. Your files are never uploaded."
    }
  ];

  return (
    <ToolPageLayout
      title={toolName}
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
        {(isProcessing || isLoadingDeps) && (
          <div className="p-4 bg-background border border-border">
            <div className="flex items-center space-x-3">
              <div className="animate-spin h-5 w-5 border-b-2 border-border"></div>
              <span className="text-foreground">
                {processingMessage || "Loading OCR engine..."}
              </span>
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
          description="Drag & drop or click to select (Max 50MB)"
          maxSize={50 * 1024 * 1024}
        />

        {files.length > 0 && (
          <>
            <div className="p-4 bg-background border border-border flex flex-col items-center">
              <h2 className="font-semibold text-xl mb-3">File Preview</h2>
              <canvas
                ref={previewCanvasRef}
                className="max-w-full h-auto border border-border shadow-lg"
              />
            </div>

            {numPages > 0 && (
              <div className="p-4 bg-background border border-border space-y-4">
                <h2 className="font-semibold text-xl mb-3">OCR Options</h2>
                <div>
                  <Label>Select OCR Scope</Label>
                  <Select value={ocrMode} onValueChange={setOcrMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pages ({numPages})</SelectItem>
                      {numPages > 1 && <SelectItem value="single">Single Page</SelectItem>}
                      {numPages > 1 && <SelectItem value="range">Page Range</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>

                {ocrMode === "single" && (
                  <div>
                    <Label>Select Page</Label>
                    <Input 
                      type="number" min="1" max={numPages} 
                      value={selectedOcrPage + 1}
                      onChange={(e) => setSelectedOcrPage(Math.max(0, parseInt(e.target.value) - 1))}
                    />
                  </div>
                )}

                {ocrMode === "range" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Page</Label>
                      <Input 
                        type="number" min="1" max={numPages} 
                        value={pageRangeStart}
                        onChange={(e) => setPageRangeStart(parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>End Page</Label>
                      <Input 
                        type="number" min="1" max={numPages} 
                        value={pageRangeEnd}
                        onChange={(e) => setPageRangeEnd(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <ToolActions
              primary={{
                label: isProcessing || isLoadingDeps ? "Processing..." : "Extract Text",
                onClick: handleOcr,
                disabled: isProcessing || isLoadingDeps,
              }}
              secondary={result ? { label: "Copy Text", onClick: handleCopyText } : null}
              isProcessing={isProcessing || isLoadingDeps}
            />
          </>
        )}

        {result && (
          <div className="p-4 bg-background border border-border">
            <h2 className="font-semibold text-xl mb-3">Extracted Text</h2>
            <Textarea
              value={result}
              readOnly
              className="w-full h-64 font-mono text-sm resize-none"
            />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">{error}</Alert>
        )}
      </div>
    </ToolPageLayout>
  );
}