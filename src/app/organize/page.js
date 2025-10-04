"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

import { PDFDocument } from "pdf-lib";
import { loadPdfJs } from "@/lib/pdfjsWorker";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button"; // Use named import
import { Alert } from "@/components/ui/alert";
import ToolPageLayout from "@/components/ui/ToolPageLayout";

export default function OrganizePage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  // pageOrder stores the 0-based indices of pages in their current display order
  const [pageOrder, setPageOrder] = useState([]);
  const [numPages, setNumPages] = useState(0);
  // selected stores the 0-based indices of pages marked for exclusion/removal
  const [selected, setSelected] = useState([]);
  const [organizedPdfUrl, setOrganizedPdfUrl] = useState(null); // New state for the result PDF URL
  const [downloadFileName, setDownloadFileName] = useState(""); // New state for download filename

  // pdf.js document proxy for rendering thumbnails
  const [pdfDocProxy, setPdfDocProxy] = useState(null);
  const renderTaskRefs = useRef({}); // Store render tasks for each canvas to allow cancellation

  // New ref to store direct references to canvas DOM nodes
  const canvasRefs = useRef({});

  // Drag and Drop state
  const dragItem = useRef(null); // Index of the currently dragged item (pageOrder index)
  const dragOverItem = useRef(null); // Index of the item being dragged over (pageOrder index)

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
      // Revoke object URL to prevent memory leaks
      try {
        if (organizedPdfUrl && typeof URL !== 'undefined' && !String(organizedPdfUrl).startsWith('data:')) {
          try { if (organizedPdfUrl && typeof URL !== 'undefined' && !String(organizedPdfUrl).startsWith('data:')) URL.revokeObjectURL(organizedPdfUrl); } catch {}
        }
      } catch { /* ignore */ }
    };
  }, [pdfDocProxy, organizedPdfUrl]);

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
    setSelected([]); // Reset selected pages

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
      
      // Dynamically load pdfjs and configure worker
      const pdfjs = await loadPdfJs();
      
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise; // Load PDF with pdfjs-dist
      setPdfDocProxy(pdf); // Store the PDFDocumentProxy

      const count = pdf.numPages;
      setNumPages(count);
      // Initialize pageOrder with 0-based indices
      setPageOrder(Array.from({ length: count }, (_, i) => i));
      setSelected([]); // Ensure selection is reset for new file
    } catch (e) {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      console.error("PDF loading error:", e);
      setFiles([]); // Clear files on error
    }
  };

  // Simple movePage for up/down buttons (alternative to drag-and-drop)
  const movePage = (from, to) => {
    if (to < 0 || to >= pageOrder.length) return;
    const newOrder = [...pageOrder];
    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, moved);
    setPageOrder(newOrder);
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
    // Highlight the item being dragged over (optional)
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

    dragItem.current = null; // Reset
    dragOverItem.current = null; // Reset
  }, [pageOrder]);

  const handleDragEnd = useCallback((e) => {
    // Remove the opacity class from the dragged item
    e.currentTarget.classList.remove("opacity-50");
    dragItem.current = null;
    dragOverItem.current = null;
  }, []);

  const togglePage = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleOrganize = async () => {
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

      // Iterate through the current pageOrder
      for (const originalPageIndex of pageOrder) {
        // Only include pages that are NOT in the 'selected' (removed) list
        if (!selected.includes(originalPageIndex)) {
          // Copy the page from the source document to the new document
          const [copiedPage] = await newDoc.copyPages(srcDoc, [
            originalPageIndex,
          ]);
          newDoc.addPage(copiedPage);
        }
      }

      // Check if any pages remain after organization
      if (newDoc.getPageCount() === 0) {
        setError(
          "No pages remaining after organization. Please ensure you have kept at least one page."
        );
        setIsProcessing(false);
        return;
      }

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      let url = null;
      try { if (typeof URL !== 'undefined') url = URL.createObjectURL(blob); } catch (err) { console.error('Error creating object URL for organized PDF:', err); url = null; }

      // Revoke previous URL if any and set the new one
      setOrganizedPdfUrl((prev) => {
        try {
          if (prev && typeof URL !== 'undefined' && !String(prev).startsWith('data:')) {
            try { if (prev && typeof URL !== 'undefined' && !String(prev).startsWith('data:')) URL.revokeObjectURL(prev); } catch {}
          }
        } catch { /* ignore */ }
        return url;
      });

  const safeBase = files[0]?.name ? String(files[0].name).replace(/\.pdf$/i, '').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '') : 'document';
  setDownloadFileName(url ? `organized_${safeBase}.pdf` : `organized_document.pdf`);

      setError(""); // Clear error on success
    } catch (e) {
      setError("Failed to organize PDF. Please try again.");
      console.error("Organize PDF error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Organize PDF"
      subtitle="Reorder, remove, and arrange pages in your PDF document with a simple drag-and-drop interface."
      toolName="Organize PDF"
      toolDescription="Reorder, delete, and rotate pages in your PDF files with our free online tool. Organize your PDFs exactly the way you want."
      steps={[
        "Upload your PDF file by dragging it into the dropzone or clicking to select a file.",
        "Drag and drop the pages to reorder them.",
        "Click on a page to rotate it or delete it.",
        "Click the \"Organize PDF\" button to apply the changes.",
        "Download your organized PDF file.",
      ]}
      faqs={[
        {
          question: "Is it free to organize PDF files?",
          answer:
            "Yes, our tool is completely free to use. You can organize as many PDF files as you like without any hidden costs.",
        },
        {
          question: "Is my data secure?",
          answer:
            "We prioritize your privacy and security. All files are processed on the client-side, meaning your files are never uploaded to our servers.",
        },
        {
          question: "Can I rotate pages in my PDF?",
          answer:
            "Yes, you can rotate pages in your PDF by clicking on them. Each click will rotate the page 90 degrees clockwise.",
        },
      ]}
      currentTool="organize"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Organize PDF', href: '/organize' }
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
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-950 shadow-inner border border-gray-200 dark:border-gray-700 space-y-4">
            <h2 className="font-semibold text-xl mb-3">
              Page Order & Selection
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop pages to reorder them. Click &quot;Exclude&quot;
              to remove pages from the final PDF.
            </p>
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[500px] p-2 custom-scrollbar"
              aria-label="Page order and selection list"
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
                  className={`relative flex flex-col items-center p-2 border group
                              ${
                                selected.includes(originalPageIndex)
                                  ? "border-destructive bg-red-100 opacity-70"
                                  : "border-gray-300 bg-white"
                              }
                              hover:border-gray-600 transition-all duration-200 cursor-grab
                              ${
                                dragItem.current === displayIndex
                                  ? "shadow-lg opacity-50 border-gray-600"
                                  : ""
                              }
                              ${
                                dragOverItem.current === displayIndex &&
                                dragItem.current !== displayIndex
                                  ? "border-gray-600 shadow-md scale-105"
                                  : ""
                              }
                            `}
                  // Add aria attributes for accessibility of drag-and-drop
                  aria-grabbed={
                    dragItem.current === displayIndex ? "true" : "false"
                  }
                  aria-dropeffect="move"
                >
                  <span
                    className={`text-sm font-medium mb-2 ${
                      selected.includes(originalPageIndex)
                        ? "line-through"
                        : ""
                    }`}
                  >
                    Page {originalPageIndex + 1}
                  </span>
                  <canvas
                    ref={(node) => {
                      // Store the canvas node reference
                      canvasRefs.current[originalPageIndex] = node;
                    }}
                    className="w-full h-auto max-w-[150px] border border-gray-300 bg-white" // Fixed width for thumbnail consistency
                  ></canvas>

                  <div className="flex gap-1 mt-2">
                    <Button
                      size="sm"
                      variant={
                        selected.includes(originalPageIndex)
                          ? "destructive"
                          : "secondary"
                      }
                      onClick={() => togglePage(originalPageIndex)}
                      aria-label={
                        selected.includes(originalPageIndex)
                          ? `Re-include page ${originalPageIndex + 1}`
                          : `Exclude page ${originalPageIndex + 1}`
                      }
                      className="w-auto flex-1"
                    >
                      {selected.includes(originalPageIndex)
                        ? "Include"
                        : "Exclude"}
                    </Button>
                  </div>
                  {/* Optional: Add small arrows for accessibility/alternative reorder for non-drag users */}
                  <div className="absolute top-1 right-1 flex flex-col gap-0.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="xs" // Smaller size for these buttons
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        movePage(displayIndex, displayIndex - 1);
                      }}
                      disabled={displayIndex === 0}
                      aria-label={`Move page ${originalPageIndex + 1} up`}
                      className="p-1 h-auto"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 4l-8 8h6v8h4v-8h6z" />
                      </svg>
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        movePage(displayIndex, displayIndex + 1);
                      }}
                      disabled={displayIndex === pageOrder.length - 1}
                      aria-label={`Move page ${originalPageIndex + 1} down`}
                      className="p-1 h-auto"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 20l8-8h-6V4h-4v8H4z" />
                      </svg>
                    </Button>
                  </div>
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
          onClick={handleOrganize}
          disabled={
            isProcessing ||
            numPages === 0 ||
            (numPages > 0 && selected.length === numPages)
          } // Disable if all pages are removed
          aria-label="Organize pages"
        >
          {isProcessing ? "Processing..." : "Organize Pages"}
        </Button>

        {organizedPdfUrl && !isProcessing && (
          <div className="flex flex-col gap-6 p-6 bg-gray-100 dark:bg-gray-950 shadow-lg border border-gray-200 dark:border-gray-700 mt-6">
            <div className="w-full text-center space-y-4">
              <h3 className="text-2xl font-semibold flex items-center justify-center">
                Pages Organized Successfully
              </h3>
              <p className="text-gray-500">
                Your PDF has been organized with the selected pages removed.
              </p>
            </div>

            <div className="flex justify-center">
              <Button asChild variant="success" size="lg">
                <a
                  href={organizedPdfUrl}
                  download={downloadFileName}
                  className="text-center"
                  onClick={() => {
                    const u = organizedPdfUrl;
                    setTimeout(() => { try { if (u && typeof URL !== 'undefined' && !String(u).startsWith('data:')) URL.revokeObjectURL(u); } catch { } }, 500);
                  }}
                >
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download Organized PDF
                  </span>
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}