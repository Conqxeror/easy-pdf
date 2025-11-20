"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const ACCEPT = ".txt,text/plain";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB guard

export default function TxtToPdfClient() {
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [inputText, setInputText] = useState("");
  const [pageFormat, setPageFormat] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [fontSize, setFontSize] = useState(12);
  const [includeHeaders, setIncludeHeaders] = useState(false);
  const [fileName, setFileName] = useState("text-document");

  const textareaRef = useRef(null);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { };
      }
    };
  }, [downloadUrl]);

  const handleFiles = (files) => {
    setError("");
    if (!files?.length) {
      setInputText("");
      setDownloadUrl(null);
      return;
    }

    const selectedFile = files[0];
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File too large. Please use text files under 10MB for client-side processing.");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.txt')) {
      setError("Please upload a text file (.txt)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setInputText(e.target.result);
      setFileName(selectedFile.name.replace(/\.[^.]+$/, ""));
      setError("");
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    };
    reader.readAsText(selectedFile);
  };

  const convertTxtToPdf = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to convert to PDF.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Dynamically import jsPDF to keep bundle size small
      const jsPDFModule = await import("jspdf");
      const { jsPDF } = jsPDFModule;

      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: orientation,
        unit: "pt",
        format: pageFormat
      });

      // Define margins
      const margin = 40;
      const pageWidth = pdf.internal.pageSize.width;
      const usableWidth = pageWidth - (margin * 2);

      // Set font and size
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(fontSize);

      // Split the text into lines that fit within the page width
      const lines = pdf.splitTextToSize(inputText, usableWidth);

      // Add headers/footers if requested
      if (includeHeaders) {
        const pageCount = Math.ceil(lines.length / 50); // Estimate number of pages needed

        pdf.setFontSize(10);
        pdf.text(`Document: ${fileName}`, margin, 20);
        pdf.text(`Page 1 of ${pageCount}`, pageWidth - margin - 50, 20);
        pdf.line(margin, 30, pageWidth - margin, 30); // Header line

        // Footer line
        pdf.line(margin, pdf.internal.pageSize.height - 30, pageWidth - margin, pdf.internal.pageSize.height - 30);
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, pdf.internal.pageSize.height - 20);
      }

      // Set font back to user preference
      pdf.setFontSize(fontSize);
      let yPosition = includeHeaders ? 50 : margin;

      // Add text to PDF page by page
      let lineIndex = 0;
      while (lineIndex < lines.length) {
        // Check if we need a new page
        const lineHeight = fontSize * 1.3;
        if (yPosition + lineHeight > pdf.internal.pageSize.height - (includeHeaders ? 50 : margin)) {
          pdf.addPage();
          yPosition = includeHeaders ? 50 : margin;

          // Add headers/footers to new page if needed
          if (includeHeaders) {
            const currentPageNum = pdf.internal.getNumberOfPages();
            const pageCount = Math.ceil(lines.length / Math.floor((pdf.internal.pageSize.height - 60) / lineHeight));

            pdf.setFontSize(10);
            pdf.text(`Document: ${fileName}`, margin, 20);
            pdf.text(`Page ${currentPageNum} of ${pageCount}`, pageWidth - margin - 50, 20);
            pdf.line(margin, 30, pageWidth - margin, 30); // Header line

            // Footer line
            pdf.line(margin, pdf.internal.pageSize.height - 30, pageWidth - margin, pdf.internal.pageSize.height - 30);
            pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, pdf.internal.pageSize.height - 20);
          }
        }

        // Add the line to the PDF
        pdf.text(lines[lineIndex], margin, yPosition);
        yPosition += lineHeight;
        lineIndex++;
      }

      // Generate the PDF blob
      const pdfBlob = pdf.output("blob");
      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { };
      }
      const url = safeCreateObjectURL(pdfBlob);
      setDownloadUrl(url);

      setError("");
    } catch (err) {
      console.error("TXT to PDF conversion failed", err);
      setError("Failed to convert text to PDF. Please try again with different settings.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toolName = "Text to PDF Converter";
  const toolDescription = "Convert plain text to PDF documents with customizable formatting. Perfect for creating structured documents from plain text with custom fonts, sizes, and layouts.";
  const steps = [
    "Enter or paste your text in the text area below",
    "Set PDF formatting options (page size, orientation, font size)",
    "Click 'Convert to PDF' to create the PDF document",
    "Download the generated PDF file"
  ];
  const faqs = [
    {
      question: "How do I convert text to PDF?",
      answer: "Simply enter or paste your text in the text area, adjust the formatting options like page size and font, then click 'Convert to PDF'. You can also upload a text file directly."
    },
    {
      question: "Can I adjust the formatting of the PDF?",
      answer: "Yes, you can customize the page format (A3, A4, A5, Letter, Legal), orientation (portrait/landscape), font size, and choose to include headers and footers."
    },
    {
      question: "Is my text uploaded to a server?",
      answer: "No, all processing happens in your browser. Your text remains on your device and is never uploaded anywhere."
    }
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Text to PDF", href: "/txt-to-pdf" },
      ]}
      currentTool="txt-to-pdf"
    >
      <div className="space-y-6">
        <FileDropzone
          accept={ACCEPT}
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload text file"
          description="Plain text files (max 10MB)"
          maxSize={MAX_FILE_SIZE}
        />

        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Label htmlFor="textInput" className="block text-sm font-medium mb-2">
              Enter your text
            </Label>
            <textarea
              id="textInput"
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type your text here..."
              rows={15}
              className="w-full border px-3 py-2 font-mono text-sm"
            />
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-background dark:bg-background">
              <h3 className="font-semibold mb-3">PDF Settings</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="pageFormat" className="block text-sm font-medium mb-1">Page Format</Label>
                  <Select value={pageFormat} onValueChange={setPageFormat}>
                    <SelectTrigger id="pageFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a3">A3</SelectItem>
                      <SelectItem value="a4">A4 (Default)</SelectItem>
                      <SelectItem value="a5">A5</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="orientation" className="block text-sm font-medium mb-1">Orientation</Label>
                  <Select value={orientation} onValueChange={setOrientation}>
                    <SelectTrigger id="orientation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fontSize" className="block text-sm font-medium mb-1">Font Size: {fontSize}px</Label>
                  <input
                    type="range"
                    id="fontSize"
                    min="8"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="includeHeaders"
                    checked={includeHeaders}
                    onCheckedChange={setIncludeHeaders}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="includeHeaders" className="text-sm font-medium leading-none">
                      Include Headers & Footers
                    </Label>
                    <p className="text-xs text-foreground">Adds document name and page numbers</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fileNameInput" className="block text-sm font-medium mb-1">File Name</Label>
                  <Input
                    id="fileNameInput"
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full text-sm"
                    placeholder="Enter document name"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={convertTxtToPdf}
                disabled={isProcessing || !inputText.trim()}
                className="w-full py-3"
              >
                {isProcessing ? "Creating PDF..." : "Convert to PDF"}
              </Button>

              {downloadUrl && (
                <Button asChild className="w-full">
                  <a href={downloadUrl} download={`${sanitizeFileName(fileName) || "text-document"}.pdf`}>
                    Download PDF
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {inputText && (
          <div className="p-4 bg-background dark:bg-background border">
            <h3 className="font-semibold mb-2">Text Preview</h3>
            <div className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-sm font-mono bg-background dark:bg-background p-3 border">
              {inputText.substring(0, 500)}{inputText.length > 500 ? "..." : ""}
            </div>
            <p className="text-xs text-foreground mt-1">{inputText.length} characters</p>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
