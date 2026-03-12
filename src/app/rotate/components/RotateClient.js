"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { loadPdfLib, loadPdfJs } from "@/lib/pdfjsWorker";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { toast } from "sonner";
import { safeCreateObjectURL } from "@/lib/enhancedUX";
import { RotateCw, RotateCcw, RefreshCw } from "lucide-react";

export default function RotateClient() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [rotations, setRotations] = useState({}); // Map of pageIndex -> rotation (0, 90, 180, 270)
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState("");

  // pdf.js document proxy
  const [pdfDocProxy, setPdfDocProxy] = useState(null);
  const renderTaskRefs = useRef({});
  const canvasRefs = useRef({});

  // Cleanup
  useEffect(() => {
    const currentRenderTasks = renderTaskRefs.current;
    return () => {
      if (pdfDocProxy) {
        try { pdfDocProxy.destroy(); } catch { }
      }
      Object.values(currentRenderTasks).forEach((task) => {
        if (task) task.cancel();
      });
      if (rotatedPdfUrl) {
        try { if (rotatedPdfUrl && typeof URL !== 'undefined' && !String(rotatedPdfUrl).startsWith('data:')) URL.revokeObjectURL(rotatedPdfUrl); } catch { }
      }
    };
  }, [pdfDocProxy, rotatedPdfUrl]);

  const renderPageThumbnail = useCallback(
    async (canvas, pageIndex) => {
      if (!canvas || !pdfDocProxy) return;

      const context = canvas.getContext("2d");
      if (renderTaskRefs.current[pageIndex]) {
        renderTaskRefs.current[pageIndex].cancel();
      }

      try {
        const page = await pdfDocProxy.getPage(pageIndex + 1);
        const currentRotation = rotations[pageIndex] || 0;

        // Get viewport with the *accumulated* rotation
        // The PDF page might have an inherent rotation, we add ours to it
        // But for simplicity in UI, we usually treat the initial view as 0 relative to the file
        // However, pdf.js handles the page's native rotation automatically.
        // We just want to add our UI rotation.
        // Note: page.rotate is the native rotation.

        const totalRotation = (page.rotate + currentRotation) % 360;
        const viewport = page.getViewport({ scale: 1, rotation: totalRotation });

        const desiredWidth = 150;
        const scale = desiredWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale: scale, rotation: totalRotation });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        renderTaskRefs.current[pageIndex] = page.render(renderContext);
        await renderTaskRefs.current[pageIndex].promise;
        renderTaskRefs.current[pageIndex] = null;
      } catch (e) {
        if (e.name !== "RenderingCancelledException") {
          toast.error(`Error rendering page ${pageIndex + 1}`);
        }
      }
    },
    [pdfDocProxy, rotations]
  );

  // Trigger renders when rotations change
  useEffect(() => {
    if (!pdfDocProxy) return;
    for (let i = 0; i < numPages; i++) {
      const canvas = canvasRefs.current[i];
      if (canvas) {
        renderPageThumbnail(canvas, i);
      }
    }
  }, [rotations, numPages, pdfDocProxy, renderPageThumbnail]);

  const handleFiles = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    setNumPages(0);
    setRotations({});
    setRotatedPdfUrl(null);

    if (pdfDocProxy) {
      try { pdfDocProxy.destroy(); } catch { }
      setPdfDocProxy(null);
    }

    if (newFiles.length === 0) return;

    try {
      const file = newFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await loadPdfJs();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setPdfDocProxy(pdf);
      setNumPages(pdf.numPages);

      // Initialize rotations to 0
      const initialRotations = {};
      for (let i = 0; i < pdf.numPages; i++) {
        initialRotations[i] = 0;
      }
      setRotations(initialRotations);
    } catch {
      setError("Failed to load PDF.");
    }
  };

  const rotatePage = (pageIndex, angle) => {
    setRotations((prev) => {
      const current = prev[pageIndex] || 0;
      const next = (current + angle + 360) % 360;
      return { ...prev, [pageIndex]: next };
    });
  };

  const rotateAll = (angle) => {
    setRotations((prev) => {
      const next = {};
      for (let i = 0; i < numPages; i++) {
        const current = prev[i] || 0;
        next[i] = (current + angle + 360) % 360;
      }
      return next;
    });
  };

  const handleRotate = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError("");

    try {
      const { PDFDocument, degrees } = await loadPdfLib();
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page, index) => {
        const rotationAngle = rotations[index] || 0;
        if (rotationAngle !== 0) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + rotationAngle) % 360));
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      let url = null;
      try { url = safeCreateObjectURL(blob); } catch { url = null; }
      setRotatedPdfUrl(url);

      const safeName = files[0].name.replace(/\.pdf$/i, "");
      setDownloadFileName(`${safeName}_rotated.pdf`);
    } catch {
      toast.error("Failed to rotate PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Rotate PDF"
      subtitle="Rotate specific pages or the entire PDF document by 90, 180, or 270 degrees."
      toolName="Rotate PDF"
      toolDescription="Easily rotate pages in your PDF documents. Whether you need to adjust the orientation of a single page, a specific range, or the entire document, our online tool allows you to rotate by 90, 180, or 270 degrees. All processing is done securely in your browser, ensuring your files remain private."
      steps={[
        "Upload your PDF file by dragging it into the dropzone or clicking to select.",
        "Use the buttons to rotate individual pages or all pages at once.",
        "Click 'Rotate PDF' to apply the changes.",
        "Download your newly rotated PDF file."
      ]}
      faqs={[
        {
          question: "Is it free to rotate PDF pages?",
          answer: "Yes, our Rotate PDF tool is completely free to use."
        },
        {
          question: "Are my files secure?",
          answer: "Absolutely. All processing happens in your browser."
        }
      ]}
      currentTool="rotate"
    >
      <div className="space-y-6">
        <FileDropzone
          accept="application/pdf"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload PDF"
          description="Drag & drop or click to select a PDF file"
          isLoading={isProcessing}
        />

        {numPages > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 justify-center p-4 bg-background dark:bg-background rounded-none">
              <Button onClick={() => rotateAll(-90)} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" /> Rotate All Left
              </Button>
              <Button onClick={() => rotateAll(90)} variant="outline">
                <RotateCw className="w-4 h-4 mr-2" /> Rotate All Right
              </Button>
              <Button onClick={() => rotateAll(180)} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" /> Flip All 180°
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto p-2 custom-scrollbar">
              {Array.from({ length: numPages }).map((_, index) => (
                <div key={index} className="flex flex-col items-center p-2 border border-border dark:border-border rounded-none bg-background dark:bg-background">
                  <span className="text-sm font-medium mb-2">Page {index + 1}</span>
                  <div className="relative mb-2 bg-background dark:bg-background flex items-center justify-center min-h-[150px] w-full">
                    <canvas
                      ref={(el) => (canvasRefs.current[index] = el)}
                      className="max-w-full h-auto shadow-sm"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => rotatePage(index, -90)} title="Rotate Left">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => rotatePage(index, 90)} title="Rotate Right">
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={handleRotate} disabled={isProcessing} size="lg" variant="success">
                {isProcessing ? "Processing..." : "Rotate PDF"}
              </Button>
            </div>
          </div>
        )}

        {rotatedPdfUrl && (
          <div className="mt-8 p-6 bg-muted border border-border rounded-none text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">Success!</h3>
            <Button asChild size="lg" variant="success">
              <a href={rotatedPdfUrl} download={downloadFileName}>
                Download Rotated PDF
              </a>
            </Button>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
