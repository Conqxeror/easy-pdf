"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import MetaHead from "@/components/ui/MetaHead";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function SplitPDFs() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [error, setError] = useState("");

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setPdfUrl(URL.createObjectURL(selectedFile));
    setError("");
  };

  const splitPDF = async () => {
    if (!file) {
      setError("Please upload a PDF file.");
      return;
    }
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();
      const start = parseInt(startPage, 10) - 1;
      const end = parseInt(endPage, 10) - 1;
      if (start < 0 || end >= totalPages || start > end) {
        setError("Invalid page range.");
        return;
      }
      const newPdfDoc = await PDFDocument.create();
      for (let i = start; i <= end; i++) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
        newPdfDoc.addPage(copiedPage);
      }
      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `split-pages-${start + 1}-to-${end + 1}.pdf`;
      link.click();
      setError("");
    } catch (e) {
      setError("An error occurred while splitting the PDF.");
    }
  };

  return (
    <>
      <MetaHead
        title="Split PDF Files Online – Free, Fast & Secure | PDF Toolkit"
        description="Split PDF files into separate pages, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized."
        url="https://yourdomain.com/split"
        ogImage="/public/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Split PDF Files",
          description:
            "Split PDF files into separate pages, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized.",
          url: "https://yourdomain.com/split",
        }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-extrabold mb-8 text-center">Split PDFs</h1>
        <p className="text-lg text-gray-400 mb-8 text-center">
          Split PDF files into separate pages. Fully client-side and
          privacy-focused.
        </p>
        <div className="w-full max-w-md mx-auto mb-4">
          <FileDropzone
            accept="application/pdf"
            multiple={false}
            onFiles={handleFiles}
            error={error}
            setError={setError}
            label="Choose a PDF File"
            description="Drag & drop or click to select a PDF file."
          />
        </div>
        {fileName && (
          <div className="mb-4 text-center text-gray-400">
            Selected: {fileName}
          </div>
        )}
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            min="1"
            placeholder="Start Page"
            value={startPage}
            onChange={(e) => setStartPage(e.target.value)}
            className="w-28 px-2 py-1 rounded text-black"
            aria-label="Start Page"
          />
          <input
            type="number"
            min="1"
            placeholder="End Page"
            value={endPage}
            onChange={(e) => setEndPage(e.target.value)}
            className="w-28 px-2 py-1 rounded text-black"
            aria-label="End Page"
          />
        </div>
        {error && (
          <Alert variant="destructive" className="mb-4 text-center">
            {error}
          </Alert>
        )}
        <Button onClick={splitPDF} className="mx-auto block">
          Split PDF
        </Button>
        {pdfUrl && (
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-semibold">Preview:</h2>
            <iframe
              src={pdfUrl}
              title="PDF Preview"
              className="w-full h-64 border rounded mt-2"
            />
          </div>
        )}
      </div>
    </>
  );
}
