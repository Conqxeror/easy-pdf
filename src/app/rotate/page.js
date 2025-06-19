"use client";
import { useState } from "react";
import MetaHead from "@/components/ui/MetaHead";
import FileDropzone from "@/components/ui/FileDropzone";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import Loader from "@/components/ui/Loader";
import PageRangeInput from "@/components/ui/PageRangeInput";

export default function RotatePdfPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [rotatedUrl, setRotatedUrl] = useState(null);
  const [isRotating, setIsRotating] = useState(false);
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [angle, setAngle] = useState(90);
  const [totalPages, setTotalPages] = useState(null);

  const handleFiles = async (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError("");
    setRotatedUrl(null);
    setStartPage("");
    setEndPage("");
    setTotalPages(null);
    // Get total pages for range input
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdfDoc.getPageCount());
    } catch {
      setTotalPages(null);
    }
  };

  const rotatePDF = async () => {
    setError("");
    setRotatedUrl(null);
    if (!file) {
      setError("Please upload a PDF file.");
      return;
    }
    setIsRotating(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const total = pdfDoc.getPageCount();
      const start = startPage ? Math.max(0, parseInt(startPage, 10) - 1) : 0;
      const end = endPage
        ? Math.min(total - 1, parseInt(endPage, 10) - 1)
        : total - 1;
      if (start > end || start < 0 || end >= total) {
        setError("Invalid page range.");
        setIsRotating(false);
        return;
      }
      for (let i = start; i <= end; i++) {
        const page = pdfDoc.getPage(i);
        page.setRotation(
          (page.getRotation().angle + parseInt(angle, 10)) % 360
        );
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setRotatedUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError("Failed to rotate PDF. Please try again.");
    }
    setIsRotating(false);
  };

  return (
    <>
      <MetaHead
        title="Rotate PDF Pages – Free, Fast & Secure | easy-pdf"
        description="Rotate pages in your PDF files, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized."
        url="https://easy-pdf.com/rotate"
        ogImage="/public/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Rotate PDF",
          description:
            "Rotate pages in your PDF files, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized.",
          url: "https://easy-pdf.com/rotate",
        }}
      />
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Rotate PDF</h1>
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
        {totalPages && (
          <PageRangeInput
            startPage={startPage}
            endPage={endPage}
            setStartPage={setStartPage}
            setEndPage={setEndPage}
            totalPages={totalPages}
          />
        )}
        <div className="mb-4 flex gap-2 items-center">
          <label htmlFor="angle" className="font-medium">
            Rotate by:
          </label>
          <select
            id="angle"
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            className="text-black rounded px-2 py-1"
          >
            <option value={90}>90°</option>
            <option value={180}>180°</option>
            <option value={270}>270°</option>
          </select>
        </div>
        <Button
          onClick={rotatePDF}
          disabled={isRotating || !file}
          className="mb-4 w-full max-w-xs"
        >
          {isRotating ? "Rotating..." : "Rotate PDF"}
        </Button>
        {isRotating && <Loader label="Rotating PDF..." className="mb-4" />}
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}
        {rotatedUrl && (
          <a
            href={rotatedUrl}
            download="rotated.pdf"
            className="mt-2 inline-block bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
            aria-label="Download rotated PDF"
          >
            Download Rotated PDF
          </a>
        )}
      </main>
    </>
  );
}
