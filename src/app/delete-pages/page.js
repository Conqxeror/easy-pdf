"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import MetaHead from "@/components/ui/MetaHead";
import { Input } from "@/components/ui/input"; // Import Input component
import { Label } from "@/components/ui/label"; // Import Label component

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"; // Import Card components

export default function DeletePagesPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [numPages, setNumPages] = useState(0);
  // 'selected' stores the indices of pages the user WANTS TO DELETE.
  const [selected, setSelected] = useState([]);
  const [pageRangeInput, setPageRangeInput] = useState(""); // New state for page range input
  const [pageRangeError, setPageRangeError] = useState(""); // New state for page range error

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

      // Create a temporary anchor element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = "deleted-pages.pdf"; // Suggest a filename for the download

      // Append the link to the document body, click it, and then remove it
      // This is necessary to trigger downloads in some browsers/environments
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke the object URL to free up memory
      URL.revokeObjectURL(url);

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

  return (
    <>
      <MetaHead
        title="Delete PDF Pages Online – Easy PDF Tool"
        description="Delete pages from your PDF, 100% client-side. Fast, secure, and privacy-first PDF page remover."
      />
      <main className="flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
        {" "}
        {/* Added flex utilities and standard responsive padding */}
        <Card className="bg-gray-800 border-gray-700 w-full max-w-4xl">
          {" "}
          {/* Removed mx-auto, ensured w-full and max-w-4xl */}
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              Delete PDF Pages
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Effortlessly remove specific pages from your PDF documents
              directly in your browser. Your files stay private.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* FileDropzone component for PDF upload */}
            <FileDropzone
              accept="application/pdf"
              multiple={false} // Only allow single file upload
              onFiles={handleFiles} // Callback for file selection
              error={error} // Pass current error state
              setError={setError} // Pass setter for error state
              label="Upload PDF"
              description="Drag & drop or click to select a PDF file (Max 50MB)"
              maxSize={50 * 1024 * 1024} // Example: 50MB max file size
              isLoading={isProcessing} // Show loading state in dropzone if processing
            />

            {/* Section to display page selection buttons once a PDF is loaded */}
            {numPages > 0 && (
              <div className="my-4 p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
                <h2 className="font-semibold text-xl mb-3 text-gray-100">
                  Select Pages to Delete ({selected.length} selected)
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Click on the page numbers you wish to remove. Selected pages
                  will be highlighted in red.
                </p>

                {/* Page Range Input */}
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
                      variant="default" // Changed to default for blue color
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
                  className="flex flex-wrap gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar" // Added custom-scrollbar for styling overflow
                  aria-label="Select pages to delete"
                  // Adding data-test attributes for easier testing if needed
                  data-test-id="page-selection-list"
                >
                  {/* Generate a button for each page in the PDF */}
                  {Array.from({ length: numPages }, (_, i) => (
                    <li key={i}>
                      <Button
                        size="sm"
                        // Change variant based on whether the page is selected for deletion
                        // Use "success" for green unselected buttons
                        variant={
                          selected.includes(i) ? "destructive" : "success"
                        }
                        aria-label={`Toggle delete for page ${i + 1}`}
                        onClick={() => togglePage(i)}
                        // Removed fixed width and explicit background color as variants handle styling
                        className="w-20"
                      >
                        Page {i + 1}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Display error messages */}
            {error && (
              <Alert variant="destructive" className="mt-4">
                {error}
              </Alert>
            )}

            {/* Button to trigger the deletion process */}
            <Button
              className="mt-6 w-full max-w-xs mx-auto block bg-blue-700 text-white"
              onClick={handleDelete}
              // Disable button if processing, no PDF loaded, or no pages selected for deletion
              disabled={isProcessing || numPages === 0 || selected.length === 0}
              aria-label="Download PDF with pages deleted"
              data-test-id="delete-pages-button"
            >
              {isProcessing ? "Processing..." : "Download PDF (Pages Deleted)"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
