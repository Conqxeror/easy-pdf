"use client";

import React, { useState, useEffect } from "react";
import { loadPdfLib } from "@/lib/pdfjsWorker";
import { Download, FileText, Split } from "lucide-react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import ToolActions from "@/components/ui/ToolActions";
import PageRangeInput from "@/components/ui/PageRangeInput";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import JSZip from "jszip";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from '@/lib/enhancedUX';

export default function SplitPdfPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [splitMode, setSplitMode] = useState("range"); // 'range', 'individual', 'custom'
  const [startPage, setStartPage] = useState(""); // 1-based string
  const [endPage, setEndPage] = useState(""); // 1-based string
  const [customRanges, setCustomRanges] = useState([{ start: "", end: "" }]); // Array of { start, end } objects (1-based strings)
  const [totalPages, setTotalPages] = useState(0);
  const [downloadFileName, setDownloadFileName] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);

  // Cleanup function for object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      try {
        if (pdfUrl && typeof URL !== 'undefined' && !String(pdfUrl).startsWith('data:')) {
          try { if (pdfUrl && typeof URL !== 'undefined' && !String(pdfUrl).startsWith('data:')) URL.revokeObjectURL(pdfUrl); } catch { }
        }
      } catch {
        // ignore
      }
    };
  }, [pdfUrl]); // Run when pdfUrl changes or component unmounts

  /**
   * Handles file selection from the dropzone.
   * Loads the PDF to get total pages for the range input.
   * @param {File[]} files - An array of selected files.
   */
  const handleFiles = async (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    setError("");
    setPdfUrl(null);
    setStartPage(""); // Reset page range
    setEndPage(""); // Reset page range
    setCustomRanges([{ start: "", end: "" }]); // Reset custom ranges
    setTotalPages(0); // Reset total pages
    setDownloadFileName("");
    setCurrentProgress(0);

    if (!selectedFile) return;

    try {
      const { PDFDocument } = await loadPdfLib();
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdfDoc.getPageCount());
      // Set default range to all pages if a file is loaded
      setStartPage("1");
      setEndPage(String(pdfDoc.getPageCount()));
    } catch (e) {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      console.error("PDF load error:", e);
      setTotalPages(0);
      setFile(null); // Clear file on error
      setFileName("");
    }
  };

  /**
   * Adds a new custom range input field.
   */
  const addCustomRange = () => {
    setCustomRanges([...customRanges, { start: "", end: "" }]);
  };

  /**
   * Removes a custom range input field at the specified index.
   * @param {number} index - The index of the range to remove.
   */
  const removeCustomRange = (index) => {
    if (customRanges.length > 1) {
      setCustomRanges(customRanges.filter((_, i) => i !== index));
    }
  };

  /**
   * Updates a custom range at the specified index.
   * @param {number} index - The index of the range to update.
   * @param {string} field - The field to update ('start' or 'end').
   * @param {string} value - The new value for the field.
   */
  const updateCustomRange = (index, field, value) => {
    const newCustomRanges = [...customRanges];
    newCustomRanges[index][field] = value;
    setCustomRanges(newCustomRanges);
  };


  /**
   * Splits the PDF based on the selected mode and ranges.
   */
  const splitPDF = async () => {
    setError("");
    setPdfUrl(null);
    setCurrentProgress(0);
    if (!file) {
      setError("Please upload a PDF file.");
      return;
    }
    setIsProcessing(true);
    setProcessingMessage("Loading PDF document...");

    try {
      const { PDFDocument } = await loadPdfLib();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const total = pdfDoc.getPageCount();

      if (splitMode === "range") {
        // Validate page range
        const start = startPage ? Math.max(1, parseInt(startPage, 10)) : 1; // 1-based start
        const end = endPage ? Math.min(total, parseInt(endPage, 10)) : total; // 1-based end

        if (start > end || start < 1 || end > total) {
          setError(
            "Invalid page range. Please ensure start page is less than or equal to end page, and within total pages."
          );
          setIsProcessing(false);
          return;
        }

        setProcessingMessage(`Extracting pages ${start}-${end}...`);
        setCurrentProgress(25);

        // Create a new PDF document for the selected range
        const newPdfDoc = await PDFDocument.create();
        const pageIndicesToCopy = Array.from(
          { length: end - start + 1 },
          (_, i) => start - 1 + i
        ); // 0-based indices for pdf-lib
        const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndicesToCopy);
        copiedPages.forEach((page) => newPdfDoc.addPage(page));

        setCurrentProgress(75);
        setProcessingMessage("Saving split PDF...");

        const pdfBytes = await newPdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = safeCreateObjectURL(blob);
        setPdfUrl((prev) => {
          try { safeRevokeObjectURL(prev); } catch { /* ignore */ }
          return url;
        });
        setDownloadFileName(`${sanitizeFileName(String(fileName).replace(/\.[^/.]+$/, ''))}_pages_${start}-${end}.pdf`);
        setCurrentProgress(100);
        setProcessingMessage("Split complete!");
      } else if (splitMode === "individual") {
        setProcessingMessage("Creating individual PDFs...");
        const zip = new JSZip();

        // Create individual PDFs for each page
        for (let i = 0; i < total; i++) {
          setCurrentProgress(Math.round(((i + 1) / total) * 100));
          setProcessingMessage(`Creating PDF for page ${i + 1} of ${total}...`);

          const singlePageDoc = await PDFDocument.create();
          const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i]); // 0-based index for pdf-lib
          singlePageDoc.addPage(copiedPage);

          const pdfBytes = await singlePageDoc.save();
          const pageNumber = i + 1; // 1-based page number for filename
          zip.file(
            `${sanitizeFileName(fileName.replace(/\.pdf$/i, ""))}_page_${pageNumber}.pdf`,
            pdfBytes
          );
        }

        setProcessingMessage("Compressing individual PDFs into ZIP...");
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = safeCreateObjectURL(zipBlob);
        setPdfUrl((prev) => {
          try { safeRevokeObjectURL(prev); } catch { /* ignore */ }
          return url;
        });
        setDownloadFileName(`${sanitizeFileName(String(fileName).replace(/\.[^/.]+$/, ''))}_pages.zip`);
        setCurrentProgress(100);
        setProcessingMessage("Split complete!");
      } else if (splitMode === "custom") {
        // Validate custom ranges
        const validRanges = [];
        for (const range of customRanges) {
          const start = range.start ? Math.max(1, parseInt(range.start, 10)) : 1;
          const end = range.end ? Math.min(total, parseInt(range.end, 10)) : 1;

          if (start <= end && start >= 1 && end <= total) {
            validRanges.push({ start, end });
          }
        }

        if (validRanges.length === 0) {
          setError("Please enter at least one valid page range.");
          setIsProcessing(false);
          return;
        }

        setProcessingMessage("Creating PDFs for custom ranges...");
        const zip = new JSZip();

        // Create PDFs for each valid range
        for (let i = 0; i < validRanges.length; i++) {
          const range = validRanges[i];
          setCurrentProgress(Math.round(((i + 1) / validRanges.length) * 100));
          setProcessingMessage(
            `Creating PDF for pages ${range.start}-${range.end}...`
          );

          const newPdfDoc = await PDFDocument.create();
          const pageIndicesToCopy = Array.from(
            { length: range.end - range.start + 1 },
            (_, j) => range.start - 1 + j
          ); // 0-based indices for pdf-lib
          const copiedPages = await newPdfDoc.copyPages(
            pdfDoc,
            pageIndicesToCopy
          );
          copiedPages.forEach((page) => newPdfDoc.addPage(page));

          const pdfBytes = await newPdfDoc.save();
          zip.file(
            `${sanitizeFileName(fileName.replace(/\.pdf$/i, ""))}_pages_${range.start}-${range.end
            }.pdf`,
            pdfBytes
          );
        }

        setProcessingMessage("Compressing custom range PDFs into ZIP...");
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = safeCreateObjectURL(zipBlob);
        setPdfUrl((prev) => {
          try { safeRevokeObjectURL(prev); } catch { /* ignore */ }
          return url;
        });
        setDownloadFileName(`${sanitizeFileName(String(fileName).replace(/\.[^/.]+$/, ''))}_ranges.zip`);
        setCurrentProgress(100);
        setProcessingMessage("Split complete!");
      }
    } catch (e) {
      console.error("Split PDF error:", e);
      setError("Failed to split PDF. Please try again.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setCurrentProgress(0);
        setProcessingMessage("");
      }, 2000);
    }
  };

  const toolName = "Split PDF";
  const toolDescription = "Easily split your PDF documents into multiple files. Extract specific pages or ranges, or separate every page into its own PDF. Our online PDF splitter is fast, secure, and processes all your files directly in your browser, ensuring your privacy. Perfect for creating smaller documents, reorganizing content, or sharing only relevant sections.";
  const steps = [
    "Upload your PDF file by dragging it into the dropzone or clicking to select it from your device.",
    "Choose your splitting option: By Page Range to extract a specific set of pages, Extract Individual Pages to get each page as a separate PDF, or Custom Ranges to define multiple page ranges.",
    "If splitting by page range or custom ranges, enter the start and end page numbers you wish to extract.",
    "Click the 'Split PDF' button. The tool will process your document instantly.",
    "Download your newly split PDF file(s). If you chose Extract Individual Pages or Custom Ranges, you will receive a ZIP archive containing individual PDF files.",
  ];
  const faqs = [
    {
      question: "Is it free to split PDF files?",
      answer:
        "Yes, our PDF splitter is completely free to use. You can split as many PDF files as you need without any hidden costs or limitations.",
    },
    {
      question: "Are my files secure and private?",
      answer:
        "All splitting is done client-side in your browser. Your files are never uploaded or stored on any server, ensuring complete privacy for your documents.",
    },
    {
      question: "Can I split large PDFs?",
      answer:
        "You can split PDFs up to 50MB in size. For very large files, consider splitting in batches to maintain optimal performance.",
    },
    {
      question: "Can I extract non-consecutive pages?",
      answer:
        "Yes, our Custom Ranges option allows you to define multiple page ranges to extract non-consecutive pages in a single operation.",
    },
    {
      question: "What format will my split files be in?",
      answer:
        "You will receive standard PDF files, or a ZIP archive if extracting individual pages or custom ranges. Each split PDF maintains the original quality and formatting.",
    },
  ];

  return (
    <ToolPageLayout
      title="Split PDF"
      subtitle="Extract specific pages or ranges, or separate all pages into individual PDFs. All processing is 100% client-side."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="split"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Split PDF', href: '/split' }
      ]}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="application/pdf"
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload PDF"
          description="Drag & drop or click to select a PDF file (Max 50MB)"
          maxSize={50 * 1024 * 1024}
          isLoading={isProcessing && !file}
        />

        {fileName && (
          <div className="p-4 bg-background border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-background/10 mr-3">
                <FileText className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{fileName}</h3>
                <p className="text-sm text-foreground">
                  {totalPages} pages
                </p>
              </div>
            </div>
          </div>
        )}

        {totalPages > 0 && (
          <div className="space-y-5">
            <div>
              <Label className="text-lg font-semibold text-foreground mb-3 block">
                Split Options:
              </Label>
              <RadioGroup
                value={splitMode}
                onValueChange={setSplitMode}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div>
                  <RadioGroupItem
                    value="range"
                    id="split-range"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="split-range"
                    className="flex items-center space-x-3 cursor-pointer p-4 border-2 border-border bg-background hover:bg-background peer-data-[state=checked]:border-border peer-data-[state=checked]:bg-background/10 transition-colors"
                  >
                    <div className="flex items-center justify-center w-5 h-5 border-2 border-border peer-data-[state=checked]:border-border">
                      <div className="w-2 h-2 bg-background peer-data-[state=checked]:bg-background"></div>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">By Page Range</span>
                      <p className="text-xs text-foreground mt-1">Extract specific pages</p>
                    </div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="individual"
                    id="split-individual"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="split-individual"
                    className="flex items-center space-x-3 cursor-pointer p-4 border-2 border-border bg-background hover:bg-background peer-data-[state=checked]:border-border peer-data-[state=checked]:bg-background/10 transition-colors"
                  >
                    <div className="flex items-center justify-center w-5 h-5 border-2 border-border peer-data-[state=checked]:border-border">
                      <div className="w-2 h-2 bg-background peer-data-[state=checked]:bg-background"></div>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Extract Individual Pages</span>
                      <p className="text-xs text-foreground mt-1">Get each page as separate PDF</p>
                    </div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="custom"
                    id="split-custom"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="split-custom"
                    className="flex items-center space-x-3 cursor-pointer p-4 border-2 border-border bg-background hover:bg-background peer-data-[state=checked]:border-border peer-data-[state=checked]:bg-background/10 transition-colors"
                  >
                    <div className="flex items-center justify-center w-5 h-5 border-2 border-border peer-data-[state=checked]:border-border">
                      <div className="w-2 h-2 bg-background peer-data-[state=checked]:bg-background"></div>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Custom Ranges</span>
                      <p className="text-xs text-foreground mt-1">Define multiple page ranges</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {splitMode === "range" && (
              <div className="p-4 bg-background border border-border">
                <Label className="text-foreground mb-3 block flex items-center">
                  <Split className="w-4 h-4 mr-2" />
                  Page Range
                </Label>
                <PageRangeInput
                  startPage={startPage}
                  endPage={endPage}
                  setStartPage={setStartPage}
                  setEndPage={setEndPage}
                  totalPages={totalPages}
                  className="w-full"
                />
              </div>
            )}
            {splitMode === "custom" && (
              <div className="p-4 bg-background border border-border space-y-3">
                <Label className="text-foreground mb-3 block flex items-center">
                  <Split className="w-4 h-4 mr-2" />
                  Custom Ranges
                </Label>
                {customRanges.map((range, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={range.start}
                      onChange={(e) => updateCustomRange(idx, 'start', e.target.value)}
                      placeholder="Start"
                      className="w-24 px-3 py-2 bg-background border border-border text-foreground"
                    />
                    <span className="text-foreground">to</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={range.end}
                      onChange={(e) => updateCustomRange(idx, 'end', e.target.value)}
                      placeholder="End"
                      className="w-24 px-3 py-2 bg-background border border-border text-foreground"
                    />
                    <div className="ml-2 flex items-center space-x-2">
                      <Button variant="ghost" onClick={() => addCustomRange()}>
                        +
                      </Button>
                      <Button variant="ghost" onClick={() => removeCustomRange(idx)} disabled={customRanges.length <= 1}>
                        -
                      </Button>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-foreground">Enter one or more page ranges (e.g., 1-3, 5-7). Ranges are 1-based and must be within total pages.</p>
              </div>
            )}
          </div>
        )}

        {isProcessing &&
          file && (
            <div className="space-y-3 p-4 bg-background border border-border">
              <Progress
                value={currentProgress}
                className="h-2.5 bg-background [&::-webkit-progress-bar]:bg-background [&::-webkit-progress-value]:bg-background"
              />
              <p className="text-sm text-center text-foreground">
                {processingMessage || `Splitting PDF... ${currentProgress}%`}
              </p>
            </div>
          )}

        {error && (
          <Alert variant="destructive" className="text-center">
            {error}
          </Alert>
        )}

        <ToolActions
          primary={{ label: isProcessing ? 'Processing...' : 'Split PDF', onClick: splitPDF, disabled: !file }}
          download={pdfUrl ? { href: pdfUrl, label: downloadFileName || 'Download' } : null}
          isProcessing={isProcessing}
        />

        {pdfUrl && !isProcessing && (
          <div className="flex flex-col gap-6 p-6 bg-background shadow-lg border border-border">
            <div className="w-full text-center space-y-4 text-foreground">
              <h3 className="text-2xl font-semibold flex items-center justify-center">
                <Download className="w-6 h-6 mr-2 text-green-400" />
                Split Complete
              </h3>

              {splitMode === "range" && (
                <div className="bg-background p-4 border border-border">
                  <p className="text-foreground mb-3">Pages {startPage} to {endPage} extracted</p>
                  <iframe
                    src={pdfUrl}
                    width="100%"
                    height="400px"
                    className="border border-border shadow-inner"
                    title="PDF Preview"
                  ></iframe>
                </div>
              )}

              {splitMode === "individual" && (
                <div className="bg-background p-6 border border-border text-center">
                  <p className="text-foreground mb-4">
                    Your PDF has been split into individual pages and compressed into a ZIP file.
                  </p>
                  <div className="inline-flex items-center justify-center p-3 bg-background/10 mb-4">
                    <FileText className="w-8 h-8 text-foreground" />
                  </div>
                  <p className="text-foreground text-sm">
                    {totalPages} individual PDF files
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <a href={pdfUrl} download={downloadFileName} className="inline-flex">
                <Button variant="success" size="lg" className="px-8 py-3">
                  <Download className="w-5 h-5 mr-2" />
                  Download {splitMode === "range" ? "Split PDF" : "ZIP of Pages"}
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
