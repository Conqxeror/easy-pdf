"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import MetaHead from "@/components/ui/MetaHead";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";

export default function MergePDFs() {
  const [files, setFiles] = useState([]);
  const [mergedPDF, setMergedPDF] = useState(null);
  const [error, setError] = useState("");
  const [isMerging, setIsMerging] = useState(false);

  const handleFiles = (newFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const mergePDFs = async () => {
    setError("");
    if (files.length === 0) {
      setError("Please upload at least one PDF file.");
      return;
    }
    setIsMerging(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let existingPdf;
        try {
          existingPdf = await PDFDocument.load(arrayBuffer);
        } catch (e) {
          setError(`File '${file.name}' is not a valid or supported PDF.`);
          setIsMerging(false);
          return;
        }
        const copiedPages = await pdfDoc.copyPages(
          existingPdf,
          existingPdf.getPageIndices()
        );
        copiedPages.forEach((page) => pdfDoc.addPage(page));
      }
      const mergedPdfBytes = await pdfDoc.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      setMergedPDF(URL.createObjectURL(blob));
    } catch (e) {
      setError("An error occurred while merging PDFs. Please try again.");
    }
    setIsMerging(false);
  };

  return (
    <>
      <MetaHead
        title="Merge PDF – Free, Fast & Secure | easy-pdf"
        description="Merge multiple PDF files into one, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized."
        url="https://easy-pdf.com/merge"
        ogImage="/public/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Merge PDF",
          description:
            "Merge multiple PDF files into one, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized.",
          url: "https://easy-pdf.com/merge",
        }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-extrabold mb-8 text-center">Merge PDFs</h1>
        <p className="text-lg text-gray-400 mb-8 text-center">
          Combine multiple PDF files into one seamlessly. Fully client-side and
          privacy-focused.
        </p>
        <div className="w-full max-w-md mx-auto mb-4">
          <FileDropzone
            accept="application/pdf"
            multiple
            onFiles={handleFiles}
            error={error}
            setError={setError}
            label="Choose PDF Files"
            description="Drag & drop or click to select PDF files."
          />
        </div>
        {error && (
          <Alert variant="destructive" className="mb-4 text-center">
            {error}
          </Alert>
        )}
        <ul className="mb-4 text-center">
          {files.map((file, index) => (
            <li
              key={index}
              className="text-gray-400 flex items-center justify-center gap-2"
            >
              {file.name}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="ml-2 text-xs px-2 py-0.5"
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
                aria-label={`Remove ${file.name}`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <Button
          onClick={mergePDFs}
          className="mx-auto block"
          disabled={isMerging}
        >
          {isMerging ? "Merging..." : "Merge PDFs"}
        </Button>
        {isMerging && <Loader label="Merging PDFs..." className="mb-4" />}
        {mergedPDF && (
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-semibold">Merged PDF:</h2>
            <a
              href={mergedPDF}
              download="merged.pdf"
              className="text-blue-400 hover:underline"
              aria-label="Download merged PDF"
            >
              Download Merged PDF
            </a>
          </div>
        )}
      </div>
    </>
  );
}
