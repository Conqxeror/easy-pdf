"use client";

import React, { useState, useEffect, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { loadPdfJs } from "@/lib/pdfjsWorker";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import DOMPurify from "dompurify";
import { toast } from "sonner";

export default function PdfToHtmlClient() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    return () => {
      // Clean up object URLs on unmount
      files.forEach((file) => {
        if (file.resultUrl) {
          try { safeRevokeObjectURL(file.resultUrl); } catch { /* ignore */ }
        }
      });
    };
  }, [files]);

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

  // Function to convert PDF to HTML
  const convertPdfToHtml = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await loadPdfJs();

      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
      });
      const pdf = await loadingTask.promise;

      let htmlContent = '<!DOCTYPE html>\n<html>\n<head>\n<title>Converted from PDF</title>\n<style>\n';
      htmlContent += 'body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }\n';
      htmlContent += 'h1, h2, h3, h4, h5, h6 { margin-top: 1em; margin-bottom: 0.5em; }\n';
      htmlContent += 'p { margin: 0.5em 0; }\n';
      htmlContent += 'table { border-collapse: collapse; width: 100%; margin: 1em 0; }\n';
      htmlContent += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n';
      htmlContent += 'th { background-color: #f2f2f2; }\n';
      htmlContent += '</style>\n</head>\n<body>\n';

      // Process each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Group text items by lines to form paragraphs
        const items = textContent.items;
        const lines = [];
        let currentLine = [];
        let currentY = null;

        for (const item of items) {
          // For simplicity, we'll group items with similar Y positions as lines
          const y = item.transform ? item.transform[5] : 0;

          if (currentY === null || Math.abs(y - currentY) < 5) {
            // Same line
            currentLine.push(item.str || '');
            currentY = y;
          } else {
            // New line
            if (currentLine.length > 0) {
              lines.push(currentLine.join(' '));
            }
            currentLine = [item.str || ''];
            currentY = y;
          }
        }

        // Add the last line
        if (currentLine.length > 0) {
          lines.push(currentLine.join(' '));
        }

        // Create HTML content for this page
        htmlContent += `<h2>Page ${i}</h2>\n`;

        for (const line of lines) {
          if (line.trim()) {
            // Try to detect if this line looks like a header based on capitalization or position
            const trimmedLine = line.trim();
            htmlContent += `<p>${DOMPurify.sanitize(trimmedLine)}</p>\n`;
          }
        }
      }

      htmlContent += '</body>\n</html>';

      return htmlContent;
    } catch (error) {
      toast.error(error?.message || "PDF to HTML conversion failed");
      throw error;
    }
  };

  const convertAll = useCallback(async () => {
    if (!files.length) {
      setError("Please upload at least one PDF file.");
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
        const htmlContent = await convertPdfToHtml(item.file);

        // Create a blob with HTML content
        const htmlBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });

        if (item.resultUrl) {
          try { safeRevokeObjectURL(item.resultUrl); } catch { /* ignore */ }
        }
        const resultUrl = safeCreateObjectURL(htmlBlob);
        const safeName = `${sanitizeFileName(item.file.name.replace(/\.[^.]+$/, "")) || "converted"}.html`;
        item.resultUrl = resultUrl;
        item.resultName = safeName;
        item.status = "done";
        item.error = "";
      } catch (conversionError) {
        toast.error(conversionError?.message || "Failed to convert PDF");
        item.status = "error";
        item.error = conversionError?.message || "Conversion failed - unable to extract content from PDF";
      }
    }

    setFiles(updated.map((item) => ({ ...item })));
    setProcessingMessage("Conversion complete!");
    setCurrentProgress(100);
    setTimeout(() => setCurrentProgress(0), 1200);
    setIsProcessing(false);
  }, [files]);

  const removeFile = (id) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry && entry.resultUrl) {
        try { safeRevokeObjectURL(entry.resultUrl); } catch { /* ignore */ }
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const toolName = "PDF to HTML Converter";
  const toolDescription = "Convert PDF files to HTML markup. Extract content from PDFs and convert to structured HTML documents for web use.";
  const steps = [
    "Upload PDF files via drag & drop or the file picker.",
    "Click 'Convert to HTML' to extract content from the PDFs.",
    "Download the generated HTML files with the converted content.",
  ];
  const faqs = [
    {
      question: "How does PDF to HTML conversion work?",
      answer: "Our tool analyzes the PDF structure to extract text and basic formatting, converting it to HTML markup. Content is preserved as much as possible, though complex layouts may need manual adjustments.",
    },
    {
      question: "Is there a file size limit?",
      answer: "Files above ~50MB might not load reliably in-browser. For larger PDFs, split them before conversion.",
    },
    {
      question: "Are my PDFs uploaded to a server?",
      answer: "No. All conversion happens securely in your browser. Your PDF files never leave your device.",
    },
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Extract content from PDFs and convert to HTML markup."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF to HTML", href: "/pdf-to-html" },
      ]}
      currentTool="pdf-to-html"
    >
      <div className="space-y-6">
        <FileDropzone
          accept=".pdf"
          multiple
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload PDF files"
          description="Drag & drop or click to select PDF files (max 50MB each)"
          maxSize={50 * 1024 * 1024}
          isLoading={isProcessing}
        />

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Conversion error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(isProcessing || currentProgress > 0) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-foreground dark:text-foreground">
              <span>{processingMessage || "Processing..."}</span>
              <span>{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between flex-wrap gap-3">
              <p className="text-sm text-foreground dark:text-foreground">{files.length} file(s) queued.</p>
              <div className="flex gap-2">
                <Button onClick={convertAll} disabled={isProcessing}>
                  {isProcessing ? "Converting..." : "Convert to HTML"}
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
                      <p className="font-semibold text-foreground dark:text-foreground break-all">{item.file.name}</p>
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
                        Download HTML
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
