"use client";



import React, { useState, useRef, useEffect, useCallback } from "react";


import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Import pdfjs legacy build for PDF rendering
import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
// Configure pdfjs worker only on the client to avoid SSR/runtime errors
if (typeof window !== 'undefined' && pdfjs && pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

export default function PageNumbersPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [numberedPdfUrl, setNumberedPdfUrl] = useState(null); // New state for the result PDF URL
  const [downloadFileName, setDownloadFileName] = useState(""); // New state for download filename

  // User configurable options for page numbering/header/footer
  const [position, setPosition] = useState("bottom-center"); // 'bottom-center', 'top-right', etc.
  const [customText, setCustomText] = useState("Page {NUM} of {TOTAL}"); // '{NUM}', '{TOTAL}' placeholders
  const [startNumber, setStartNumber] = useState(1); // Starting page number for the counter
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState("#4a4a4a"); // Default dark gray
  const [applyToMode, setApplyToMode] = useState("all"); // 'all', 'single', 'range'
  const [singlePageIdx, setSinglePageIdx] = useState(0); // 0-based for single page
  const [rangeStart, setPageRangeStart] = useState(1); // 1-based for range start
  const [rangeEnd, setPageRangeEnd] = useState(1); // 1-based for range end
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("");

  // Preview related states and refs
  const previewCanvasRef = useRef(null);
  const [pdfDocProxy, setPdfDocProxy] = useState(null); // pdf.js document proxy
  const renderTaskRef = useRef(null); // To manage pdf.js render tasks

  // Helper to convert hex color to RGB object for pdf-lib
  const hexToRgb = (hex) => {
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    return rgb(r, g, b);
  };

  // Function to render the first page of the PDF to the preview canvas
  const renderPdfPreview = useCallback(async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !pdfDocProxy || numPages === 0) {
      if (canvas) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.height = 0; // Collapse canvas if no PDF
      }
      return;
    }

    // Cancel any ongoing render task
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch { /* ignore */ }
      renderTaskRef.current = null;
    }

    const context = canvas.getContext("2d");
    try {
      const pageNumForPreview =
        applyToMode === "single" && numPages > 0 ? singlePageIdx + 1 : 1;
      const page = await pdfDocProxy.getPage(pageNumForPreview);
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

      // Now, draw the text overlay on the preview canvas
      if (files.length > 0) {
        const previewPageIndex = pageNumForPreview - 1; // Convert back to 0-based for calculations
        viewport; // Original PDF page dimensions (not used in current implementation)

        context.font = `${fontSize * scale}px Helvetica`; // Scale font for preview
        context.fillStyle = textColor; // Use selected text color

        // Helper to calculate text dimensions on canvas
        const measureTextOnCanvas = (txt, fontPx) => {
          context.font = `${fontPx}px Helvetica`;
          return context.measureText(txt).width;
        };

        // Header Text
        if (headerText.trim()) {
          const headerScaledFontSize = fontSize * scale;
          const headerTextWidth = measureTextOnCanvas(
            headerText,
            headerScaledFontSize
          );
          const headerX = (canvas.width - headerTextWidth) / 2;
          const headerY = headerScaledFontSize + 15; // A bit from the top
          context.fillText(headerText, headerX, headerY);
        }

        // Footer Text (Page Numbering or custom)
        let footerTextToDraw = "";
        const currentPageForFooter = previewPageIndex + startNumber; // Account for start number offset
        const totalPagesForFooter = numPages; // Fixed: no selected.length here

        if (customText.includes("{NUM}") || customText.includes("{TOTAL}")) {
          footerTextToDraw = customText
            .replace("{NUM}", currentPageForFooter)
            .replace("{TOTAL}", totalPagesForFooter);
        } else if (footerText.trim()) {
          footerTextToDraw = footerText;
        } else {
          footerTextToDraw = `Page ${currentPageForFooter}`; // Fallback if no custom text or footer text
        }

        if (footerTextToDraw.trim()) {
          const footerScaledFontSize = fontSize * scale;
          const footerTextWidth = measureTextOnCanvas(
            footerTextToDraw,
            footerScaledFontSize
          );
          let textX, textY;

          const margin = 20 * scale; // Apply scaling to margin

          switch (position) {
            case "top-left":
              textX = margin;
              textY = margin + footerScaledFontSize;
              break;
            case "top-center":
              textX = (canvas.width - footerTextWidth) / 2;
              textY = margin + footerScaledFontSize;
              break;
            case "top-right":
              textX = canvas.width - footerTextWidth - margin;
              textY = margin + footerScaledFontSize;
              break;
            case "bottom-left":
              textX = margin;
              textY = canvas.height - margin;
              break;
            case "bottom-center":
              textX = (canvas.width - footerTextWidth) / 2;
              textY = canvas.height - margin;
              break;
            case "bottom-right":
              textX = canvas.width - footerTextWidth - margin;
              textY = canvas.height - margin;
              break;
            default: // Default to bottom-center
              textX = (canvas.width - footerTextWidth) / 2;
              textY = canvas.height - margin;
              break;
          }
          context.fillText(footerTextToDraw, textX, textY);
        }
      }
    } catch (e) {
      if (e.name === "RenderingCancelledException") {
        console.log("PDF rendering cancelled during preview:", e);
      } else {
        console.error("Error rendering PDF preview:", e);
        setError("Failed to render PDF preview.");
      }
    }
  }, [
    pdfDocProxy,
    numPages,
    applyToMode,
    singlePageIdx,
    customText,
    startNumber,
    fontSize,
    textColor,
    position,
    headerText,
    footerText,
    files.length,
  ]);

  // Effect to trigger preview render when relevant states change
  useEffect(() => {
    renderPdfPreview();
  }, [renderPdfPreview]); // Rely on useCallback's dependencies

  // Cleanup for pdfDocProxy
  useEffect(() => {
    return () => {
      if (pdfDocProxy) {
        try { pdfDocProxy.destroy(); } catch { /* ignore */ }
        setPdfDocProxy(null); // Ensure state is cleared
      }
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch { /* ignore */ }
        renderTaskRef.current = null;
      }
      // Revoke object URL to prevent memory leaks
      if (numberedPdfUrl) {
  try { if (numberedPdfUrl && typeof URL !== 'undefined' && !String(numberedPdfUrl).startsWith('data:')) URL.revokeObjectURL(numberedPdfUrl); } catch { /* ignore */ }
      }
    };
  }, [pdfDocProxy, numberedPdfUrl]);

  // Handle file upload
  const handleFiles = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    setNumPages(0);
    setStartNumber(1); // Reset start number
    setPageRangeStart(1); // Reset range
    setPageRangeEnd(1); // Reset range
    setSinglePageIdx(0); // Reset single page selection

    if (pdfDocProxy) {
      // Destroy previous PDF if exists
      try { pdfDocProxy.destroy(); } catch { /* ignore */ }
      setPdfDocProxy(null);
    }
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch { /* ignore */ }
      renderTaskRef.current = null;
    }

    if (newFiles.length === 0) {
      // Clear preview canvas if no files
      const canvas = previewCanvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.height = 0;
      }
      return;
    }

    try {
      const file = newFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setPdfDocProxy(pdf); // This will trigger preview render via useEffect
      setNumPages(pdf.numPages);
      setPageRangeEnd(pdf.numPages); // Set default end range to total pages
    } catch (e) {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      console.error("PDF loading error:", e);
      setFiles([]);
    }
  };

  // Main function to add numbers/header/footer and download
  const handleAddNumbers = async () => {
    if (files.length === 0) {
      setError("Please upload a PDF file.");
      return;
    }
    if (
      !headerText.trim() &&
      !footerText.trim() &&
      !customText.includes("{NUM}") &&
      !customText.includes("{TOTAL}")
    ) {
      setError(
        "Please enter text for header, footer, or configure page numbering."
      );
      return;
    }
    if (fontSize < 6 || fontSize > 72) {
      setError("Font size must be between 6 and 72.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      let pagesToApplyTo = [];
      if (applyToMode === "all") {
        pagesToApplyTo = pages;
      } else if (applyToMode === "single") {
        if (singlePageIdx < 0 || singlePageIdx >= pages.length) {
          setError("Selected single page is out of bounds.");
          setIsProcessing(false);
          return;
        }
        pagesToApplyTo = [pages[singlePageIdx]];
      } else if (applyToMode === "range") {
        const actualRangeStart = Math.max(
          1,
          Math.min(rangeStart, numPages)
        );
        const actualRangeEnd = Math.max(1, Math.min(rangeEnd, numPages));
        if (actualRangeStart > actualRangeEnd) {
          setError("Page range start cannot be greater than end.");
          setIsProcessing(false);
          return;
        }
        for (let i = actualRangeStart - 1; i < actualRangeEnd; i++) {
          pagesToApplyTo.push(pages[i]);
        }
      }

      pagesToApplyTo.forEach((page) => {
        // Removed originalIdx as it's not directly used for page content calculation
        const { width, height } = page.getSize();
        const currentPageNumber = pages.indexOf(page) + startNumber; // Current PDF page index + start offset
        const totalPagesCount = pages.length;

        const textColorRgb = hexToRgb(textColor);

        // Common text positioning logic
        const calculateTextPosition = (
          textToMeasure,
          currentFontSize,
          pageDim
        ) => {
          const textWidth = font.widthOfTextAtSize(
            textToMeasure,
            currentFontSize
          );
          let x, y;
          const margin = 20; // Default margin

          switch (position) {
            case "top-left":
              x = margin;
              y = pageDim.height - margin - currentFontSize;
              break;
            case "top-center":
              x = (pageDim.width - textWidth) / 2;
              y = pageDim.height - margin - currentFontSize;
              break;
            case "top-right":
              x = pageDim.width - textWidth - margin;
              y = pageDim.height - margin - currentFontSize;
              break;
            case "bottom-left":
              x = margin;
              y = margin;
              break;
            case "bottom-center":
              x = (pageDim.width - textWidth) / 2;
              y = margin;
              break;
            case "bottom-right":
              x = pageDim.width - textWidth - margin;
              y = margin;
              break;
            default: // Default to bottom-center
              x = (pageDim.width - textWidth) / 2;
              y = margin;
              break;
          }
          return { x, y };
        };

        // Draw Header
        if (headerText.trim()) {
          const { x, y } = calculateTextPosition(headerText, fontSize, {
            width,
            height: height + 40,
          }); // Adjust height slightly for top positioning
          page.drawText(headerText, {
            x,
            y,
            size: fontSize,
            font,
            color: textColorRgb,
          });
        }

        // Draw Footer / Page Number
        let footerTextContent = "";
        if (customText.trim()) {
          footerTextContent = customText
            .replace("{NUM}", currentPageNumber)
            .replace("{TOTAL}", totalPagesCount);
        } else if (footerText.trim()) {
          footerTextContent = footerText;
        }

        if (footerTextContent.trim()) {
          const { x, y } = calculateTextPosition(footerTextContent, fontSize, {
            width,
            height,
          });
          page.drawText(footerTextContent, {
            x,
            y,
            size: fontSize,
            font,
            color: textColorRgb,
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
  // Revoke previous numbered URL if present
  try { if (numberedPdfUrl && typeof URL !== 'undefined' && !String(numberedPdfUrl).startsWith('data:')) URL.revokeObjectURL(numberedPdfUrl); } catch { /* ignore */ }
  let url = null;
  try { if (typeof URL !== 'undefined') url = URL.createObjectURL(blob); } catch (err) { console.error('Error creating object URL for numbered PDF:', err); url = null; }
  setNumberedPdfUrl(url);
  const baseName = files && files[0] && files[0].name ? files[0].name.replace(/\.[^/.]+$/, "") : "document";
  setDownloadFileName(`numbered_${baseName}.pdf`);

      setError("");
    } catch (e) {
      setError("Failed to add page numbers/header/footer.");
      console.error("Page numbering error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Add Page Numbers, Header & Footer to PDF"
      subtitle="Add page numbers, headers, or footers to your PDF documents with our free online tool. Customize the text, position, and appearance."
      toolName="Add Page Numbers, Header & Footer to PDF"
      toolDescription="Add page numbers, headers, or footers to your PDF documents with our free online tool. Customize the text, position, and appearance."
      steps={[
        "Upload your PDF file by dragging it into the dropzone or clicking to select.",
        "Configure your additions: Choose to add a header, a footer, or dynamic page numbers. You can use placeholders like {NUM} for the current page and {TOTAL} for the total page count.",
        "Customize the appearance: Select font size, text color, and the position (e.g., top-left, bottom-center).",
        "Choose which pages to apply the changes to: all pages, a single page, or a specific page range.",
        "Click the 'Download PDF with Additions' button to process and save your document.",
      ]}
      faqs={[
        {
          question: "Is it free to add page numbers or headers/footers?",
          answer:
            "Yes, our tool is completely free to use. You can add page numbers, headers, and footers to as many PDF files as you need without any hidden costs or limitations.",
        },
        {
          question: "Are my files secure when adding these elements?",
          answer:
            "Absolutely. Your privacy is our top priority. All PDF processing, including adding page numbers, headers, and footers, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential.",
        },
        {
          question: "Can I customize the format of the page numbers?",
          answer:
            "Yes, you can use custom text with placeholders like {NUM} for the current page number and {TOTAL} for the total number of pages. For example, 'Page {NUM} of {TOTAL}' will display as 'Page 1 of 10'.",
        },
        {
          question: "Can I add both a header and a footer?",
          answer:
            "Yes, you can add both a header and a footer simultaneously. You can also choose to apply them to all pages, a single page, or a custom range of pages.",
        },
        {
          question: "Does adding page numbers affect the quality of my PDF?",
          answer:
            "No, adding page numbers, headers, or footers with our tool does not affect the quality of your document's existing content. The new elements are seamlessly integrated.",
        },
      ]}
      currentTool="page-numbers"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Page Numbers', href: '/page-numbers' }
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
          isLoading={isProcessing}
        />

        {files.length > 0 && (
          <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
            <div className="flex justify-between items-center">
              <span>{files[0].name}</span>
              <span className="text-sm text-gray-400">
                {numPages} pages
              </span>
            </div>
          </div>
        )}

        {numPages > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">
              Page Preview
            </h2>
            <div className="flex flex-wrap gap-4">
              {Array.from({ length: Math.min(5, numPages) }).map((_, index) => (
                <div
                  key={index}
                  className="relative border-2 border-gray-600 rounded-lg p-2"
                >
                  <canvas
                    ref={(el) => (previewCanvasRef.current = el)}
                    className="w-32 h-40 bg-gray-800 border border-gray-700 rounded"
                  />
                  <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>
                  Add Page Numbers, Header & Footer
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Customize the appearance and position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-2 block">
                    Add Page Numbers
                  </Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="addPageNumbers"
                      checked={customText.includes("{NUM}") || customText.includes("{TOTAL}")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCustomText("Page {NUM} of {TOTAL}");
                        } else {
                          setCustomText("");
                        }
                      }}
                      className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="addPageNumbers"
                      className="text-sm"
                    >
                      Enable page numbers
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Header Text
                  </Label>
                  <input
                    type="text"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder="Enter header text (use {NUM} for page number, {TOTAL} for total pages)"
                    className="w-full p-2 bg-gray-900 text-gray-100 border border-gray-700 rounded"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">
                    Footer Text
                  </Label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="Enter footer text (use {NUM} for page number, {TOTAL} for total pages)"
                    className="w-full p-2 bg-gray-900 text-gray-100 border border-gray-700 rounded"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">
                      Font Size
                    </Label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full p-2 bg-gray-900 text-gray-100 border border-gray-700 rounded"
                    >
                      {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
                        <option key={size} value={size}>
                          {size}px
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      Text Color
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-10 w-16 p-1 bg-gray-900 border border-gray-700 rounded"
                      />
                      <span className="text-gray-300 text-sm">
                        {textColor}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Position
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      "top-left",
                      "top-center",
                      "top-right",
                      "bottom-left",
                      "bottom-center",
                      "bottom-right",
                    ].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setPosition(pos)}
                        className={`p-2 text-xs rounded border ${
                          position === pos
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                        }`}
                      >
                        {pos.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Apply to Pages
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                                          <input
                      type="radio"
                      id="allPages"
                      name="pageRange"
                      checked={applyToMode === "all"}
                      onChange={() => setApplyToMode("all")}
                      className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                      <label
                        htmlFor="allPages"
                        className="text-sm"
                      >
                        All pages
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                                          <input
                      type="radio"
                      id="singlePage"
                      name="pageRange"
                      checked={applyToMode === "single"}
                      onChange={() => setApplyToMode("single")}
                      className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                      <label
                        htmlFor="singlePage"
                        className="text-sm"
                      >
                        Single page:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={numPages}
                        value={singlePageIdx + 1}
                        onChange={(e) =>
                          setSinglePageIdx(Math.max(0, Math.min(numPages - 1, Number(e.target.value) - 1)))
                        }
                        className="w-16 p-1 bg-gray-900 text-gray-100 border border-gray-700 rounded text-sm"
                        disabled={applyToMode !== "single"}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                                          <input
                      type="radio"
                      id="pageRange"
                      name="pageRange"
                      checked={applyToMode === "range"}
                      onChange={() => setApplyToMode("range")}
                      className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                      <label
                        htmlFor="pageRange"
                        className="text-sm"
                      >
                        Page range:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={numPages}
                        value={rangeStart}
                        onChange={(e) =>
                          setPageRangeStart(Math.max(1, Math.min(numPages, Number(e.target.value))))
                        }
                        className="w-16 p-1 bg-gray-900 text-gray-100 border border-gray-700 rounded text-sm"
                        disabled={applyToMode !== "range"}
                      />
                      <span className="text-sm">to</span>
                      <input
                        type="number"
                        min="1"
                        max={numPages}
                        value={rangeEnd}
                        onChange={(e) =>
                          setPageRangeEnd(Math.max(1, Math.min(numPages, Number(e.target.value))))
                        }
                        className="w-16 p-1 bg-gray-900 text-gray-100 border border-gray-700 rounded text-sm"
                        disabled={applyToMode !== "range"}
                      />
                    </div>
                  </div>
                </div>

                <Button
                    onClick={handleAddNumbers}
                    disabled={isProcessing || !files.length}
                    className="w-full py-3"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Processing...
                      </span>
                    ) : (
                      "Add Page Numbers/Header/Footer"
                    )}
                  </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mt-6 bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Download</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  variant="success"
                  className="w-full py-3"
                  disabled={!numberedPdfUrl}
                >
                  <a
                    href={numberedPdfUrl || "#"}
                    download={downloadFileName || `numbered_${files[0]?.name || "document"}.pdf`}
                    onClick={(e) => {
                      if (!numberedPdfUrl) {
                        e.preventDefault();
                        return;
                      }
                      setTimeout(() => {
                        try {
                          if (numberedPdfUrl)
                            try { if (numberedPdfUrl && typeof URL !== 'undefined' && !String(numberedPdfUrl).startsWith('data:')) URL.revokeObjectURL(numberedPdfUrl); } catch { }
                        } catch {}
                      }, 500);
                    }}
                  >
                    Download PDF with Additions
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-6">
            {error}
          </Alert>
        )}
      </div>
    </ToolPageLayout>
  );
}