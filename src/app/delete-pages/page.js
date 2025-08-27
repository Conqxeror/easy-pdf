"use client";

import React, { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StandardToolLayout from "@/components/ui/StandardToolLayout";

export default function DeletePagesPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [numPages, setNumPages] = useState(0);
  // 'selected' stores the indices of pages the user WANTS TO DELETE.
  const [selected, setSelected] = useState([]);
  const [pageRangeInput, setPageRangeInput] = useState(""); // New state for page range input
  const [pageRangeError, setPageRangeError] = useState(""); // New state for page range error
  const [deletedPdfUrl, setDeletedPdfUrl] = useState(null); // New state for the result PDF URL
  const [downloadFileName, setDownloadFileName] = useState(""); // New state for download filename

  // Cleanup function for object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (deletedPdfUrl) {
        URL.revokeObjectURL(deletedPdfUrl);
      }
    };
  }, [deletedPdfUrl]); // Run when deletedPdfUrl changes or component unmounts

  /**
   * Handles the selection of PDF files.
   * Clears previous errors and resets page count and selected pages for a new file.
   * @param {File[]} newFiles - An array containing the newly selected file.
   */
  const handleFiles = async (newFiles) => {
    setFiles(newFiles);
    setError(""); // Clear any previous errors when new files are selected
    setNumPages(0); // Reset page count
    setSelected([]); // Reset selected pages
    setPageRangeInput(""); // Reset page range input
    setPageRangeError(""); // Reset page range error

    if (newFiles.length === 0) {
      return; // No file selected, nothing to do
    }

    try {
      const file = newFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setNumPages(pdfDoc.getPageCount()); // Update total page count
    } catch (e) {
      // Catch and display error if PDF loading fails
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      console.error("PDF loading error:", e);
    }
  };

  /**
   * Toggles the selection state of a page.
   * If the page is already selected, it's unselected. Otherwise, it's added to selected.
   * @param {number} idx - The index of the page to toggle (0-based).
   */
  const togglePage = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  /**
   * Applies the page range input to select/deselect pages.
   * Parses input like "1-5, 8, 10" and updates the 'selected' state.
   */
  const applyPageRange = () => {
    setPageRangeError(""); // Clear previous range errors
    const newSelected = new Set();
    const parts = pageRangeInput.split(",").map((part) => part.trim());

    for (const part of parts) {
      if (!part) continue;

      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-");
        const start = parseInt(startStr);
        const end = parseInt(endStr);

        if (
          isNaN(start) ||
          isNaN(end) ||
          start < 1 ||
          end < 1 ||
          start > end ||
          end > numPages
        ) {
          setPageRangeError(
            "Invalid page range format or out of bounds. Example: 1-5, 8"
          );
          return;
        }
        for (let i = start - 1; i < end; i++) {
          newSelected.add(i);
        }
      } else {
        const pageNum = parseInt(part);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > numPages) {
          setPageRangeError(
            "Invalid page number or out of bounds. Example: 1, 3, 5"
          );
          return;
        }
        newSelected.add(pageNum - 1);
      }
    }
    setSelected(Array.from(newSelected).sort((a, b) => a - b));
  };

  /**
   * Handles the deletion process.
   * Loads the original PDF, creates a new one, copies only the unselected pages,
   * and triggers the download of the new PDF.
   */
  const handleDelete = async () => {
    // Basic validation: ensure a file is uploaded
    if (files.length === 0) {
      setError("Please upload a PDF file.");
      return;
    }

    // Additional validation: ensure at least one page is selected for deletion
    // The button's disabled state already handles this from a UX perspective,
    // but this adds an extra layer of safety.
    if (selected.length === 0) {
      setError("Please select at least one page to delete.");
      return;
    }

    setIsProcessing(true); // Indicate that processing has started
    setError(""); // Clear any previous errors

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer); // Load the source PDF

      const newDoc = await PDFDocument.create(); // Create a new empty PDF document

      // Iterate through all pages of the source document
      for (let i = 0; i < srcDoc.getPageCount(); i++) {
        // If the current page index is NOT in the 'selected' array (meaning it's not marked for deletion)
        if (!selected.includes(i)) {
          // Copy the page from the source document to the new document
          // copyPages returns an array, so we destructure to get the single copied page
          const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
          newDoc.addPage(copiedPage); // Add the copied page to the new document
        }
      }

      // Save the new PDF document to bytes
      const pdfBytes = await newDoc.save();

      // Create a Blob from the PDF bytes, specifying the MIME type
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      // Create a URL for the Blob, allowing it to be downloaded
      const url = URL.createObjectURL(blob);
      
      // Set the URL for preview/download instead of auto-downloading
      setDeletedPdfUrl(url);
      setDownloadFileName(`deleted-pages-${new Date().toISOString().slice(0, 10)}.pdf`);

      setError(""); // Clear error on successful operation
    } catch (e) {
      // Catch and display any errors during the deletion process
      setError("Failed to delete pages. Please try again.");
      console.error("PDF deletion error:", e);
    } finally {
      // Ensure processing state is reset, regardless of success or failure
      setIsProcessing(false);
    }
  };

  const toolName = "Delete PDF Pages";
  const toolDescription = "Easily remove unwanted pages from your PDF documents with our free online tool. Select specific pages or a range of pages to delete, and create a new, cleaner PDF in seconds. All processing is done securely in your browser, ensuring your files remain private.";
  const steps = [
    "Upload your PDF file by dragging it into the dropzone or clicking to select a file.",
    "You will see a list of page numbers. Click on the page numbers you wish to remove. Selected pages will be highlighted.",
    "Alternatively, use the 'Enter Page Range' input to specify pages for deletion (e.g., '1-5, 8, 10').",
    "Click the 'Download PDF (Pages Deleted)' button to process and save your new PDF without the selected pages.",
  ];
  const faqs = [
    {
      question: "Is it free to delete pages from a PDF?",
      answer:
        "Yes, our Delete PDF Pages tool is completely free to use. You can remove pages from as many PDF files as you need without any hidden costs or limitations.",
    },
    {
      question: "Are my files secure when deleting pages?",
      answer:
        "Absolutely. Your privacy is our top priority. All PDF processing, including page deletion, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential.",
    },
    {
      question: "Can I delete multiple pages at once?",
      answer:
        "Yes, you can select multiple individual pages or specify a range of pages to delete simultaneously. Our tool is designed for efficient bulk deletion.",
    },
    {
      question: "What happens if I accidentally delete a page?",
      answer:
        "Our tool creates a new PDF with the selected pages removed. Your original PDF remains untouched on your device. If you make a mistake, simply re-upload the original PDF and try again.",
    },
    {
      question: "Is there a file size limit for deleting pages?",
      answer:
        "Yes, the maximum file size for a PDF to be processed is 50MB. For larger files, processing might be slower due to client-side operations.",
    },
  ];

  return (
    <StandardToolLayout
      title="Delete PDF Pages"
      subtitle="Effortlessly remove specific pages from your PDF documents directly in your browser. Your files stay private."
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
          <div className="my-4 p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
            <h2 className="font-semibold text-xl mb-3 text-gray-100">
              Select Pages to Delete ({selected.length} selected)
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Click on the page numbers you wish to remove. Selected pages
              will be highlighted in red.
            </p>

            <div className="mb-4">
              <Label
                htmlFor="page-range"
                className="block text-sm font-medium text-gray-300 mb-2"
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
                  className="flex-grow bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                  disabled={isProcessing}
                />
                <Button
                  onClick={applyPageRange}
                  variant="default"
                  className="px-4 py-2"
                  disabled={isProcessing || !pageRangeInput.trim()}
                >
                  Apply
                </Button>
              </div>
              {pageRangeError && (
                <p className="text-red-400 text-sm mt-2">
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
                    onClick={() => togglePage(i)}
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
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
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
          <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="w-full text-center space-y-4 text-gray-100">
              <h3 className="text-2xl font-semibold flex items-center justify-center text-green-400">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Pages Deleted Successfully
              </h3>
              <p className="text-gray-400">
                {selected.length} page(s) have been removed from your document.
              </p>
            </div>

            <div className="flex justify-center">
              <Button asChild variant="success" size="lg" className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl">
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
    </StandardToolLayout>
  );
}