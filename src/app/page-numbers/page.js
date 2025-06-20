"use client";

import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";
import MetaHead from "@/components/ui/MetaHead";

export default function PageNumbersPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddNumbers = async () => {
    if (files.length === 0) {
      setError("Please upload a PDF file.");
      return;
    }
    setIsProcessing(true);
    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      pages.forEach((page, idx) => {
        const { width, height } = page.getSize();
        page.drawText(`${idx + 1}`, {
          x: width / 2 - 10,
          y: 20,
          size: 12,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
      });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "page-numbers.pdf";
      link.click();
      setError("");
    } catch (e) {
      setError("Failed to add page numbers.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <MetaHead
        title="Add Page Numbers - easy-pdf"
        description="Add page numbers, headers, and footers to your PDF."
        url="/page-numbers"
      />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          Add Page Numbers / Header / Footer
        </h1>
        <FileDropzone
          accept="application/pdf"
          multiple={false}
          onFiles={setFiles}
          error={error}
          setError={setError}
          label="Upload PDF"
          description="Drag & drop or click to select a PDF file"
        />
        <div className="w-full aspect-[1.414/1] bg-gray-100 border rounded flex items-center justify-center text-gray-400 mt-4">
          <span className="text-xs">PDF preview coming soon</span>
        </div>
        {error && <Alert variant="destructive">{error}</Alert>}
        <Button
          className="mt-4"
          onClick={handleAddNumbers}
          disabled={isProcessing}
          aria-label="Download PDF with page numbers"
        >
          {isProcessing ? "Processing..." : "Download PDF with Page Numbers"}
        </Button>
      </div>
    </>
  );
}
