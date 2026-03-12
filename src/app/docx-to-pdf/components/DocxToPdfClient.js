"use client";

import React, { useState, useEffect, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
// `docx` import retained for compatibility but not required for HTML-based conversion
// We can remove these if the server-side / docx path is not used.
// If higher-fidelity docx rendering is needed we can use `docx` or other tools; current pipeline
// uses `mammoth` + `html2canvas` to render HTML -> PDF. Keep docx import commented.
// import { Document, Packer } from "docx";
import DOMPurify from "dompurify";
// dynamically import jsPDF to ensure compatibility with different bundlers
import mammoth from "mammoth";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB guard for DOCX parsing

export default function DocxToPdfClient() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [usePagedJs, setUsePagedJs] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);
  const shouldLogPagedJsWarnings = typeof window === 'undefined' || !window.navigator?.webdriver;

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.resultUrl) {
          try { safeRevokeObjectURL(file.resultUrl); } catch { /* ignore */ }
        }
      });
    };
  }, [files]);

  // E2E helpers: expose `previewDocx` to allow tests to run a PagedJS-only preview
  // of the currently queued document(s) — this avoids running the full jsPDF
  // pipeline during tests and makes assertions more deterministic.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.__E2E_EXPOSE) window.__E2E_EXPOSE = {};

    window.__E2E_EXPOSE.previewDocx = async (idx = 0) => {
      try {
        const entry = files?.[idx];
        if (!entry) return false;
        const arrayBuffer = await entry.file.arrayBuffer();
        const { value: rawHtml } = await mammoth.convertToHtml({ arrayBuffer });
        const sanitized = DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['target'] });
        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '0';
        wrapper.style.width = '800px';
        wrapper.style.background = 'white';
        wrapper.innerHTML = sanitized;
        document.body.appendChild(wrapper);

        const { PagedPolyfill } = await import('pagedjs');
        if (PagedPolyfill) {
          const paged = new PagedPolyfill();
          await paged.preview(wrapper);
          return true;
        }
      } catch (err) {
        if (shouldLogPagedJsWarnings) {
          console.warn('previewDocx failed during E2E', err);
        }
      }
      return false;
    };

    return () => {
      if (window.__E2E_EXPOSE && window.__E2E_EXPOSE.previewDocx) {
        delete window.__E2E_EXPOSE.previewDocx;
      }
    };
  }, [files, shouldLogPagedJsWarnings]);

  const handleFiles = useCallback((incomingFiles) => {
    setError("");
    if (!incomingFiles?.length) {
      setFiles([]);
      return;
    }

    const prepared = incomingFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      status: "pending",
      resultUrl: null,
      resultName: "",
      error: "",
    }));

    setFiles((prev) => {
      prev.forEach((f) => {
        if (f.resultUrl) {
          try { safeRevokeObjectURL(f.resultUrl); } catch { /* ignore */ }
        }
      });
      return prepared;
    });
  }, []);

  const convertDocxToPdf = useCallback(async (file) => {
    // Convert DOCX -> HTML
    const arrayBuffer = await file.arrayBuffer();
    const { value: rawHtml } = await mammoth.convertToHtml({ arrayBuffer });

    // Sanitize the generated HTML and add a wrapper to control page width
    const sanitized = DOMPurify.sanitize(rawHtml, { ADD_ATTR: ["target"] });
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-9999px";
    wrapper.style.top = "0";
    // Set width to A4 ratio (approx) for consistent rendering
    wrapper.style.width = "800px";
    wrapper.style.background = "white";
    wrapper.innerHTML = sanitized;
    document.body.appendChild(wrapper);

    if (usePagedJs) {
      try {
        // `pagedjs` is optional. If installed in the environment, use it to
        // improve pagination preview before rendering. This is experimental
        // but often yields much better headers/footers and multi-column support.
        const { PagedPolyfill } = await import('pagedjs');
        if (PagedPolyfill) {
          const paged = new PagedPolyfill();
          // Wait for pagedjs to finish applying page layout styles
          await paged.preview(wrapper);
        }
      } catch (err) {
        // Keep going with the default pipeline if pagedjs isn't present.
        if (shouldLogPagedJsWarnings) {
          console.warn('Failed to run pagedjs preview — continuing with jsPDF.html fallback', err);
        }
      }
    }

    // Try a better multi-page path using jsPDF.html which paginates DOM content
    // and respects CSS page breaks. This usually yields better fidelity than
    // flattening the full document into one giant canvas.

    const jsPdfModule = await import('jspdf');
    const JsPdfCtor = jsPdfModule.jsPDF || jsPdfModule.default || jsPdfModule;
    const pdf = new JsPdfCtor({ unit: "pt", format: "a4" });

    // Inject minimal CSS to help paging and avoid unwanted breaks.
    const style = document.createElement("style");
    // Improved basic CSS for multi-page rendering; tables, headers, and images
    // are often the trouble spots in HTML -> PDF conversion. These rules
    // aim to reduce page-breaks in the middle of tables and keep headers.
    style.textContent = `
      @page { size: A4; margin: 20mm; }
      body { background: #fff; color: #000; }
      img { max-width: 100%; height: auto; page-break-inside: avoid; }
      table { page-break-inside: avoid; break-inside: avoid; border-collapse: collapse; width: 100%; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
      p, h1, h2, h3, h4 { orphans: 3; widows: 3; }
      pre, code { white-space: pre-wrap; overflow-wrap: break-word; }
      h1, h2, h3 { break-after: avoid; }
    `;
    wrapper.prepend(style);

    const blob = await new Promise((resolve, reject) => {
      try {
        pdf.html(wrapper, {
          x: 0,
          y: 0,
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          callback: () => {
            try {
              const b = pdf.output("blob");
              resolve(b);
            } catch (err) {
              reject(err);
            }
          },
        });
      } catch (err) {
        reject(err);
      }
    });
    document.body.removeChild(wrapper);
    return blob;
  }, [shouldLogPagedJsWarnings, usePagedJs]);

  const convertAll = useCallback(async () => {
    if (!files.length) {
      setError("Please upload at least one DOCX file.");
      return;
    }

    setIsProcessing(true);
    setProcessingMessage("Preparing conversion...");
    setCurrentProgress(0);
    setError("");

    const updated = [...files];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      if (!item || item.status === "done") continue;

      setProcessingMessage(`Converting ${item.file.name} (${i + 1}/${updated.length})...`);
      setCurrentProgress(Math.round((i / updated.length) * 100));

      try {
        item.status = "processing";
        const pdfBlob = await convertDocxToPdf(item.file);
        if (item.resultUrl) {
          try { safeRevokeObjectURL(item.resultUrl); } catch { /* ignore */ }
        }
        const resultUrl = safeCreateObjectURL(pdfBlob);
        const safeName = `${sanitizeFileName(item.file.name.replace(/\.[^.]+$/, "")) || "converted"}.pdf`;
        item.resultUrl = resultUrl;
        item.resultName = safeName;
        item.status = "done";
        item.error = "";
      } catch (conversionError) {
        item.status = "error";
        item.error = conversionError?.message || "Conversion failed";
      }
    }

    setFiles(updated.map((item) => ({ ...item })));
    setProcessingMessage("Conversion complete!");
    setCurrentProgress(100);
    setTimeout(() => setCurrentProgress(0), 1200);
    setIsProcessing(false);
  }, [files, convertDocxToPdf]);

  const removeFile = (id) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry && entry.resultUrl) {
        try { safeRevokeObjectURL(entry.resultUrl); } catch { /* ignore */ }
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const toolName = "DOCX to PDF Converter";
  const toolDescription = "Convert Microsoft Word documents (DOCX) into polished PDF files entirely in your browser. Upload multiple files, monitor progress, and download results instantly.";
  const steps = [
    "Upload DOCX files via drag & drop or the file picker.",
    "Click 'Convert to PDF' to render the documents locally.",
    "Download the generated PDF files and continue editing if needed.",
  ];
  const faqs = [
    {
      question: "Does formatting stay intact?",
      answer: "The browser-based renderer preserves core text, headings, and basic layout well. Highly complex Word features such as tracked changes, embedded macros, or specialty fonts may render differently, so review the exported PDF before sharing.",
    },
    {
      question: "Is there a file size limit?",
      answer: "Files above roughly 25MB may be slower to process in-browser. For large documents, split them into smaller sections for the most reliable conversion experience.",
    },
    {
      question: "Are my documents uploaded?",
      answer: "Never. All conversion happens in-memory inside your browser.",
    },
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Convert DOCX files to ready-to-share PDFs without uploading anything."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "DOCX to PDF", href: "/docx-to-pdf" },
      ]}
      currentTool="docx-to-pdf"
    >
      <div className="space-y-6">
        <FileDropzone
          accept=".docx"
          multiple
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload DOCX files"
          description="Drag & drop or click to select Word documents (max 25MB each)"
          maxSize={MAX_FILE_SIZE}
          isLoading={isProcessing}
        />

        <div className="flex items-center gap-3 mt-2">
          <input
            id="usePaged"
            type="checkbox"
            checked={usePagedJs}
            onChange={(e) => setUsePagedJs(e.target.checked)}
          />
          <label htmlFor="usePaged" className="text-sm text-foreground">Use experimental PagedJS layout for better pagination (needs `pagedjs` available)</label>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Conversion error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(isProcessing || currentProgress > 0) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-foreground">
              <span>{processingMessage || "Processing..."}</span>
              <span>{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between flex-wrap gap-3">
              <p className="text-sm text-foreground">{files.length} file(s) queued.</p>
              <div className="flex gap-2">
                <Button onClick={convertAll} disabled={isProcessing}>
                  {isProcessing ? "Converting..." : "Convert to PDF"}
                </Button>
                <Button variant="ghost" onClick={() => setFiles([])} disabled={isProcessing}>
                  Clear list
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {files.map((item) => (
                <div key={item.id} className="border border-border dark:border-border rounded-none p-4 space-y-3 bg-background dark:bg-background/40">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground break-all">{item.file.name}</p>
                      <p className="text-xs text-foreground">{(item.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(item.id)} disabled={isProcessing}>
                      Remove
                    </Button>
                  </div>
                  <div className="text-sm">
                    {item.status === "pending" && <span className="text-foreground">Pending conversion</span>}
                    {item.status === "processing" && <span className="text-muted-foreground">Converting...</span>}
                    {item.status === "done" && (
                      <span className="text-emerald-600 dark:text-emerald-400">Ready</span>
                    )}
                    {item.status === "error" && (
                      <span className="text-destructive">{item.error}</span>
                    )}
                  </div>
                  {item.resultUrl && (
                    <Button asChild variant="success" size="sm">
                      <a href={item.resultUrl} download={item.resultName}>
                        Download PDF
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
