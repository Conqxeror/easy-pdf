"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { FileText, Download, Move, Trash2 } from "lucide-react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LiveRegion } from "@/components/ui/AccessibilityEnhancements";
// ToolPageLayout is provided by the parent page; this client component only renders the tool UI

// Dynamically import heavy PDF libraries only when needed
import { usePDFLib, usePDFJS } from "@/lib/pdfUtils";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from '@/lib/enhancedUX';
import { toast } from 'sonner';

export default function MergeClient() {
  const [files, setFiles] = useState([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [mergedDownloadName, setMergedDownloadName] = useState("merged.pdf");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(""); // For screen reader announcements
  const [dragItemIndex, setDragItemIndex] = useState(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);
  const mergedPdfPreviewCanvasRef = useRef(null);
  const [mergedPdfDocProxy, setMergedPdfDocProxy] = useState(null);
  const renderTaskRef = useRef(null);

  // Load PDF libraries dynamically
  const { PDFLib, loading: pdfLibLoading, error: pdfLibError } = usePDFLib();
  const { pdfjs, loading: pdfjsLoading, error: pdfjsError } = usePDFJS();
  // const PDFLib = null; const pdfLibLoading = false; const pdfLibError = null;
  // const pdfjs = null; const pdfjsLoading = false; const pdfjsError = null;

  useEffect(() => {
    return () => {
      try {
        if (mergedPdfUrl && typeof URL !== "undefined" && !String(mergedPdfUrl).startsWith("data:")) {
          try { if (mergedPdfUrl && typeof URL !== 'undefined' && !String(mergedPdfUrl).startsWith('data:')) URL.revokeObjectURL(mergedPdfUrl); } catch { }
        }
      } catch {
        // ignore
      }
      if (mergedPdfDocProxy) {
        try { mergedPdfDocProxy.destroy(); } catch { /* ignore */ }
      }
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch { /* ignore */ }
      }
    };
  }, [mergedPdfUrl, mergedPdfDocProxy]);

    useEffect(() => {
    const renderMergedPdfPreview = async () => {
      if (!mergedPdfDocProxy || !mergedPdfPreviewCanvasRef.current || !pdfjs) return;

      try {
        const page = await mergedPdfDocProxy.getPage(1);
        const canvas = mergedPdfPreviewCanvasRef.current;
        const context = canvas.getContext("2d");
        const viewport = page.getViewport({ scale: 1 });
        const scale = canvas.width / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        canvas.height = scaledViewport.height;

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };
        context.clearRect(0, 0, canvas.width, canvas.height);
        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        renderTaskRef.current = null;
      } catch (e) {
        if (e.name !== "RenderingCancelledException") {
          setError("Failed to render PDF preview.");
        }
      }
    };

    renderMergedPdfPreview();
  }, [mergedPdfDocProxy, pdfjs]);



  const handleFiles = (newFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setError("");
    // Announce file addition to screen readers
    setStatusMessage(`${newFiles.length} file${newFiles.length > 1 ? 's' : ''} added. Total: ${files.length + newFiles.length} files.`);
    // revoke any previous merged URL
    try { if (mergedPdfUrl && typeof URL !== 'undefined' && !String(mergedPdfUrl).startsWith('data:')) URL.revokeObjectURL(mergedPdfUrl); } catch { /* ignore */ }
    setMergedPdfUrl(null);
    if (mergedPdfDocProxy) {
      try { mergedPdfDocProxy.destroy(); } catch { /* ignore */ }
      setMergedPdfDocProxy(null);
    }
    setProgress(0);
  };

  const removeFile = useCallback(
    (indexToRemove) => {
      const fileName = files[indexToRemove]?.name || 'File';
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== indexToRemove));
      // Announce removal to screen readers
      setStatusMessage(`${fileName} removed. ${files.length - 1} files remaining.`);
      try { if (mergedPdfUrl && typeof URL !== 'undefined' && !String(mergedPdfUrl).startsWith('data:')) URL.revokeObjectURL(mergedPdfUrl); } catch { /* ignore */ }
      setMergedPdfUrl(null);
      if (mergedPdfDocProxy) {
        try { mergedPdfDocProxy.destroy(); } catch { /* ignore */ }
        setMergedPdfDocProxy(null);
      }
      setProgress(0);
    },
    [mergedPdfDocProxy, mergedPdfUrl, files]
  );

  const handleDragStart = (e, index) => {
    setDragItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
  };

  const handleDragEnter = (e, index) => {
    setDragOverItemIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (dragItemIndex !== null && dragOverItemIndex !== null) {
      setFiles((prevFiles) => {
        const draggedItem = prevFiles[dragItemIndex];
        const newFiles = [...prevFiles];
        newFiles.splice(dragItemIndex, 1);
        newFiles.splice(dragOverItemIndex, 0, draggedItem);
        return newFiles;
      });
    }
    setDragItemIndex(null);
    setDragOverItemIndex(null);
  };

  const handleDragEnd = () => {
    setDragItemIndex(null);
    setDragOverItemIndex(null);
  };

  const handleDragLeave = () => { };

  const mergePDFs = async () => {
    if (files.length === 0) {
      setError("Please add at least one PDF file.");
      setStatusMessage("Error: Please add at least one PDF file.");
      return;
    }

    setError("");
    setProgress(0);
    setStatusMessage("Merging PDFs...");
    setMergedPdfUrl(null);
    if (mergedPdfDocProxy) {
      mergedPdfDocProxy.destroy();
      setMergedPdfDocProxy(null);
    }

    try {
      // Create a new PDF document
      const mergedPdf = await PDFLib.PDFDocument.create();

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));

        // Update progress
        setProgress(((i + 1) / files.length) * 100);
        setStatusMessage(`Processing file ${i + 1} of ${files.length}...`);
      }

      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      // revoke previous merged URL if present
      try { safeRevokeObjectURL(mergedPdfUrl); } catch { /* ignore */ }
      const url = safeCreateObjectURL(blob);
      // set a safe download filename based on first source file
      const baseName = files && files.length > 0 && files[0].name ? sanitizeFileName(String(files[0].name).replace(/\.[^/.]+$/, "")) : "merged";
      setMergedDownloadName(`merged_${baseName}.pdf`);
      setMergedPdfUrl(url);

      // Announce success to screen readers
      setStatusMessage(`Success! ${files.length} PDFs merged. Ready for download.`);

      // Load the merged PDF for preview
      if (pdfjs) {
        const docProxy = await pdfjs.getDocument({ data: mergedPdfBytes }).promise;
        setMergedPdfDocProxy(docProxy);
      }
    } catch {
      toast.error("Error merging PDFs. Please try again.");
      setError("Failed to merge PDFs. Please try again with different files.");
      setStatusMessage("Error: Failed to merge PDFs. Please try again.");
    }
  };

  // Tool metadata intentionally omitted here to avoid unused variable lint errors;
  // descriptive content is provided at the parent ToolPageLayout where applicable.

  return (
    <div className="space-y-6">
      {/* Screen reader announcements */}
      <LiveRegion message={statusMessage} priority="polite" />

      {(pdfLibLoading || pdfjsLoading) ? (
        <div className="flex flex-col items-center justify-center p-8 bg-muted border border-border rounded-none">
          <div className="animate-spin h-12 w-12 border-b-2 border-primary mb-4" aria-hidden="true"></div>
          <p className="text-muted-foreground" role="status">Loading PDF processing tools...</p>
        </div>
      ) : (
        <FileDropzone
          accept="application/pdf"
          multiple
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Choose PDF Files"
          description="Drag & drop or click to select PDF files. You can select multiple."
          maxSize={50 * 1024 * 1024}
        />
      )}

      {(pdfLibError || pdfjsError) && (
        <Alert variant="destructive" className="mt-4">
          Error loading PDF processing tools. Please refresh the page.
        </Alert>
      )}

      {files.length > 0 && (
        <div className="mt-4 p-5 bg-card shadow-lg border border-border rounded-none space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl flex items-center text-foreground">
              <Move className="w-5 h-5 mr-2 text-muted-foreground" />
              Files to Merge (Drag to Reorder)
            </h2>
            <span className="text-sm text-muted-foreground">{files.length} files</span>
          </div>

          <ul
            className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2"
            aria-label="List of PDF files to merge"
          >
            {files.map((file, index) => (
              <li
                key={file.name + file.lastModified}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
                className={`file-item flex items-center justify-between p-4 border border-border bg-muted/30 cursor-grab transition-all duration-200 rounded-none ${dragItemIndex === index ? "opacity-75 shadow-lg ring-2 ring-primary" : ""
                  } ${dragOverItemIndex === index &&
                    dragItemIndex !== index
                    ? "scale-[1.02] border-primary/50 bg-muted"
                    : ""
                  }`}
                aria-grabbed={dragItemIndex === index ? "true" : "false"}
                aria-roledescription="Draggable file item"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-background shadow-sm rounded-none mr-3">
                    <FileText className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="font-medium line-clamp-1 text-foreground">{file.name}</span>
                    <span className="text-xs text-muted-foreground block">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="ml-2 px-2 py-0.5"
                  onClick={() => removeFile(index)}
                  aria-label={`Remove ${file.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {progress > 0 && progress < 100 && (
        <div className="space-y-3">
          <Progress
            value={progress}
            className="h-2.5"
          />
          <p className="text-sm text-center text-muted-foreground">
            Merging PDFs... {Math.round(progress)}%
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}

      <div className="flex justify-center">
        <Button
          onClick={mergePDFs}
          variant="default"
          size="lg"
          disabled={files.length === 0}
          aria-label="Merge selected PDF files"
        >
          Merge PDFs
        </Button>
      </div>

      {mergedPdfUrl && (
        <div className="flex flex-col gap-6 p-6 bg-card shadow-lg border border-border rounded-none">
          <div className="w-full text-center space-y-4">
            <h3 className="text-2xl font-semibold flex items-center justify-center text-foreground">
              <Download className="w-6 h-6 mr-2 text-emerald-600 dark:text-emerald-400" />
              Merged PDF Ready
            </h3>

            <div className="w-full flex justify-center items-center bg-muted/50 border border-border overflow-hidden relative p-4 rounded-none">
              <canvas
                ref={mergedPdfPreviewCanvasRef}
                className="max-w-full h-auto border border-border shadow-lg"
                style={{ maxWidth: "100%", height: "auto" }}
                aria-label="Merged PDF preview"
              ></canvas>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              asChild
              variant="success"
              size="lg"
            >
              <a
                href={mergedPdfUrl}
                download={mergedDownloadName}
                className="text-center flex items-center"
                onClick={() => {
                  const u = mergedPdfUrl;
                  if (!u || String(u).startsWith("data:")) return;
                  setTimeout(() => { try { if (typeof URL !== "undefined" && !String(u).startsWith('data:')) URL.revokeObjectURL(u); } catch { /* ignore */ } }, 500);
                }}
              >
                <Download className="w-5 h-5 mr-2" />
                Download Merged PDF
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
