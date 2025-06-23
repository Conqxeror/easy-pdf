"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjs from "pdfjs-dist"; // Import pdfjs-dist for preview
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import MetaHead from "@/components/ui/MetaHead";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // For merging progress (optional, but good practice)

// Configure pdfjs worker to run from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function MergePDFs() {
  // State to hold the uploaded files
  const [files, setFiles] = useState([]);
  // State to hold the URL of the merged PDF for download
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  // State for displaying errors
  const [error, setError] = useState("");
  // State to indicate if merging is in progress
  const [isMerging, setIsMerging] = useState(false);
  // State for merging progress
  const [progress, setProgress] = useState(0);

  // Refs for drag and drop functionality
  const dragItem = useRef(null); // Index of the currently dragged item in the `files` array
  const dragOverItem = useRef(null); // Index of the item being dragged over in the `files` array

  // Refs and state for PDF preview
  const mergedPdfPreviewCanvasRef = useRef(null);
  const [mergedPdfDocProxy, setMergedPdfDocProxy] = useState(null); // pdf.js document proxy for the merged PDF
  const renderTaskRef = useRef(null); // To manage pdf.js render tasks for the preview

  // Cleanup function for mergedPdfUrl and mergedPdfDocProxy
  useEffect(() => {
    return () => {
      if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
      }
      if (mergedPdfDocProxy) {
        mergedPdfDocProxy.destroy();
      }
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [mergedPdfUrl, mergedPdfDocProxy]);

  // Function to render the first page of the merged PDF to the preview canvas
  const renderMergedPdfPreview = useCallback(async () => {
    const canvas = mergedPdfPreviewCanvasRef.current;
    if (!canvas || !mergedPdfDocProxy) {
      if (canvas) {
        // Clear canvas if no PDF or invalid proxy
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.height = 0; // Collapse canvas height
      }
      return;
    }

    // Cancel any ongoing render task
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    const context = canvas.getContext("2d");
    try {
      const page = await mergedPdfDocProxy.getPage(1); // Get the first page for preview
      const viewport = page.getViewport({ scale: 1 });

      const desiredWidth = 800; // Fixed width for preview
      const scale = desiredWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale: scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };

      context.clearRect(0, 0, canvas.width, canvas.height);

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;
    } catch (e) {
      if (e.name === "RenderingCancelledException") {
        console.log("PDF rendering cancelled during preview:", e);
      } else {
        console.error("Error rendering PDF preview:", e);
        setError("Failed to render PDF preview.");
      }
    }
  }, [mergedPdfDocProxy]);

  // Effect to trigger PDF preview render when mergedPdfDocProxy changes
  useEffect(() => {
    renderMergedPdfPreview();
  }, [renderMergedPdfPreview]);

  /**
   * Handles file selection from the dropzone.
   * Adds new files to the existing list.
   * @param {File[]} newFiles - An array of newly selected files.
   */
  const handleFiles = (newFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setError("");
    setMergedPdfUrl(null); // Clear previous merged PDF on new file upload
    if (mergedPdfDocProxy) {
      mergedPdfDocProxy.destroy(); // Destroy old proxy
      setMergedPdfDocProxy(null);
    }
    setProgress(0);
  };

  /**
   * Removes a file from the list of selected files.
   * @param {number} indexToRemove - The index of the file to remove.
   */
  const removeFile = useCallback(
    (indexToRemove) => {
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== indexToRemove));
      setMergedPdfUrl(null); // Clear merged PDF if file list changes
      if (mergedPdfDocProxy) {
        mergedPdfDocProxy.destroy();
        setMergedPdfDocProxy(null);
      }
      setProgress(0);
    },
    [mergedPdfDocProxy]
  );

  // Drag and Drop Handlers
  const handleDragStart = useCallback((e, position) => {
    dragItem.current = position;
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("opacity-50"); // Visual feedback for dragged item
  }, []);

  const handleDragEnter = useCallback((e, position) => {
    dragOverItem.current = position;
    e.currentTarget.classList.add("border-blue-500", "scale-105"); // Visual feedback for drop target
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault(); // Crucial to allow drop
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(() => {
    const fromIndex = dragItem.current;
    const toIndex = dragOverItem.current;

    if (fromIndex === null || toIndex === null || fromIndex === toIndex) {
      return; // No valid drag operation
    }

    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      const [movedFile] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);
      return newFiles;
    });

    // Reset refs after drop
    dragItem.current = null;
    dragOverItem.current = null;
    setMergedPdfUrl(null); // Clear merged PDF on reorder
    if (mergedPdfDocProxy) {
      mergedPdfDocProxy.destroy();
      setMergedPdfDocProxy(null);
    }
    setProgress(0);
  }, [mergedPdfDocProxy]);

  const handleDragLeave = useCallback((e) => {
    e.currentTarget.classList.remove("border-blue-500", "scale-105"); // Remove highlight
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.currentTarget.classList.remove("opacity-50"); // Remove opacity from dragged item
    // Ensure all hover effects are cleared
    const allListItems = document.querySelectorAll(".file-item"); // Assuming a class 'file-item' on your li's
    allListItems.forEach((item) => {
      item.classList.remove("border-blue-500", "scale-105");
    });
    dragItem.current = null;
    dragOverItem.current = null;
  }, []);

  /**
   * Merges the uploaded PDF files into a single PDF document.
   */
  const mergePDFs = async () => {
    setError("");
    if (files.length === 0) {
      setError("Please upload at least one PDF file.");
      return;
    }
    if (files.length === 1) {
      setError("Please upload more than one PDF file to merge.");
      return;
    }

    setIsMerging(true);
    setProgress(0); // Start progress from 0

    try {
      const pdfDoc = await PDFDocument.create();
      let filesProcessed = 0;

      for (const file of files) {
        let existingPdf;
        try {
          const arrayBuffer = await file.arrayBuffer();
          existingPdf = await PDFDocument.load(arrayBuffer);
        } catch (e) {
          setError(
            `File '${file.name}' is not a valid or supported PDF. Skipping this file.`
          );
          console.error(`Failed to load PDF '${file.name}':`, e);
          // Continue to next file instead of aborting all
          filesProcessed++;
          setProgress(Math.round((filesProcessed / files.length) * 100));
          continue;
        }

        const copiedPages = await pdfDoc.copyPages(
          existingPdf,
          existingPdf.getPageIndices()
        );
        copiedPages.forEach((page) => pdfDoc.addPage(page));

        filesProcessed++;
        setProgress(Math.round((filesProcessed / files.length) * 90)); // 90% for page copying
      }

      if (pdfDoc.getPageCount() === 0) {
        setError(
          "No valid PDF pages were merged. Please check your uploaded files."
        );
        setIsMerging(false);
        return;
      }

      const mergedPdfBytes = await pdfDoc.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url); // Corrected from setMergedPDF(url)

      // Load the generated PDF into pdf.js for preview
      const loadingTask = pdfjs.getDocument({ data: mergedPdfBytes });
      const pdf = await loadingTask.promise;
      setMergedPdfDocProxy(pdf); // This will trigger renderMergedPdfPreview via useEffect

      setProgress(100); // Final progress
    } catch (e) {
      setError("An error occurred while merging PDFs. Please try again.");
      console.error("Merging error:", e);
      setMergedPdfUrl(null); // Corrected from setMergedPDF(null)
      setMergedPdfDocProxy(null);
    } finally {
      setIsMerging(false);
      setTimeout(() => setProgress(0), 1000); // Reset progress after a short delay
    }
  };

  return (
    <>
      <MetaHead
        title="Merge PDF Files Online – Easy PDF Tool"
        description="Merge multiple PDF files into one, 100% client-side, privacy-first. Fast, free, and secure PDF merger for everyone."
      />
      <main className="flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        <Card className="bg-gray-800 border-gray-700 w-full">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              Merge PDFs
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Combine multiple PDF files into one seamless document. Drag and
              drop to arrange their order.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <FileDropzone
              accept="application/pdf"
              multiple
              onFiles={handleFiles}
              error={error}
              setError={setError}
              label="Choose PDF Files"
              description="Drag & drop or click to select PDF files. You can select multiple."
              maxSize={50 * 1024 * 1024} // Max 50MB per file
              isLoading={isMerging}
            />

            {files.length > 0 && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700 space-y-4">
                <h2 className="font-semibold text-xl mb-3 text-gray-100">
                  Files to Merge (Drag to Reorder)
                </h2>
                <ul
                  className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar"
                  aria-label="List of PDF files to merge"
                >
                  {files.map((file, index) => (
                    <li
                      key={file.name + file.lastModified} // Unique key based on name and lastModified
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      onDragLeave={handleDragLeave}
                      className={`file-item flex items-center justify-between p-3 rounded-md border-2 border-gray-600 bg-gray-700 text-gray-100 cursor-grab transition-all duration-200
                                  ${
                                    dragItem.current === index
                                      ? "opacity-50 shadow-lg"
                                      : ""
                                  }
                                  ${
                                    dragOverItem.current === index &&
                                    dragItem.current !== index
                                      ? "scale-105 border-blue-500"
                                      : ""
                                  }
                                `}
                      aria-grabbed={
                        dragItem.current === index ? "true" : "false"
                      }
                      aria-roledescription="Draggable file item"
                    >
                      <span>
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="ml-2 px-2 py-0.5"
                        onClick={() => removeFile(index)}
                        aria-label={`Remove ${file.name}`}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isMerging && (
              <div className="space-y-2">
                <Progress
                  value={progress}
                  className="h-2 bg-gray-600 [&::-webkit-progress-bar]:bg-gray-600 [&::-webkit-progress-value]:bg-blue-500"
                />
                <p className="text-sm text-center text-gray-400">
                  Merging PDFs... {progress}%
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                {error}
              </Alert>
            )}

            <Button
              onClick={mergePDFs}
              className="w-full max-w-xs mx-auto block"
              variant="success" // Consistent styling
              disabled={isMerging || files.length === 0}
              aria-label="Merge selected PDF files"
            >
              {isMerging ? "Merging..." : "Merge PDFs"}
            </Button>
          </CardContent>

          {mergedPdfUrl && !isMerging && (
            <CardFooter className="flex flex-col gap-4 border-t border-gray-700 pt-6">
              <div className="w-full text-center space-y-2 text-gray-100">
                <h3 className="text-xl font-semibold">Merged PDF Preview</h3>
                <div className="w-full flex justify-center items-center bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative">
                  <canvas
                    ref={mergedPdfPreviewCanvasRef}
                    className="max-w-full h-auto border border-gray-600 rounded-md shadow-lg"
                    style={{ maxWidth: "100%", height: "auto" }}
                    aria-label="Merged PDF preview"
                  ></canvas>
                </div>
              </div>

              <Button
                asChild
                variant="success"
                className="w-full max-w-xs mx-auto block"
              >
                <a
                  href={mergedPdfUrl}
                  download="merged.pdf"
                  className="text-center"
                >
                  Download Merged PDF
                </a>
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>
    </>
  );
}
