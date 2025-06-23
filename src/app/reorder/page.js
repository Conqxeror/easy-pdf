"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button"; // Use named import
import { Alert } from "@/components/ui/alert";
import MetaHead from "@/components/ui/MetaHead";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// Import pdfjs-dist for PDF rendering
import * as pdfjs from "pdfjs-dist";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function ReorderPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  // pageOrder stores the 0-based indices of pages in their current display order
  const [pageOrder, setPageOrder] = useState([]);
  const [numPages, setNumPages] = useState(0);

  // pdf.js document proxy for rendering thumbnails
  const [pdfDocProxy, setPdfDocProxy] = useState(null);
  const renderTaskRefs = useRef({}); // Store render tasks for each canvas to allow cancellation

  // Ref to store direct references to canvas DOM nodes, indexed by originalPageIndex
  const canvasRefs = useRef({});

  // Drag and Drop state
  const dragItem = useRef(null); // Index of the currently dragged item (pageOrder array index)
  const dragOverItem = useRef(null); // Index of the item being dragged over (pageOrder array index)

  // Cleanup function for pdf.js document and render tasks
  useEffect(() => {
    return () => {
      if (pdfDocProxy) {
        pdfDocProxy.destroy();
      }
      // Cancel any ongoing render tasks
      Object.values(renderTaskRefs.current).forEach((task) => {
        if (task) task.cancel();
      });
      renderTaskRefs.current = {};
    };
  }, [pdfDocProxy]);

  // Function to render a specific PDF page thumbnail to a canvas
  // This useCallback depends only on pdfDocProxy because the canvas node is passed directly.
  const renderPageThumbnail = useCallback(
    async (canvas, pageIndexInPdf) => {
      if (!canvas || !pdfDocProxy) {
        return;
      }

      const context = canvas.getContext("2d");
      // Cancel any previous render task for this specific canvas
      if (renderTaskRefs.current[pageIndexInPdf]) {
        renderTaskRefs.current[pageIndexInPdf].cancel();
      }

      try {
        const page = await pdfDocProxy.getPage(pageIndexInPdf + 1); // pdf.js pages are 1-based
        const viewport = page.getViewport({ scale: 1 });

        const desiredWidth = 150; // Thumbnail width
        const scale = desiredWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale: scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing
        // Store and await the render task
        renderTaskRefs.current[pageIndexInPdf] = page.render(renderContext);
        await renderTaskRefs.current[pageIndexInPdf].promise;
        renderTaskRefs.current[pageIndexInPdf] = null; // Clear task after completion
      } catch (e) {
        if (e.name === "RenderingCancelledException") {
          // This is normal when dragging quickly, can ignore
          // console.log(`Rendering cancelled for page ${pageIndexInPdf + 1}`);
        } else {
          console.error(`Error rendering page ${pageIndexInPdf + 1}:`, e);
          // Optionally draw an error message or blank on the canvas
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = "#ff0000"; // Red color
          context.font = "12px Arial";
          context.fillText("Error", 10, 20);
        }
      }
    },
    [pdfDocProxy]
  ); // Only depends on pdfDocProxy

  // New useEffect to trigger rendering of all visible page thumbnails
  useEffect(() => {
    // Iterate over the current pageOrder to render thumbnails
    pageOrder.forEach((originalPageIndex) => {
      const canvas = canvasRefs.current[originalPageIndex];
      if (canvas && pdfDocProxy) {
        renderPageThumbnail(canvas, originalPageIndex);
      }
    });
  }, [pageOrder, pdfDocProxy, renderPageThumbnail]); // Re-run when order or pdfDocProxy changes

  // Load PDF and set page order
  const handleFiles = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    setNumPages(0); // Reset page count
    setPageOrder([]); // Reset page order

    if (pdfDocProxy) {
      // Destroy previous PDF if exists
      pdfDocProxy.destroy();
      setPdfDocProxy(null);
    }
    // Clear all render task refs
    Object.values(renderTaskRefs.current).forEach((task) => {
      if (task) task.cancel();
    });
    renderTaskRefs.current = {};
    canvasRefs.current = {}; // Clear canvas refs for new file

    if (newFiles.length === 0) return;

    try {
      const file = newFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise; // Load PDF with pdfjs-dist
      setPdfDocProxy(pdf); // Store the PDFDocumentProxy

      const count = pdf.numPages;
      setNumPages(count);
      // Initialize pageOrder with 0-based indices
      setPageOrder(Array.from({ length: count }, (_, i) => i));
    } catch (e) {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      console.error("PDF loading error:", e);
      setFiles([]); // Clear files on error
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = useCallback((e, position) => {
    dragItem.current = position;
    e.dataTransfer.effectAllowed = "move"; // Indicate move operation
    // Add a class for visual feedback (e.g., opacity)
    e.currentTarget.classList.add("opacity-50");
  }, []);

  const handleDragEnter = useCallback((e, position) => {
    dragOverItem.current = position;
    // Add a class for visual feedback (e.g., border for drop target)
    e.currentTarget.classList.add("border-blue-500", "scale-105");
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault(); // Crucial to allow a drop
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(() => {
    const fromIndex = dragItem.current;
    const toIndex = dragOverItem.current;

    if (fromIndex === null || toIndex === null || fromIndex === toIndex) {
      // No valid drag operation
      return;
    }

    const newOrder = [...pageOrder];
    const [movedPageIdx] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedPageIdx);
    setPageOrder(newOrder);

    // Reset refs after drop
    dragItem.current = null;
    dragOverItem.current = null;
  }, [pageOrder]);

  const handleDragLeave = useCallback((e) => {
    // Remove highlight from item being dragged over
    e.currentTarget.classList.remove("border-blue-500", "scale-105");
  }, []);

  const handleDragEnd = useCallback(
    (e) => {
      // Remove the opacity class from the dragged item
      e.currentTarget.classList.remove("opacity-50");
      // Also remove highlight from any potential dragOverItem
      if (
        dragOverItem.current !== null &&
        canvasRefs.current[pageOrder[dragOverItem.current]] &&
        canvasRefs.current[pageOrder[dragOverItem.current]].parentNode
      ) {
        canvasRefs.current[
          pageOrder[dragOverItem.current]
        ].parentNode.classList.remove("border-blue-500", "scale-105");
      }
      dragItem.current = null;
      dragOverItem.current = null;
    },
    [pageOrder]
  );

  const handleReorder = async () => {
    if (files.length === 0) {
      setError("Please upload a PDF file.");
      return;
    }
    setIsProcessing(true);
    setError(""); // Clear previous errors

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer); // Load original PDF
      const newDoc = await PDFDocument.create(); // Create new PDF

      // Iterate through the current pageOrder to copy pages in the new sequence
      for (const originalPageIndex of pageOrder) {
        const [copiedPage] = await newDoc.copyPages(srcDoc, [
          originalPageIndex,
        ]);
        newDoc.addPage(copiedPage);
      }

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reordered_${files[0].name || "document"}.pdf`;
      document.body.appendChild(link); // Append link to body before clicking
      link.click();
      document.body.removeChild(link); // Remove link after clicking
      URL.revokeObjectURL(url); // Revoke the object URL to release memory

      setError(""); // Clear error on success
    } catch (e) {
      setError("Failed to reorder PDF. Please try again.");
      console.error("Reorder PDF error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <MetaHead
        title="Reorder PDF Pages Online – Easy PDF Tool"
        description="Reorder pages in your PDF, 100% client-side. Fast, secure, and privacy-first PDF page organizer."
      />

      <main className="flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
        <Card className="bg-gray-800 border-gray-700 w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              Reorder PDF Pages
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Visually reorder pages in your PDF document using drag-and-drop.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
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
              <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700 space-y-4">
                <h2 className="font-semibold text-xl mb-3 text-gray-100">
                  Page Order
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Drag and drop page thumbnails to change their order.
                </p>
                <ul
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[500px] p-2 custom-scrollbar"
                  aria-label="Page order list"
                >
                  {pageOrder.map((originalPageIndex, displayIndex) => (
                    <li
                      key={originalPageIndex} // Use originalPageIndex as key for stable identity
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, displayIndex)}
                      onDragEnter={(e) => handleDragEnter(e, displayIndex)}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      onDragLeave={handleDragLeave} // Added drag leave handler
                      className={`relative flex flex-col items-center p-2 border rounded-md group
                                  border-gray-600 bg-gray-700
                                  hover:border-blue-500 transition-all duration-200 cursor-grab
                                  ${
                                    dragItem.current === displayIndex
                                      ? "shadow-lg opacity-50 border-blue-500"
                                      : ""
                                  }
                                `}
                      // ARIA attributes for drag and drop
                      aria-grabbed={
                        dragItem.current === displayIndex ? "true" : "false"
                      }
                      aria-dropeffect="move"
                    >
                      <span className="text-sm font-medium mb-2 text-gray-100">
                        Page {originalPageIndex + 1}
                      </span>
                      <canvas
                        ref={(node) => {
                          // Store the canvas node reference
                          canvasRefs.current[originalPageIndex] = node;
                        }}
                        className="w-full h-auto max-w-[150px] border border-gray-600 rounded-sm bg-white" // Fixed width for thumbnail consistency
                      ></canvas>
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

            <Button
              variant="success"
              className="mt-4 w-full max-w-xs mx-auto block"
              onClick={handleReorder}
              disabled={isProcessing || numPages === 0}
              aria-label="Download reordered PDF"
            >
              {isProcessing ? "Processing..." : "Download Reordered PDF"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
