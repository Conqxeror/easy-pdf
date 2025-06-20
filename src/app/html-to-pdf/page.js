"use client";

import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { PDFDocument } from "pdf-lib";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";
import MetaHead from "@/components/ui/MetaHead";

export default function HtmlToPdfPage() {
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const contentRef = useRef();

  const handleDownload = async () => {
    setIsProcessing(true);
    setError("");
    try {
      const canvas = await html2canvas(contentRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([canvas.width, canvas.height]);
      const pngImage = await pdfDoc.embedPng(imgData);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
      });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "html-to-pdf.pdf";
      link.click();
    } catch (e) {
      setError("Failed to convert HTML to PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <MetaHead
        title="HTML to PDF - easy-pdf"
        description="Convert HTML content to PDF instantly."
        url="/html-to-pdf"
      />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">HTML to PDF</h1>
        <div
          ref={contentRef}
          className="p-4 bg-white text-black rounded mb-4"
          aria-label="HTML content preview"
        >
          <h2>Sample HTML Content</h2>
          <p>Edit this content and download as PDF!</p>
        </div>
        <div className="w-full aspect-[1.414/1] bg-gray-100 border rounded flex items-center justify-center text-gray-400 mb-4">
          <span className="text-xs">PDF preview coming soon</span>
        </div>
        {error && <Alert variant="destructive">{error}</Alert>}
        <Button
          className="mt-4"
          onClick={handleDownload}
          disabled={isProcessing}
          aria-label="Download as PDF"
        >
          {isProcessing ? "Processing..." : "Download as PDF"}
        </Button>
      </div>
    </>
  );
}
