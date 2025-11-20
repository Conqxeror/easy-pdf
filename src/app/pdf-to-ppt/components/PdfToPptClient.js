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

export default function PdfToPptClient() {
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

  // Function to convert PDF to a presentation-like format
  const convertPdfToPpt = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await loadPdfJs();

      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
      });
      const pdf = await loadingTask.promise;

      // Create a presentation-like HTML structure
      let htmlContent = '<!DOCTYPE html>\n<html>\n<head>\n<title>Converted from PDF</title>\n<style>\n';
      htmlContent += 'body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #1a1a1a; color: white; }\n';
      htmlContent += '.slide { width: 100vw; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px; box-sizing: border-box; position: relative; }\n';
      htmlContent += '.slide-content { max-width: 800px; text-align: center; }\n';
      htmlContent += 'h1 { font-size: 2.5em; margin-bottom: 20px; color: white; }\n';
      htmlContent += 'h2 { font-size: 2em; margin-bottom: 15px; color: #4fc3f7; }\n';
      htmlContent += 'p { font-size: 1.2em; margin: 10px 0; line-height: 1.6; }\n';
      htmlContent += 'ul, ol { text-align: left; font-size: 1.1em; max-width: 600px; }\n';
      htmlContent += '.page-number { position: absolute; bottom: 20px; right: 20px; font-size: 0.9em; color: #aaa; }\n';
      htmlContent += '</style>\n</head>\n<body>\n';

      // Process each page as a presentation slide
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Group text items by lines to form content blocks
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

        // Create slide content
        htmlContent += `<div class="slide">\n<div class="slide-content">\n`;

        // Identify potential headings (lines with fewer words might be headings)
        for (let j = 0; j < lines.length; j++) {
          const line = lines[j].trim();
          if (line) {
            // Simple heuristic to identify potential headings: short lines that might be titles
            if (line.split(' ').length <= 5 && j === 0) {
              htmlContent += `<h1>${DOMPurify.sanitize(line)}</h1>\n`;
            } else {
              htmlContent += `<p>${DOMPurify.sanitize(line)}</p>\n`;
            }
          }
        }

        htmlContent += `<div class="page-number">Slide ${i}</div>\n`;
        htmlContent += `</div>\n</div>\n`;
      }

      htmlContent += '</body>\n</html>';

      return htmlContent;
    } catch (error) {
      console.error("PDF to PPT conversion failed:", error);
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
        const htmlContent = await convertPdfToPpt(item.file);

        // Create a blob with HTML content that can be opened in PowerPoint
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
        console.error("Failed to convert PDF", conversionError);
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

  const toolName = "PDF to PowerPoint Converter";
  const toolDescription = "Convert PDF files to presentation slides. Extract content from PDFs and structure them as presentation slides.";
  const steps = [
    "Upload PDF files via drag & drop or the file picker.",
    "Click 'Convert to PPT' to extract content and structure it as slides.",
    "Download the generated HTML file which can be imported into PowerPoint.",
  ];
  const faqs = [
    {
      question: "How does PDF to PPT conversion work?",
      answer: "Our tool analyzes the PDF structure to extract content and organize it in a slide-based format. The result is an HTML file with presentation styling that can be imported into PowerPoint.",
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
      subtitle="Extract content from PDFs and convert to presentation slides."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF to PPT", href: "/pdf-to-ppt" },
      ]}
      currentTool="pdf-to-ppt"
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
                  {isProcessing ? "Converting..." : "Convert to PPT"}
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
                    {item.status === "processing" && <span className="text-blue-500">Converting...</span>}
                    {item.status === "done" && (
                      <span className="text-green-600">Ready</span>
                    )}
                    {item.status === "error" && (
                      <span className="text-red-600">{item.error}</span>
                    )}
                  </div>
                  {item.resultUrl && (
                    <Button asChild variant="success" size="sm">
                      <a href={item.resultUrl} download={item.resultName}>
                        Download HTML (PPT)
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
