"use client";
import { useState } from "react";
import MetaHead from "@/components/ui/MetaHead";
import FileDropzone from "@/components/ui/FileDropzone";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import Loader from "@/components/ui/Loader";

export default function WatermarkPdfPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [watermarkText, setWatermarkText] = useState("");
  const [position, setPosition] = useState("center");
  const [watermarkedUrl, setWatermarkedUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError("");
    setWatermarkedUrl(null);
  };

  const addWatermark = async () => {
    setError("");
    setWatermarkedUrl(null);
    if (!file || !watermarkText) {
      setError("Please upload a PDF and enter watermark text.");
      return;
    }
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        let x = width / 2,
          y = height / 2;
        let rotate = 0;
        if (position === "top-left") {
          x = 60;
          y = height - 40;
        }
        if (position === "top-right") {
          x = width - 60;
          y = height - 40;
        }
        if (position === "bottom-left") {
          x = 60;
          y = 40;
        }
        if (position === "bottom-right") {
          x = width - 60;
          y = 40;
        }
        if (position === "diagonal") {
          x = width / 2;
          y = height / 2;
          rotate = -45;
        }
        page.drawText(watermarkText, {
          x,
          y,
          size: 32,
          color: rgb(0.7, 0.7, 0.7),
          opacity: 0.4,
          rotate: degrees(rotate),
          xSkew: 0,
          ySkew: 0,
          font: undefined,
        });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setWatermarkedUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError("Failed to add watermark. Please try again.");
    }
    setIsProcessing(false);
  };

  return (
    <>
      <MetaHead
        title="Add Watermark to PDF – Free, Fast & Secure | PDF Toolkit"
        description="Add watermark to your PDF files, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized."
        url="https://yourdomain.com/watermark"
        ogImage="/public/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Watermark PDF",
          description:
            "Add watermark to your PDF files, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized.",
          url: "https://yourdomain.com/watermark",
        }}
      />
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Watermark PDF</h1>
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
        <input
          type="text"
          value={watermarkText}
          onChange={(e) => setWatermarkText(e.target.value)}
          placeholder="Enter watermark text"
          className="mb-4 w-full max-w-md px-3 py-2 rounded border border-gray-300 text-black"
          aria-label="Watermark text"
        />
        <div className="mb-4 flex gap-2 items-center">
          <label htmlFor="position" className="font-medium">
            Position:
          </label>
          <select
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="text-black rounded px-2 py-1"
          >
            <option value="center">Center</option>
            <option value="diagonal">Diagonal</option>
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-right">Bottom Right</option>
          </select>
        </div>
        <Button
          onClick={addWatermark}
          disabled={isProcessing || !file || !watermarkText}
          className="mb-4 w-full max-w-xs"
        >
          {isProcessing ? "Adding Watermark..." : "Add Watermark"}
        </Button>
        {isProcessing && (
          <Loader label="Adding watermark..." className="mb-4" />
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}
        {watermarkedUrl && (
          <a
            href={watermarkedUrl}
            download="watermarked.pdf"
            className="mt-2 inline-block bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
            aria-label="Download watermarked PDF"
          >
            Download Watermarked PDF
          </a>
        )}
      </main>
    </>
  );
}
