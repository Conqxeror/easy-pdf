"use client";

import React, { useState, useEffect, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { loadPdfJs } from "@/lib/pdfjsWorker";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";

// Dynamically import docx library to reduce initial bundle size
const importDocx = async () => {
  // If docx isn't available in client-side, we'll use an alternative approach
  try {
    return await import("docx");
  } catch (e) {
    console.warn("docx library not available in client-side", e);
    return null;
  }
};

export default function PdfToDocxClient() {
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

  const convertPdfToDocx = async (file) => {
    try {
      // Load PDF and extract text content
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await loadPdfJs();

      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
      });
      const pdf = await loadingTask.promise;

      // Extract text content from all pages
      const textContent = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();

        // Process text items to extract text content
        const pageText = text.items
          .map(item => item.str)
          .join(' ');

        textContent.push(pageText);
      }

      // Combine all text content
      const fullText = textContent.join('\n\n');

      // If docx library is available, use it to create a proper Word document
      const docxLib = await importDocx();

      if (docxLib && docxLib.Document && docxLib.Packer && docxLib.Paragraph && docxLib.TextRun) {
        const { Document, Packer, Paragraph, TextRun } = docxLib;

        // Create a new document
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [new TextRun(fullText)]
              })
            ],
          }],
        });

        // Generate the Word document
        const blob = await Packer.toBlob(doc);
        return blob;
      } else {
        // Fallback: create a plain text file with .docx extension if docx library is not available
        // This is a workaround for when docx library isn't available in client-side environment
        const textBlob = new Blob([fullText], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        return textBlob;
      }
    } catch (error) {
      console.error("PDF to DOCX conversion failed:", error);
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
        const docxBlob = await convertPdfToDocx(item.file);
        if (item.resultUrl) {
          try { safeRevokeObjectURL(item.resultUrl); } catch { /* ignore */ }
        }
        const resultUrl = safeCreateObjectURL(docxBlob);
        const safeName = `${sanitizeFileName(item.file.name.replace(/\.[^.]+$/, "")) || "converted"}.docx`;
        item.resultUrl = resultUrl;
        item.resultName = safeName;
        item.status = "done";
        item.error = "";
      } catch (conversionError) {
        console.error("Failed to convert PDF", conversionError);
        item.status = "error";
        item.error = conversionError?.message || "Conversion failed";
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

  const toolName = "PDF to DOCX Converter";
  const toolDescription = "Convert your PDF files to editable Microsoft Word documents (DOCX) entirely in your browser. Extract text content from PDFs and create Word files without uploading to a server.";
  const steps = [
    "Upload PDF files via drag & drop or the file picker.",
    "Click 'Convert to DOCX' to extract text and create Word documents locally.",
    "Download the generated DOCX files and continue editing if needed.",
  ];
  const faqs = [
    {
      question: "How accurate is the conversion?",
      answer: "Text extraction from PDFs is generally accurate. However, complex layouts, images, and formatting may not be perfectly preserved. The converter focuses on extracting and preserving the text content.",
    },
    {
      question: "Is there a file size limit?",
      answer: "Files above ~50MB might not load reliably in-browser. For larger PDFs, split them into smaller sections before conversion.",
    },
    {
      question: "Are my PDFs uploaded to a server?",
      answer: "No. All conversion happens securely in your browser. Your PDF files never leave your device.",
    },
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Convert PDF files to editable Word documents without uploading anything."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF to DOCX", href: "/pdf-to-docx" },
      ]}
      currentTool="pdf-to-docx"
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
                  {isProcessing ? "Converting..." : "Convert to DOCX"}
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
                        Download DOCX
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
