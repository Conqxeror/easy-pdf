"use client";



import React, { useState, useRef, useEffect, useCallback } from "react";


import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import ToolPageContent from "@/components/ui/ToolPageContent";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import pdfjs-dist for PDF rendering
import * as pdfjs from "pdfjs-dist";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PageNumbersPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [numPages, setNumPages] = useState(0);

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
      renderTaskRef.current.cancel();
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
        pdfDocProxy.destroy();
        setPdfDocProxy(null); // Ensure state is cleared
      }
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDocProxy]);

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
      pdfDocProxy.destroy();
      setPdfDocProxy(null);
    }
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
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
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `numbered_${files[0].name || "document"}.pdf`;
      document.body.appendChild(link); // Append link to body before clicking
      link.click();
      document.body.removeChild(link); // Remove link after clicking
      URL.revokeObjectURL(url); // Revoke the object URL to release memory

      setError("");
    } catch (e) {
      setError("Failed to add page numbers/header/footer.");
      console.error("Page numbering error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <main className="flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
        <Card className="bg-gray-800 border-gray-700 w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              Add Page Numbers / Header / Footer
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Customize and add dynamic page numbers, headers, or footers to
              your PDF documents easily.
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

            {files.length > 0 && numPages > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Controls Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="fontSize"
                        className="text-sm font-medium text-gray-200"
                      >
                        Font Size
                      </Label>
                      <Input
                        id="fontSize"
                        type="number"
                        value={fontSize}
                        onChange={(e) =>
                          setFontSize(
                            Math.max(6, Math.min(Number(e.target.value), 72))
                          )
                        }
                        min={6}
                        max={72}
                        className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="textColor"
                        className="text-sm font-medium text-gray-200"
                      >
                        Text Color
                      </Label>
                      <Input
                        id="textColor"
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-8 p-0 border-none mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="headerText"
                      className="text-sm font-medium text-gray-200"
                    >
                      Header Text
                    </Label>
                    <Input
                      id="headerText"
                      type="text"
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      placeholder="e.g., Confidential Document"
                      className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="footerText"
                      className="text-sm font-medium text-gray-200"
                    >
                      Footer Text (replaces Page Numbers if set)
                    </Label>
                    <Input
                      id="footerText"
                      type="text"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder="e.g., Copyright 2024"
                      className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="customText"
                      className="text-sm font-medium text-gray-200"
                    >
                      Page Number Format
                    </Label>
                    <Input
                      id="customText"
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="e.g., Page {NUM} of {TOTAL}"
                      className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Use <code>{`{NUM}`}</code> for current page,{" "}
                      <code>{`{TOTAL}`}</code> for total pages.
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="startNumber"
                      className="text-sm font-medium text-gray-200"
                    >
                      Start Number
                    </Label>
                    <Input
                      id="startNumber"
                      type="number"
                      value={startNumber}
                      onChange={(e) =>
                        setStartNumber(Math.max(0, Number(e.target.value)))
                      }
                      min={0}
                      className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="position"
                      className="text-sm font-medium text-gray-200"
                    >
                      Position
                    </Label>
                    <Select value={position} onValueChange={setPosition}>
                      <SelectTrigger
                        id="position"
                        className="w-full mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      >
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 text-gray-100 border-gray-600">
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-center">Top Center</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-center">
                          Bottom Center
                        </SelectItem>
                        <SelectItem value="bottom-right">
                          Bottom Right
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="applyToMode"
                      className="text-sm font-medium text-gray-200"
                    >
                      Apply To
                    </Label>
                    <Select value={applyToMode} onValueChange={setApplyToMode}>
                      <SelectTrigger
                        id="applyToMode"
                        className="w-full mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      >
                        <SelectValue placeholder="Apply to..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 text-gray-100 border-gray-600">
                        <SelectItem value="all">All Pages</SelectItem>
                        <SelectItem value="single">Single Page</SelectItem>
                        <SelectItem value="range">Page Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {applyToMode === "single" && (
                    <div>
                      <Label
                        htmlFor="singlePage"
                        className="text-sm font-medium text-gray-200"
                      >
                        Page Number (1 to {numPages})
                      </Label>
                      <Input
                        id="singlePage"
                        type="number"
                        value={singlePageIdx + 1}
                        onChange={(e) =>
                          setSinglePageIdx(
                            Math.max(
                              0,
                              Math.min(Number(e.target.value) - 1, numPages - 1)
                            )
                          )
                        }
                        min={1}
                        max={numPages}
                        className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {applyToMode === "range" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="rangeStart"
                          className="text-sm font-medium text-gray-200"
                        >
                          Start Page (1 to {numPages})
                        </Label>
                        <Input
                          id="rangeStart"
                          type="number"
                          value={rangeStart}
                          onChange={(e) =>
                            setPageRangeStart(
                              Math.max(
                                1,
                                Math.min(Number(e.target.value), numPages)
                              )
                            )
                          }
                          min={1}
                          max={numPages}
                          className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="rangeEnd"
                          className="text-sm font-medium text-gray-200"
                        >
                          End Page (1 to {numPages})
                        </Label>
                        <Input
                          id="rangeEnd"
                          type="number"
                          value={rangeEnd}
                          onChange={(e) =>
                            setPageRangeEnd(
                              Math.max(
                                1,
                                Math.min(Number(e.target.value), numPages)
                              )
                            )
                          }
                          min={1}
                          max={numPages}
                          className="mt-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Column */}
                <div className="flex flex-col items-center justify-center bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative">
                  {numPages > 0 ? (
                    <canvas
                      ref={previewCanvasRef}
                      className="w-full h-auto max-w-full border border-gray-600 rounded-md shadow-lg"
                      style={{ maxWidth: "100%", height: "auto" }}
                    ></canvas>
                  ) : (
                    <div className="text-gray-400 text-center p-4">
                      Upload a PDF to see the preview.
                    </div>
                  )}
                </div>
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
              onClick={handleAddNumbers}
              disabled={
                isProcessing ||
                files.length === 0 ||
                numPages === 0 ||
                (!headerText.trim() &&
                  !footerText.trim() &&
                  !customText.includes("{NUM}") &&
                  !customText.includes("{TOTAL}"))
              }
              aria-label="Download PDF with page numbers/header/footer"
            >
              {isProcessing ? "Processing..." : "Download PDF with Additions"}
            </Button>
          </CardContent>
        </Card>
        <ToolPageContent
          toolName="Add Page Numbers / Header / Footer to PDF"
          toolDescription="Easily add customizable page numbers, headers, or footers to your PDF documents. Our tool offers flexible options for position, font size, color, and numbering format (e.g., 'Page X of Y'). Enhance your documents for professional or personal use, all while ensuring your files remain private with client-side processing."
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
        />
      </main>
    </>
  );
}