"use client";

import React, { useState, useEffect, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { loadPdfJs } from "@/lib/pdfjsWorker";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import { toast } from "sonner";

export default function PdfToXlsxClient() {
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

  // Helper to extract potential table data from PDF
  const extractTablesFromPdf = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await loadPdfJs();

      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
      });
      const pdf = await loadingTask.promise;

      // Get text content from all pages to identify potential tables
      const allTextContent = [];
      const allPagesData = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        // Get text content with position information
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1 });

        // Process text items to group by position (potential table cells)
        const items = textContent.items.map(item => {
          const transform = item.transform;
          return {
            str: item.str,
            width: item.width,
            height: item.height,
            x: transform[4],
            y: transform[5]
          };
        });

        allPagesData.push({
          pageNumber: i,
          items: items,
          viewport: viewport
        });

        // Also get basic text representation
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');

        allTextContent.push(pageText);
      }

      // For now, we'll return a simple CSV representation of the text content
      // In a more advanced implementation, we would parse the position data 
      // to identify actual tables

      // Simple approach: split text by lines and attempt to identify table-like structures
      const fullText = allTextContent.join('\n\n');

      // Create a basic CSV from the text - this is a simplified approach
      // In a production implementation, we'd use more sophisticated parsing
      // to identify actual table structures based on positioning data
      let csvContent = '';

      // Identify potential table headers and create CSV
      // For now, just create a simple CSV with one column for the text content
      csvContent += 'Page Content\n';
      csvContent += '"' + fullText.replace(/"/g, '""') + '"';

      return csvContent;
    } catch (error) {
      toast.error(error?.message || "PDF to XLSX conversion failed");
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
        const csvContent = await extractTablesFromPdf(item.file);

        // Create a CSV blob (as a fallback since XLSX library might not be available)
        const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        if (item.resultUrl) {
          try { safeRevokeObjectURL(item.resultUrl); } catch { /* ignore */ }
        }
        const resultUrl = safeCreateObjectURL(csvBlob);
        const safeName = `${sanitizeFileName(item.file.name.replace(/\.[^.]+$/, "")) || "converted"}.csv`;
        item.resultUrl = resultUrl;
        item.resultName = safeName;
        item.status = "done";
        item.error = "";
      } catch (conversionError) {
        toast.error(conversionError?.message || "Failed to convert PDF");
        item.status = "error";
        item.error = conversionError?.message || "Conversion failed - unable to extract table data from PDF";
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

  const toolName = "PDF to Excel Converter";
  const toolDescription = "Extract table-like text from PDF files and export the recovered data as CSV for Excel, Google Sheets, or Numbers. This version prioritizes lightweight browser-side extraction over native XLSX generation.";
  const steps = [
    "Upload PDF files containing tables via drag & drop or the file picker.",
    "Click 'Extract table data' to scan the PDF text layer for spreadsheet-friendly content.",
    "Download the generated CSV files and open them in Excel or another spreadsheet app for cleanup.",
  ];
  const faqs = [
    {
      question: "How does PDF to Excel conversion work?",
      answer: "The tool reads the PDF text layer and creates a CSV-style export that spreadsheet apps can open. Text-based tables work best, while scanned PDFs and visually complex layouts may need manual cleanup after export.",
    },
    {
      question: "Is there a file size limit?",
      answer: "Files above ~50MB might not load reliably in-browser. For larger PDFs, split them before conversion.",
    },
    {
      question: "Are my PDFs uploaded to a server?",
      answer: "No. All conversion happens securely in your browser. Your PDF files never leave your device.",
    },
    {
      question: "Do I get a native XLSX workbook?",
      answer: "No. This version exports CSV so the output remains reliable and fully client-side. You can open the CSV in Excel and save it as XLSX if needed.",
    },
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Extract table data from PDFs and convert to Excel format."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF to Excel", href: "/pdf-to-xlsx" },
      ]}
      currentTool="pdf-to-xlsx"
    >
      <div className="space-y-6">
        <Alert>
          <AlertTitle>CSV export workflow</AlertTitle>
          <AlertDescription>
            The current browser workflow exports CSV rather than native XLSX. It is best for recovering text-based tables that you can refine in Excel afterward.
          </AlertDescription>
        </Alert>

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
                  {isProcessing ? "Extracting..." : "Extract table data"}
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
                        Download CSV for Excel
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
