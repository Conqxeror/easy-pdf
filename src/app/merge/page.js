"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Head from "next/head";
import { Button, Input, Chip, Spinner } from "@nextui-org/react";

export default function MergePDFs() {
  const [files, setFiles] = useState([]);
  const [mergedPDF, setMergedPDF] = useState(null);
  const [error, setError] = useState("");
  const [isMerging, setIsMerging] = useState(false);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files).filter(
      (file) => file.type === "application/pdf"
    );
    if (newFiles.length !== event.target.files.length) {
      setError("Only PDF files are allowed.");
    } else {
      setError("");
    }
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );
    if (droppedFiles.length !== event.dataTransfer.files.length) {
      setError("Only PDF files are allowed.");
    } else {
      setError("");
    }
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
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
      <Head>
        <title>Merge PDFs - PDF Toolkit</title>
        <meta
          name="description"
          content="Merge multiple PDF files into one seamlessly with our easy-to-use tool. Fully client-side and privacy-focused."
        />
        <meta
          name="keywords"
          content="merge PDFs, combine PDFs, PDF toolkit, online PDF tools"
        />
        <meta name="author" content="PDF Toolkit" />
        {/* Open Graph tags */}
        <meta property="og:title" content="Merge PDFs - PDF Toolkit" />
        <meta
          property="og:description"
          content="Merge multiple PDF files into one seamlessly with our easy-to-use tool. Fully client-side and privacy-focused."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/merge" />
        <meta
          property="og:image"
          content="https://yourdomain.com/og-image.png"
        />
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Merge PDFs - PDF Toolkit" />
        <meta
          name="twitter:description"
          content="Merge multiple PDF files into one seamlessly with our easy-to-use tool. Fully client-side and privacy-focused."
        />
        <meta
          name="twitter:image"
          content="https://yourdomain.com/og-image.png"
        />
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Merge PDFs - PDF Toolkit",
              url: "https://yourdomain.com/merge",
              description:
                "Merge multiple PDF files into one seamlessly with our easy-to-use tool. Fully client-side and privacy-focused.",
              applicationCategory: "PDFTool",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
                availability: "https://schema.org/InStock",
              },
              author: {
                "@type": "Organization",
                name: "PDF Toolkit",
              },
              inLanguage: "en",
            }),
          }}
        />
      </Head>
      <div
        className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex flex-col items-center justify-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <h1 className="text-5xl font-extrabold mb-8 text-center">Merge PDFs</h1>
        <p className="text-lg text-gray-400 mb-8 text-center">
          Combine multiple PDF files into one seamlessly. Fully client-side and
          privacy-focused.
        </p>
        <div className="w-full max-w-md mx-auto mb-4">
          <label
            htmlFor="file-input"
            className="block mb-2 text-center font-medium"
          >
            Choose Files
          </label>
          <Input
            id="file-input"
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileChange}
            className="mb-2"
          />
          <div className="mt-4 p-4 border-2 border-dashed border-gray-600 rounded text-center text-gray-400">
            Drag and drop your PDF files here
          </div>
        </div>
        {error && (
          <Chip color="danger" className="mb-4 text-center">
            {error}
          </Chip>
        )}
        <ul className="mb-4 text-center">
          {files.map((file, index) => (
            <li
              key={index}
              className="text-gray-400 flex items-center justify-center gap-2"
            >
              {file.name}
              <button
                type="button"
                className="ml-2 text-red-400 hover:text-red-600 text-xs border border-red-400 rounded px-2 py-0.5"
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
                aria-label={`Remove ${file.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <Button
          onClick={mergePDFs}
          className="mx-auto block"
          color="primary"
          isLoading={isMerging}
          spinner={<Spinner color="white" size="sm" />}
          disabled={isMerging}
        >
          Merge PDFs
        </Button>
        {mergedPDF && (
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-semibold">Merged PDF:</h2>
            <a
              href={mergedPDF}
              download="merged.pdf"
              className="text-blue-400 hover:underline"
            >
              Download Merged PDF
            </a>
          </div>
        )}
      </div>
    </>
  );
}
