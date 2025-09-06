"use client";

import React, { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ToolPageLayout from "@/components/ui/ToolPageLayout";

export default function DeletePagesPage() {
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
      if (deletedPdfUrl) {
        try { URL.revokeObjectURL(deletedPdfUrl); } catch { /* ignore */ }
      }
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
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setNumPages(pdfDoc.getPageCount());
    } catch (err) {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      setFiles([]);
      console.error("PDF load error:", err);
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
      const url = URL.createObjectURL(blob);

      setDeletedPdfUrl((prev) => {
  try { if (prev) URL.revokeObjectURL(prev); } catch { /* ignore */ }
        return url;
      });
      setDownloadFileName(`modified_${file.name}`);

      setError("");
    } catch (err) {
      console.error("Delete pages error:", err);
      setError("Failed to delete pages. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toolName = "Delete PDF Pages";
  const toolDescription = "Remove unwanted pages from your PDF documents with our free online tool. Select specific pages or page ranges to delete, and instantly get a clean, streamlined PDF. Our tool processes your files directly in your browser, ensuring complete privacy and security. Perfect for trimming documents, removing blank pages, or redacting sensitive content.";
  const steps = [
    "Upload your PDF file by dragging it into the dropzone or clicking to select a file.",
    "View the document preview and select the pages you want to delete by clicking on them, or enter page numbers/ranges in the input field.",
    "Click the 'Delete Selected Pages' button to process your document.",
    "Download your newly modified PDF with the selected pages removed.",
  ];
  const faqs = [
    {
      question: "Is it free to delete pages from a PDF?",
      answer: "Yes, our Delete PDF Pages tool is completely free to use. You can remove pages from as many PDF files as you need without any hidden costs or limitations."
    },
    {
      question: "Are my files secure when deleting pages?",
      answer: "Absolutely. Your privacy is our top priority. All PDF processing, including page deletion, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential."
    },
    {
      question: "Can I delete multiple pages at once?",
      answer: "Yes, you can select multiple individual pages or specify page ranges to delete. Simply click on the pages you want to remove or enter ranges like '1-5,8,10-15' in the input field."
    },
    {
      question: "Can I undo page deletion?",
      answer: "Once you've downloaded the modified PDF, the deleted pages are permanently removed. To recover them, you would need to use the original PDF file. We recommend keeping a backup of your original document."
    },
    {
      question: "Is there a limit to the number of pages I can delete?",
      answer: "No, you can delete as many pages as you want from your PDF. The tool works with documents of any size, though processing speed may vary based on file complexity."
    }
  ];

  return (
    <ToolPageLayout
      title="Delete PDF Pages"
      subtitle="Remove unwanted pages from your PDF documents. Select specific pages or ranges to delete."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
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
          <div className="my-4 p-4 bg-gray-100 rounded-lg shadow-inner border border-gray-200">
            <h2 className="font-semibold text-xl mb-3 text-gray-800">
              Select Pages to Delete ({selected.length} selected)
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Click on the page numbers you wish to remove. Selected pages
              will be highlighted in red.
            </p>

            <div className="mb-4">
              <Label
                htmlFor="page-range"
                className="block text-sm font-medium text-gray-700 mb-2"
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
                  className="flex-grow bg-white border-gray-300 text-gray-800 placeholder-gray-400"
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
                <p className="text-red-600 text-sm mt-2">
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
            disabled={isProcessing || numPages === 0 || selected.length === 0}
            aria-label="Delete selected pages"
            data-test-id="delete-pages-button"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Processing...
              </span>
            ) : (
              "Delete Selected Pages"
            )}
          </Button>
        </div>

        {deletedPdfUrl && !isProcessing && (
          <div className="flex flex-col gap-6 p-6 bg-gray-100 rounded-xl shadow-lg border border-gray-200">
            <div className="w-full text-center space-y-4 text-gray-800">
              <h3 className="text-2xl font-semibold flex items-center justify-center text-green-600">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Pages Deleted Successfully
              </h3>
              <p className="text-gray-500">
                {selected.length} page(s) have been removed from your document.
              </p>
            </div>

            <div className="flex justify-center">
              <Button asChild variant="success" size="lg">
                <a
                  href={deletedPdfUrl}
                  download={downloadFileName}
                  className="text-center flex items-center"
                  onClick={() => {
                    const u = deletedPdfUrl;
                    setTimeout(() => { try { if (u) URL.revokeObjectURL(u); } catch { } }, 500);
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