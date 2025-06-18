"use client";
import { useState } from "react";
import MetaHead from "@/components/ui/MetaHead";
import { PDFDocument } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";

export default function JpgToPdfPage() {
  const [files, setFiles] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFiles = (selected) => {
    if (!selected.length) {
      setError("Please select valid JPG or PNG images.");
      setFiles([]);
      return;
    }
    setFiles(selected);
    setPdfUrl(null);
    setError("");
  };

  const createPdf = async () => {
    setLoading(true);
    setError("");
    try {
      const pdfDoc = await PDFDocument.create();
      for (const file of files) {
        const imgData = await file.arrayBuffer();
        let img, dims;
        if (file.type === "image/jpeg") {
          img = await pdfDoc.embedJpg(imgData);
          dims = img.scale(1);
        } else if (file.type === "image/png") {
          img = await pdfDoc.embedPng(imgData);
          dims = img.scale(1);
        } else {
          throw new Error("Unsupported file type");
        }
        const page = pdfDoc.addPage([dims.width, dims.height]);
        page.drawImage(img, {
          x: 0,
          y: 0,
          width: dims.width,
          height: dims.height,
        });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(
        "Failed to convert images to PDF. Please ensure your files are valid JPG or PNG images and try again."
      );
    }
    setLoading(false);
  };

  return (
    <>
      <MetaHead
        title="JPG to PDF Converter – Free, Fast & Secure | PDF Toolkit"
        description="Convert JPG and PNG images to PDF, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized."
        url="https://yourdomain.com/jpg-to-pdf"
        ogImage="/public/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "JPG to PDF Converter",
          description:
            "Convert JPG and PNG images to PDF, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized.",
          url: "https://yourdomain.com/jpg-to-pdf",
        }}
      />
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold mb-6 text-center">
          JPG to PDF Converter
        </h1>
        <p className="mb-4 text-gray-400 text-center">
          Convert your JPG or PNG images to a single PDF file. 100% client-side.
        </p>
        <div className="w-full max-w-md mx-auto mb-4">
          <FileDropzone
            accept="image/jpeg,image/png"
            multiple
            onFiles={handleFiles}
            error={error}
            setError={setError}
            label="Choose Images"
            description="Drag & drop or click to select JPG/PNG images."
          />
        </div>
        {files.length > 0 && (
          <ul className="mb-4 text-center">
            {files.map((file, idx) => (
              <li key={idx} className="text-gray-400">
                {file.name}
              </li>
            ))}
          </ul>
        )}
        <Button
          onClick={createPdf}
          className="mb-4 w-full max-w-xs"
          disabled={loading || files.length === 0}
        >
          {loading ? "Converting..." : "Convert to PDF"}
        </Button>
        {loading && (
          <Loader label="Converting images to PDF..." className="mb-4" />
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}
        {pdfUrl && (
          <a
            href={pdfUrl}
            download="converted.pdf"
            className="mt-2 inline-block bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
            aria-label="Download converted PDF"
          >
            Download PDF
          </a>
        )}
      </main>
    </>
  );
}
