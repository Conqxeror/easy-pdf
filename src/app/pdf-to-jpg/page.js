"use client";
import { useState } from "react";
import MetaHead from "@/components/ui/MetaHead";
import FileDropzone from "@/components/ui/FileDropzone";

export default function PdfToJpgPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  // const [images, setImages] = useState([]); // For future: store output images

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError("");
  };

  return (
    <>
      <MetaHead
        title="PDF to JPG Converter – Free, Fast & Secure | PDF Toolkit"
        description="Convert PDF pages to JPG images, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized."
        url="https://yourdomain.com/pdf-to-jpg"
        ogImage="/public/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "PDF to JPG Converter",
          description:
            "Convert PDF pages to JPG images, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized.",
          url: "https://yourdomain.com/pdf-to-jpg",
        }}
      />
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">PDF to JPG Converter</h1>
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
        {/* Conversion logic and image previews will go here */}
        <p className="mb-2 text-gray-600">
          This tool will let you convert PDF pages to JPG images. Coming soon!
        </p>
      </main>
    </>
  );
}
