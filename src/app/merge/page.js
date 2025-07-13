"use client";



import React, { useState, useRef, useEffect, useCallback } from "react";


import { PDFDocument } from "pdf-lib";
import * as pdfjs from "pdfjs-dist"; // Import pdfjs-dist for preview
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; // For merging progress (optional, but good practice)
import ToolPageContent from "@/components/ui/ToolPageContent";

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

  /**
   * Handles the start of a drag operation.
   * @param {DragEvent} e - The drag event.
   * @param {number} index - The index of the item being dragged.
   */
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
  };

  /**
   * Handles when a dragged item enters a drop zone.
   * @param {DragEvent} e - The drag event.
   * @param {number} index - The index of the drop zone.
   */
  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  /**
   * Handles the drag over event to allow dropping.
   * @param {DragEvent} e - The drag event.
   */
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  /**
   * Handles the drop event to reorder files.
   * @param {DragEvent} e - The drag event.
   */
  const handleDrop = (e) => {
    e.preventDefault();
    const dragItemIndex = dragItem.current;
    const dragOverItemIndex = dragOverItem.current;

    if (dragItemIndex !== null && dragOverItemIndex !== null) {
      setFiles((prevFiles) => {
        const draggedItem = prevFiles[dragItemIndex];
        const newFiles = [...prevFiles];
        newFiles.splice(dragItemIndex, 1);
        newFiles.splice(dragOverItemIndex, 0, draggedItem);
        return newFiles;
      });
    }

    dragItem.current = null;
    dragOverItem.current = null;
  };

  /**
   * Handles the end of a drag operation.
   */
  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
  };

  /**
   * Handles the drag leave event.
   */
  const handleDragLeave = () => {
    // Optionally, you can add visual feedback here
  };

  /**
   * Merges the uploaded PDF files into a single PDF.
   */
  const mergePDFs = async () => {
    if (files.length === 0) {
      setError("Please upload at least one PDF file.");
      return;
    }

    setIsMerging(true);
    setError("");
    setProgress(0);

    try {
      const mergedPdf = await PDFDocument.create();
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));

        // Update progress
        setProgress(Math.round(((i + 1) / totalFiles) * 90)); // Reserve 10% for final processing
      }

      setProgress(95); // Almost done

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setMergedPdfUrl(url);
      setProgress(100);

      // Load the merged PDF for preview using pdfjs
      try {
        const pdfDoc = await pdfjs.getDocument(url).promise;
        setMergedPdfDocProxy(pdfDoc);
      } catch (previewError) {
        console.error("Error loading merged PDF for preview:", previewError);
        // Don't set error here, as the merge was successful
      }
    } catch (error) {
      console.error("Error merging PDFs:", error);
      setError("Failed to merge PDFs. Please try again.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-12 md:py-20 px-4">
        <div className="max-w-4xl w-full">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Merge PDFs
          </h1>
          <p className="mb-8 text-lg text-gray-300 text-center">
            Combine multiple PDF files into one seamless document. Drag and drop to arrange their order.
          </p>

          <div className="space-y-6">
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

            {mergedPdfUrl && !isMerging && (
              <div className="flex flex-col gap-4 border-t border-gray-700 pt-6">
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
              </div>
            )}
          </div>
        </div>
      </div>
      <ToolPageContent
        toolName="Merge PDFs"
        toolDescription="Effortlessly combine multiple PDF files into a single, organized document with our easy-to-use PDF merger. Whether you're assembling a report, archiving documents, or preparing a presentation, our tool simplifies the process. Drag and drop your files, reorder them as needed, and merge them in seconds—all for free and right in your browser."
        currentTool="merge"
        steps={[
          "Upload your PDF files by dragging them into the dropzone or by clicking to select them from your device.",
          "Once uploaded, you can see a list of your files. Drag and drop the files to arrange them in the desired order for the final document.",
          "Click the 'Merge PDFs' button. Our tool will instantly combine all the uploaded files into a single PDF.",
          "A preview of the merged PDF will appear. You can then download the final, merged PDF to your device.",
        ]}
      />
    </>
  );
}