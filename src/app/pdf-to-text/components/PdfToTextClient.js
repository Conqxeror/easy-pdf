"use client";

import React, { useState, useEffect, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { loadPdfJs } from "@/lib/pdfjsWorker";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import { Textarea } from "@/components/ui/textarea";

export default function PdfToTextClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [textResultUrl, setTextResultUrl] = useState(null);

  useEffect(() => {
    // Clean up object URLs on unmount
    return () => {
      if (textResultUrl) {
        try { safeRevokeObjectURL(textResultUrl); } catch { /* ignore */ }
      }
    };
  }, [textResultUrl]);

  const handleFile = useCallback((incomingFiles) => {
    setError("");
    if (!incomingFiles?.length) {
      setFile(null);
      setExtractedText("");
      if (textResultUrl) {
        try { safeRevokeObjectURL(textResultUrl); } catch { /* ignore */ }
      }
      setTextResultUrl(null);
      return;
    }

    setFile(incomingFiles[0]);
    setExtractedText("");
    setCurrentProgress(0);
    setError("");
    if (textResultUrl) {
      try { safeRevokeObjectURL(textResultUrl); } catch { /* ignore */ }
    }
    setTextResultUrl(null);
  }, [textResultUrl]);

  // Function to extract native text from PDF
  const extractNativeTextFromPdf = async (pdfFile) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfjs = await loadPdfJs();

      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
      });
      const pdf = await loadingTask.promise;

      let allText = '';

      // Process each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Extract text items and format them
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();

        if (pageText) {
          allText += `Page ${i}:\n${pageText}\n\n`;
        } else {
          allText += `Page ${i}: [No extractable text found - may require OCR]\n\n`;
        }

        // Update progress
        setCurrentProgress(Math.round((i / pdf.numPages) * 100));
      }

      return allText.trim();
    } catch (error) {
      console.error("PDF to Text extraction failed:", error);
      throw error;
    }
  };

  const convertPdfToText = useCallback(async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setProcessingMessage("Initializing PDF processing...");
    setCurrentProgress(0);
    setError("");
    setExtractedText("");

    try {
      const textContent = await extractNativeTextFromPdf(file);
      setExtractedText(textContent);

      // Create a text file for download
      const textBlob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
      if (textResultUrl) {
        try { safeRevokeObjectURL(textResultUrl); } catch { /* ignore */ }
      }
      const resultUrl = safeCreateObjectURL(textBlob);
      setTextResultUrl(resultUrl);

      setProcessingMessage("Text extraction complete!");
      setCurrentProgress(100);
    } catch (conversionError) {
      console.error("Failed to extract text from PDF", conversionError);
      setError(`Text extraction failed: ${conversionError?.message || "Unable to extract text from this PDF"}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingMessage(""), 2000);
    }
  }, [file, textResultUrl]);

  const handleCopyText = async () => {
    if (extractedText) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(extractedText);
          setError("Text copied to clipboard!");
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = extractedText;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            document.execCommand('copy');
            setError("Text copied to clipboard!");
          } catch {
            setError("Failed to copy text. Please select and copy manually.");
          } finally {
            document.body.removeChild(textArea);
          }
        }
        setTimeout(() => setError(""), 3000);
      } catch {
        setError("Failed to copy text. Please select and copy manually.");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const toolName = "PDF to Text Converter";
  const toolDescription = "Extract native text content from PDF files directly in your browser. This tool extracts text that is encoded in the PDF without using OCR, making it faster for text-based PDFs.";
  const steps = [
    "Upload a PDF file via drag & drop or the file picker.",
    "Click 'Extract Text' to extract native text content from the PDF.",
    "View the extracted text and copy it or download as a text file.",
  ];
  const faqs = [
    {
      question: "What is the difference between native text extraction and OCR?",
      answer: "Native text extraction retrieves text that is already encoded in the PDF file, making it faster and more accurate for text-based PDFs. OCR (Optical Character Recognition) processes images of text, which is slower but works on scanned documents with no native text content.",
    },
    {
      question: "When is native text extraction not possible?",
      answer: "Native text extraction won't work on scanned PDFs, images embedded as text, or PDFs created from image-only sources. In these cases, OCR is required to recognize and extract the text.",
    },
    {
      question: "Is there a file size limit?",
      answer: "Files above ~50MB might not load reliably in-browser. For larger PDFs, split them before extraction.",
    },
    {
      question: "Are my PDFs uploaded to a server?",
      answer: "No. All extraction happens securely in your browser. Your PDF files never leave your device.",
    },
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Extract native text content from PDF files."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF to Text", href: "/pdf-to-text" },
      ]}
      currentTool="pdf-to-text"
    >
      <div className="space-y-6">
        <FileDropzone
          accept=".pdf"
          multiple={false}
          onFiles={handleFile}
          error={error}
          setError={setError}
          label="Upload PDF file"
          description="Drag & drop or click to select a PDF file (max 50MB)"
          maxSize={50 * 1024 * 1024}
          isLoading={isProcessing}
        />

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Extraction error</AlertTitle>
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

        {file && !isProcessing && !extractedText && (
          <div className="flex justify-center">
            <Button
              onClick={convertPdfToText}
              disabled={isProcessing}
              className="px-8 py-3 bg-background text-foreground shadow-lg hover:shadow-xl border border-border"
              variant="default"
              size="lg"
            >
              Extract Text from PDF
            </Button>
          </div>
        )}

        {extractedText && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Extracted Text</h3>
              <div className="flex gap-2">
                <Button onClick={handleCopyText} variant="outline" size="sm">
                  Copy Text
                </Button>
                {textResultUrl && (
                  <Button asChild variant="success" size="sm">
                    <a href={textResultUrl} download={`${sanitizeFileName(file.name.replace(/\.[^.]+$/, "")) || "extracted-text"}.txt`}>
                      Download TXT
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="border border-border dark:border-border rounded-none bg-background dark:bg-background">
              <Textarea
                value={extractedText}
                readOnly
                className="w-full h-96 font-mono text-sm resize-none bg-background dark:bg-background border-0"
                placeholder="Extracted text will appear here..."
              />
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
