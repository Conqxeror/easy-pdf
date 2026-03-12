"use client";

import React, { useState, useEffect } from "react";
import { loadPdfLib } from "@/lib/pdfjsWorker";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";
import { toast } from "sonner";

export default function DeletePagesClient() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [numPages, setNumPages] = useState(0);
  // 'selected' stores the indices of pages the user WANTS TO DELETE.
  const [selected, setSelected] = useState([]);
  const [pageRangeInput, setPageRangeInput] = useState(""); // New state for page range input
  const [pageRangeError, setPageRangeError] = useState(""); // New state for page range error
  const [deletedPdfUrl, setDeletedPdfUrl] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState("");

  // Cleanup object URL on unmount or when deletedPdfUrl changes
  useEffect(() => {
    return () => {
      try {
        if (deletedPdfUrl) {
          safeRevokeObjectURL(deletedPdfUrl);
        }
      } catch { /* ignore */ }
    };
  }, [deletedPdfUrl]);

  const handleFiles = async (newFiles) => {
    setError("");
    setNumPages(0);
    setSelected([]);
    setDeletedPdfUrl(null);
    setPageRangeInput("");
    setPageRangeError("");

    if (newFiles.length === 0) {
      setFiles([]);
      return;
    }

    const file = newFiles[0];
    setFiles([file]);

    try {
      const { PDFDocument } = await loadPdfLib();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setNumPages(pdfDoc.getPageCount());
    } catch {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      setFiles([]);
      toast.error("Failed to load PDF. Please ensure it's a valid PDF file.");
    }
  };

  const togglePageSelection = (pageIndex) => {
    setSelected(prev =>
      prev.includes(pageIndex)
        ? prev.filter(i => i !== pageIndex)
        : [...prev, pageIndex]
    );
  };

  const parseAndSelectPageRange = () => {
    if (!pageRangeInput.trim()) {
      setPageRangeError("Please enter a page range.");
      return;
    }

    try {
      const ranges = pageRangeInput.split(',').map(range => range.trim());
      const selectedPages = new Set();

      for (const range of ranges) {
        if (range.includes('-')) {
          const [startStr, endStr] = range.split('-');
          const start = parseInt(startStr.trim());
          const end = parseInt(endStr.trim());

          if (isNaN(start) || isNaN(end) || start < 1 || end > numPages || start > end) {
            setPageRangeError(`Invalid range: ${range}. Please enter valid page numbers between 1 and ${numPages}.`);
            return;
          }

          for (let i = start; i <= end; i++) {
            selectedPages.add(i - 1); // Convert to 0-based index
          }
        } else {
          const pageNum = parseInt(range.trim());
          if (isNaN(pageNum) || pageNum < 1 || pageNum > numPages) {
            setPageRangeError(`Invalid page number: ${pageNum}. Please enter valid page numbers between 1 and ${numPages}.`);
            return;
          }
          selectedPages.add(pageNum - 1); // Convert to 0-based index
        }
      }

      setSelected(Array.from(selectedPages));
      setPageRangeError("");
    } catch (_error) { // eslint-disable-line no-unused-vars
      setPageRangeError("Invalid page range format. Please use comma-separated numbers or ranges (e.g., 1,3,5-10).");
    }
  };

  const handleDelete = async () => {
    if (files.length === 0) {
      setError("Please upload a PDF file first.");
      return;
    }
    if (selected.length === 0) {
      setError("Please select at least one page to delete.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const { PDFDocument } = await loadPdfLib();
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Create a new PDF document
      const newPdfDoc = await PDFDocument.create();

      // Get all pages except the selected ones
      const pagesToKeep = [];
      for (let i = 0; i < numPages; i++) {
        if (!selected.includes(i)) {
          pagesToKeep.push(i);
        }
      }

      // Copy pages to keep to the new document
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToKeep);
      copiedPages.forEach(page => newPdfDoc.addPage(page));

      // Save the new PDF
      const newPdfBytes = await newPdfDoc.save();
      const blob = new Blob([newPdfBytes], { type: "application/pdf" });
      const url = safeCreateObjectURL(blob);

      setDeletedPdfUrl((prev) => {
        if (prev) safeRevokeObjectURL(prev);
        return url;
      });
      const safeBase = file?.name ? file.name.replace(/\.pdf$/i, '').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '') : 'document';
      setDownloadFileName(url ? `modified_${safeBase}.pdf` : `modified_document.pdf`);

      setError("");
    } catch {
      toast.error("Failed to delete pages. Please try again.");
      setError("Failed to delete pages. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Delete PDF Pages"
      subtitle="Remove unwanted pages from your PDF documents with our free online tool. Select specific pages or page ranges to delete, and instantly get a clean, streamlined PDF."
      toolName="Delete PDF Pages"
      toolDescription="Remove unwanted pages from your PDF documents with our free online tool. Select specific pages or page ranges to delete, and instantly get a clean, streamlined PDF. Our tool processes your files directly in your browser, ensuring complete privacy and security. Perfect for trimming documents, removing blank pages, or redacting sensitive content."
      steps={[
        "Upload your PDF file by dragging it into the dropzone or clicking to select a file.",
        "View the document preview and select the pages you want to delete by clicking on them, or enter page numbers/ranges in the input field.",
        "Click the 'Delete Selected Pages' button to process your document.",
        "Download your newly modified PDF with the selected pages removed.",
      ]}
      faqs={[
        {
          question: "Is it free to delete pages from a PDF?",
          answer: "Yes, our Delete PDF Pages tool is completely free to use. You can remove pages from as many PDF files as you need without any hidden costs or limitations."
        },
        {
          question: "Are my files secure?",
          answer: "Absolutely. All processing happens locally in your browser. Your files are never uploaded to our servers, ensuring your documents remain private and secure."
        },
        {
          question: "Can I delete multiple pages at once?",
          answer: "Yes, you can select multiple pages by clicking on them or by entering a page range (e.g., 1-5, 8, 10) in the input field."
        },
        {
          question: "Will the quality of my PDF be affected?",
          answer: "No, deleting pages does not affect the quality of the remaining pages. The tool preserves the original quality of your document."
        }
      ]}
      currentTool="delete-pages"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Delete Pages', href: '/delete-pages' }
      ]}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="application/pdf"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload PDF"
          description="Drag & drop or click to select a PDF file (Max 50MB)"
          maxSize={50 * 1024 * 1024}
          isLoading={isProcessing}
        />

        {numPages > 0 && (
          <div className="my-4 p-4 bg-background shadow-inner border border-border">
            <h2 className="font-semibold text-xl mb-3 text-foreground">
              Select Pages to Delete ({selected.length} selected)
            </h2>
            <p className="text-sm text-foreground mb-4">
              Click on the page numbers you wish to remove. Selected pages
              will be highlighted in red.
            </p>

            <div className="mb-4">
              <Label
                htmlFor="page-range"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Enter Page Range (e.g., 1-5, 8, 10):{" "}
                {numPages ? `/ ${numPages} pages` : ""}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="page-range"
                  type="text"
                  value={pageRangeInput}
                  onChange={(e) => setPageRangeInput(e.target.value)}
                  placeholder="e.g., 1-3, 5, 7-9"
                  className="flex-grow bg-background border-border text-foreground placeholder-gray-400"
                  disabled={isProcessing}
                />
                <Button
                  onClick={parseAndSelectPageRange}
                  variant="default"
                  className="px-4 py-2"
                  disabled={isProcessing || !pageRangeInput.trim()}
                >
                  Apply
                </Button>
              </div>
              {pageRangeError && (
                <p className="text-destructive text-sm mt-2">
                  {pageRangeError}
                </p>
              )}
            </div>

            <ul
              className="flex flex-wrap gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar"
              aria-label="Select pages to delete"
              data-test-id="page-selection-list"
            >
              {Array.from({ length: numPages }, (_, i) => (
                <li key={i}>
                  <Button
                    size="sm"
                    variant={
                      selected.includes(i) ? "destructive" : "success"
                    }
                    aria-label={`Toggle delete for page ${i + 1}`}
                    onClick={() => togglePageSelection(i)}
                    className="w-20"
                  >
                    Page {i + 1}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}

        <div className="flex justify-center">
          <Button
            onClick={handleDelete}
            disabled={isProcessing || files.length === 0 || selected.length === 0}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-foreground shadow-lg hover:shadow-xl"
            variant="destructive"
            size="lg"
            aria-label="Delete selected pages"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></span>
                Processing...
              </span>
            ) : (
              "Delete Selected Pages"
            )}
          </Button>
        </div>

        {deletedPdfUrl && !isProcessing && (
          <div className="flex flex-col gap-6 p-6 bg-background shadow-lg border border-border mt-6">
            <div className="w-full text-center space-y-4 text-foreground">
              <h3 className="text-2xl font-semibold flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Pages Deleted Successfully!
              </h3>
              <p className="text-foreground">
                Your new PDF is ready for download.
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                asChild
                variant="success"
                size="lg"
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-foreground shadow-lg hover:shadow-xl"
              >
                <a
                  href={deletedPdfUrl}
                  download={downloadFileName}
                  className="text-center flex items-center"
                  onClick={() => {
                    const urlToRevoke = deletedPdfUrl;
                    setTimeout(() => {
                      safeRevokeObjectURL(urlToRevoke);
                    }, 500);
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Download Modified PDF
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
