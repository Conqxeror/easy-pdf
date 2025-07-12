"use client";
import { Metadata } from 'next';

import React, { useRef, useState, useEffect, useCallback } from "react";


import html2canvas from "html2canvas";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import ToolPageContent from "@/components/ui/ToolPageContent";

// Import pdfjs-dist for PDF rendering
import * as pdfjs from "pdfjs-dist";
// Set the worker source for pdf.js. Using a CDN for simplicity.
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function HtmlToPdfPage() {
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const contentRef = useRef(null); // Ref for the editable HTML content
  const previewCanvasRef = useRef(null); // Ref for the PDF preview canvas
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null); // URL for the generated PDF preview
  const [pdfDocProxy, setPdfDocProxy] = useState(null); // pdf.js document proxy
  const renderTaskRef = useRef(null); // Ref to store the ongoing PDF render task

  // Cleanup function for object URLs and pdf.js document
  useEffect(() => {
    return () => {
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl);
      }
      if (pdfDocProxy) {
        pdfDocProxy.destroy();
      }
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [previewPdfUrl, pdfDocProxy]);

  // Function to render the PDF page to the canvas
  const renderPdfPageToCanvas = useCallback(async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !pdfDocProxy) {
      return;
    }

    // Cancel any ongoing render task to prevent conflicts
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    const context = canvas.getContext("2d");
    try {
      const page = await pdfDocProxy.getPage(1); // Always render the first page for preview
      const viewport = page.getViewport({ scale: 1 });

      // Calculate scale to fit canvas width, maintaining aspect ratio
      const desiredWidth = 800; // Fixed width for consistent preview size
      const scale = desiredWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale: scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };

      context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

      // Render the PDF page and store the render task
      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null; // Clear task after completion
    } catch (e) {
      // Catch RenderingCancelledException or other rendering errors
      if (e.name === "RenderingCancelledException") {
        console.log("PDF rendering cancelled:", e);
      } else {
        console.error("Error rendering PDF page to canvas:", e);
        setError("Failed to render PDF preview.");
      }
    }
  }, [pdfDocProxy]);

  // Effect to trigger rendering of the PDF preview whenever pdfDocProxy changes
  useEffect(() => {
    renderPdfPageToCanvas();
  }, [renderPdfPageToCanvas]);

  const handleGeneratePdfAndPreview = async () => {
    setIsProcessing(true);
    setError(""); // Clear previous errors

    // Clear previous preview URL and PDF proxy
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl(null);
    }
    if (pdfDocProxy) {
      pdfDocProxy.destroy();
      setPdfDocProxy(null);
    }

    try {
      if (!contentRef.current) {
        setError("Content area not found.");
        return;
      }

      // Check if the content is empty or only whitespace
      if (!contentRef.current.textContent.trim()) {
        setError("Please enter some content to convert to PDF.");
        return;
      }

      // Use html2canvas to capture the content of the ref
      const canvas = await html2canvas(contentRef.current, {
        useCORS: true, // Important for handling images/assets loaded from different origins
        scale: 2, // Increase scale for better quality PDF output
        scrollY: -window.scrollY, // Ensure correct vertical scroll capture
        windowHeight: contentRef.current.scrollHeight, // Capture full scrollable height
        backgroundColor: "#ffffff", // Explicitly set background color for html2canvas capture
        logging: true, // Enable logging for html2canvas
        // --- ADDED: onclone callback to override problematic CSS for html2canvas ---
        onclone: (clonedDoc) => {
          // Target the html element of the cloned document
          const htmlElement = clonedDoc.documentElement;
          if (htmlElement) {
            // Override the text color and background color with standard hex values
            // This bypasses issues with modern CSS color functions like oklch()
            htmlElement.style.color = "#000000"; // Set all text to black in the cloned DOM
            htmlElement.style.backgroundColor = "#ffffff"; // Set background to white
            htmlElement.style.background = "#ffffff"; // Ensure background is also set
          }
        },
        // --- END ADDED ---
      });

      const imgData = canvas.toDataURL("image/png");

      const pdfDoc = await PDFDocument.create();
      // Calculate page dimensions to fit the image while maintaining aspect ratio
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const page = pdfDoc.addPage([imgWidth, imgHeight]); // Create page with exact image dimensions

      const pngImage = await pdfDoc.embedPng(imgData);

      // Draw the image onto the PDF page
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: imgWidth,
        height: imgHeight,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const newPdfUrl = URL.createObjectURL(blob);
      setPreviewPdfUrl(newPdfUrl); // Set URL for preview

      // Load the generated PDF into pdf.js for preview
      const loadingTask = pdfjs.getDocument({ data: pdfBytes });
      const pdf = await loadingTask.promise;
      setPdfDocProxy(pdf); // Store the pdf.js document proxy

      setError(""); // Clear error on success
    } catch (e) {
      console.error("HTML to PDF conversion error:", e);
      // Enhanced error message
      setError(
        "Failed to convert HTML to PDF. This might be due to unsupported CSS features. Please try simplifying your content or check the browser console for details."
      );
      setPreviewPdfUrl(null);
      setPdfDocProxy(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle the actual download
  const handleDownloadPdf = () => {
    if (previewPdfUrl) {
      const link = document.createElement("a");
      link.href = previewPdfUrl;
      link.download = "html-to-pdf.pdf"; // Default filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // No URL.revokeObjectURL here, as it's managed by useEffect
    } else {
      setError("No PDF available to download. Please generate one first.");
    }
  };

  return (
    <>
      <main className="flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
        <Card className="bg-gray-800 border-gray-700 w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              HTML to PDF Converter
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Type or paste your HTML content below and instantly convert it
              into a PDF document.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Label
              htmlFor="htmlContent"
              className="text-sm font-medium text-gray-200"
            >
              Your HTML Content
            </Label>
            <div
              id="htmlContent"
              ref={contentRef}
              contentEditable="true" // Make the div editable
              className="w-full p-4 bg-gray-700 rounded-md border border-gray-600 min-h-[250px] overflow-y-auto resize-y
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-blue-500
                         text-gray-100 dark:text-gray-100" // Removed prose classes, added explicit text colors
              aria-label="Editable HTML content"
              placeholder="Start typing or paste your HTML here..." // Placeholder for contenteditable
              // Add initial content if desired, otherwise, it will be empty
              dangerouslySetInnerHTML={{
                __html: `<h2>Sample HTML Content</h2><p>Edit this content and download as PDF!</p><ul><li>Item 1</li><li>Item 2</li></ul>`,
              }}
            ></div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                {error}
              </Alert>
            )}

            <Button
              variant="default" // Changed to default variant for "Generate" action
              className="mt-6 w-full max-w-xs mx-auto block"
              onClick={handleGeneratePdfAndPreview} // New handler
              disabled={isProcessing}
              aria-label="Convert and Generate PDF Preview"
            >
              {isProcessing ? "Generating Preview..." : "Generate PDF Preview"}
            </Button>

            {previewPdfUrl && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700 flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4 text-gray-100">
                  PDF Preview
                </h2>
                <canvas
                  ref={previewCanvasRef}
                  className="w-full max-w-full h-auto border border-gray-600 rounded-md shadow-lg"
                  aria-label="Generated PDF preview"
                ></canvas>
                <Button
                  variant="success" // Use success variant for download
                  className="mt-4 w-full max-w-xs"
                  onClick={handleDownloadPdf} // Separate download handler
                  aria-label="Download Generated PDF"
                >
                  Download PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <ToolPageContent
          toolName="HTML to PDF Converter"
          toolDescription="Convert your HTML code or web content into a high-quality PDF document. Our free online tool allows you to paste HTML, edit it directly, and then generate a PDF that accurately preserves the layout and styling. Ideal for archiving web pages, creating reports from HTML data, or saving online articles for offline reading. All processing is done securely in your browser, ensuring your content remains private."
          currentTool="html-to-pdf"
          steps={[
            "Paste your HTML code or type your content directly into the editable text area above.",
            "Click the 'Generate PDF Preview' button to see how your HTML content will look as a PDF.",
            "Review the preview. If satisfied, click the 'Download PDF' button to save your newly created PDF file.",
          ]}
          faqs={[
            {
              question: "Is it free to convert HTML to PDF?",
              answer:
                "Yes, our HTML to PDF converter is completely free to use. You can convert as much HTML content as you need without any hidden costs or limitations.",
            },
            {
              question: "Are my files secure when converting HTML to PDF?",
              answer:
                "Absolutely. Your privacy is our top priority. All HTML to PDF conversion happens directly in your web browser. Your content is never uploaded to our servers, ensuring your data remains confidential.",
            },
            {
              question: "Can I convert complex HTML with CSS and JavaScript?",
              answer:
                "Our tool uses `html2canvas` to render HTML, which captures the visual representation. While it handles most standard HTML and CSS well, very complex layouts, advanced CSS features (like `oklch()` colors), or dynamic JavaScript interactions might not be perfectly replicated. For best results, simpler HTML structures are recommended.",
            },
            {
              question: "Can I edit the HTML content before converting?",
              answer:
                "Yes, the input area is fully editable. You can type, paste, and modify your HTML content directly within the browser before initiating the conversion to PDF.",
            },
            {
              question: "What is the maximum size of HTML content I can convert?",
              answer:
                "While there isn't a strict character limit, very large HTML documents with extensive styling or many images might take longer to process due to client-side rendering. For optimal performance, we recommend content of reasonable length.",
            },
          ]}
        />
      </main>
    </>
  );
}