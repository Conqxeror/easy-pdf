"use client";

import { useState } from "react";
import MetaHead from "@/components/ui/MetaHead";
import { PDFDocument } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";

export default function CompressPDFs() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [compressedPdfUrl, setCompressedPdfUrl] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState("server");
  const [compressionPercentage, setCompressionPercentage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    setError("");
  };

  const compressPDF = async () => {
    setError("");
    setInfo("");
    if (!file) {
      setError("Please upload a PDF file.");
      return;
    }
    setIsCompressing(true);
    try {
      if (compressionLevel === "server") {
        // Server-side compression
        const formData = new FormData();
        formData.append("file", file);
        formData.append("compressionLevel", "recommended");
        const response = await fetch("/api/compress", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Server-side compression failed.");
        }
        // Download the file directly from the response
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        setCompressedPdfUrl(downloadUrl);
        setInfo(
          "Maximum compression applied using our secure server. Your file is not stored after processing."
        );
      } else {
        // Client-side compression (basic)
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        setCompressedPdfUrl(URL.createObjectURL(blob));
        setInfo("Basic client-side compression applied.");
      }
    } catch (e) {
      setError("An error occurred while compressing the PDF.");
    }
    setIsCompressing(false);
  };

  return (
    <>
      <MetaHead
        title="Compress PDF Online – Reduce PDF Size Free | PDF Toolkit"
        description="Compress PDF files online, 100% client-side or via secure server. Fast, free, privacy-first, and India-optimized."
        url="https://yourdomain.com/compress"
        ogImage="/public/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Compress PDF",
          description:
            "Compress PDF files online, 100% client-side or via secure server. Fast, free, privacy-first, and India-optimized.",
          url: "https://yourdomain.com/compress",
        }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-extrabold mb-8 text-center">
          Compress PDF
        </h1>
        <p className="text-lg text-gray-400 mb-8 text-center">
          Reduce PDF file size. Choose client-side or server-side compression.
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
        <div className="mb-4 flex gap-4 items-center">
          <label htmlFor="compression-level" className="font-medium">
            Compression:
          </label>
          <select
            id="compression-level"
            value={compressionLevel}
            onChange={(e) => setCompressionLevel(e.target.value)}
            className="text-black rounded px-2 py-1"
          >
            <option value="client">Client-side (basic)</option>
            <option value="server">Server-side (max)</option>
          </select>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-4 text-center">
            {error}
          </Alert>
        )}
        {info && (
          <Alert variant="default" className="mt-4 text-green-400 text-center">
            {info}
          </Alert>
        )}
        <Button
          onClick={compressPDF}
          className="mx-auto block"
          disabled={isCompressing}
        >
          {isCompressing ? "Compressing..." : "Compress PDF"}
        </Button>
        {isCompressing && <Loader label="Compressing PDF..." className="mb-4" />}
        {compressedPdfUrl && (
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-semibold">Compressed PDF:</h2>
            <a
              href={compressedPdfUrl}
              download="compressed.pdf"
              className="text-blue-400 hover:underline"
              aria-label="Download compressed PDF"
            >
              Download Compressed PDF
            </a>
          </div>
        )}
      </div>
    </>
  );
}
