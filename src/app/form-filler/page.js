"use client";

import React, { useState, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";
import MetaHead from "@/components/ui/MetaHead";

export default function FormFillerPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [text, setText] = useState("");
  const [pageIdx, setPageIdx] = useState(0);
  const [x, setX] = useState(50);
  const [y, setY] = useState(700);
  const [fontSize, setFontSize] = useState(12);
  const [color, setColor] = useState("#000000");
  const [numPages, setNumPages] = useState(1);
  const [previewUrl, setPreviewUrl] = useState("");
  const previewRef = useRef();

  // Load PDF and set number of pages
  const handleFiles = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    setPreviewUrl("");
    if (newFiles.length === 0) return;
    try {
      const file = newFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setNumPages(pdfDoc.getPageCount());
      setPageIdx(0);
      // Generate preview of first page
      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();
      // Use pdf-lib to render preview as blank canvas (no pdfjs-dist here for simplicity)
      setPreviewUrl(""); // Could be improved with pdfjs-dist for real preview
    } catch (e) {
      setError("Failed to load PDF.");
    }
  };

  const handleFormFill = async () => {
    if (files.length === 0) {
      setError("Please upload a PDF file to fill forms.");
      return;
    }
    if (!text.trim()) {
      setError("Please enter text to add to the PDF.");
      return;
    }
    setIsProcessing(true);
    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const page = pages[pageIdx];
      // Convert hex color to rgb
      const hexToRgb = (hex) => {
        const n = hex.replace("#", "");
        return [
          (parseInt(n.substring(0, 2), 16) / 255) | 0,
          (parseInt(n.substring(2, 4), 16) / 255) | 0,
          (parseInt(n.substring(4, 6), 16) / 255) | 0,
        ];
      };
      const [r, g, b] = hexToRgb(color);
      page.drawText(text, {
        x: Number(x),
        y: Number(y),
        size: Number(fontSize),
        font,
        color: rgb(r, g, b),
      });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "filled-form.pdf";
      link.click();
      setError("");
    } catch (err) {
      setError("An error occurred while filling the form.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <MetaHead
        title="PDF Form Filler - easy-pdf"
        description="Add text and forms to your PDF files easily."
        url="/form-filler"
      />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">PDF Form Filler</h1>
        <FileDropzone
          accept="application/pdf"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload PDF"
          description="Drag & drop or click to select a PDF file"
        />
        {files.length > 0 && (
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleFormFill();
            }}
            aria-label="Form Filler Controls"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium">Text to Add</label>
              <input
                type="text"
                className="w-full rounded border px-2 py-1"
                value={text}
                onChange={(e) => setText(e.target.value)}
                aria-label="Text to add"
                required
              />
              <label className="block text-sm font-medium">Page</label>
              <select
                className="w-full rounded border px-2 py-1"
                value={pageIdx}
                onChange={(e) => setPageIdx(Number(e.target.value))}
                aria-label="Page number"
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <option key={i} value={i}>
                    Page {i + 1}
                  </option>
                ))}
              </select>
              <label className="block text-sm font-medium">X Position</label>
              <input
                type="number"
                className="w-full rounded border px-2 py-1"
                value={x}
                onChange={(e) => setX(e.target.value)}
                aria-label="X position"
              />
              <label className="block text-sm font-medium">Y Position</label>
              <input
                type="number"
                className="w-full rounded border px-2 py-1"
                value={y}
                onChange={(e) => setY(e.target.value)}
                aria-label="Y position"
              />
              <label className="block text-sm font-medium">Font Size</label>
              <input
                type="number"
                className="w-full rounded border px-2 py-1"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                aria-label="Font size"
                min={6}
                max={72}
              />
              <label className="block text-sm font-medium">Color</label>
              <input
                type="color"
                className="w-16 h-8 p-0 border-none"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                aria-label="Text color"
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="w-full aspect-[1.414/1] bg-gray-100 border rounded flex items-center justify-center text-gray-400">
                <span className="text-xs">PDF preview coming soon</span>
              </div>
            </div>
          </form>
        )}
        {error && (
          <Alert variant="destructive" className="mt-2">
            {error}
          </Alert>
        )}
        <Button
          variant="primary"
          className="mt-4"
          onClick={handleFormFill}
          disabled={isProcessing || !text.trim() || files.length === 0}
          aria-label="Fill PDF Form"
        >
          {isProcessing ? "Processing..." : "Fill Form & Download"}
        </Button>
      </div>
    </>
  );
}
