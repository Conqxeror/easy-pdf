"use client";

import { useState } from "react";
import Head from "next/head";
import { PDFDocument } from "pdf-lib";
import { Button, Input, Chip, Spinner } from "@nextui-org/react";

export default function CompressPDFs() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [compressedPdfUrl, setCompressedPdfUrl] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState("server");
  const [compressionPercentage, setCompressionPercentage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      setFileName("");
      return;
    }
    setError("");
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
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
        // Optionally, you can trigger auto-download:
        // const a = document.createElement('a');
        // a.href = downloadUrl;
        // a.download = `compressed-${fileName}`;
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);
      } else {
        // Client-side compression
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const originalSize = arrayBuffer.byteLength;
        const compressedPdfBytes = await pdfDoc.save({
          useObjectStreams: true,
          addDefaultPage: false,
        });
        const compressedSize = compressedPdfBytes.byteLength;
        const compressionPercent = Math.round(
          ((originalSize - compressedSize) / originalSize) * 100
        );
        setCompressionPercentage(compressionPercent);
        if (compressionPercent <= 0) {
          setInfo(
            "No further compression was possible. For best results, try compressing image-heavy PDFs."
          );
        } else {
          setInfo(
            "Compression complete. Note: Client-side compression is limited and works best for image-heavy PDFs."
          );
        }
        const blob = new Blob([compressedPdfBytes], {
          type: "application/pdf",
        });
        const compressedPdfUrl = URL.createObjectURL(blob);
        setCompressedPdfUrl(compressedPdfUrl);
      }
    } catch (error) {
      setError("Compression failed: " + error.message);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <>
      <Head>
        <title>Compress PDFs - PDF Toolkit</title>
        <meta
          name="description"
          content="Reduce the file size of your PDFs without losing quality. Fully client-side and privacy-focused."
        />
        <meta
          name="keywords"
          content="compress PDFs, reduce PDF size, PDF toolkit, online PDF tools"
        />
        <meta name="author" content="PDF Toolkit" />
      </Head>
      <div
        className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 sm:p-8 flex flex-col items-center justify-center"
        role="main"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 sm:mb-8 text-center">
          Compress PDFs
        </h1>
        <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 text-center">
          Reduce the file size of your PDFs without losing quality. Fully
          client-side and privacy-focused.
        </p>
        <div className="w-full max-w-sm sm:max-w-md mx-auto mb-4">
          <label
            htmlFor="file-input"
            className="block mb-2 text-center font-medium"
          >
            Choose File
          </label>
          <Input
            id="file-input"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            aria-describedby="file-input-description"
          />
          <p id="file-input-description" className="sr-only">
            Upload a PDF file to compress and reduce its size.
          </p>
        </div>
        {error && (
          <Chip color="danger" className="mb-4 text-center">
            {error}
          </Chip>
        )}
        {info && (
          <Chip color="primary" className="mb-4 text-center">
            {info}
          </Chip>
        )}
        <div className="text-center mb-6">
          <label
            htmlFor="compression-level"
            className="text-gray-400 text-sm sm:text-base"
          >
            Compression Level:
          </label>
          <select
            id="compression-level"
            value={compressionLevel}
            onChange={(e) => setCompressionLevel(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded mx-2 shadow-inner"
            aria-label="Select compression level"
          >
            <option value="server">Maximum (Server-Side, Recommended)</option>
            <option value="extreme">
              Extreme (Client-Side, Max Reduction)
            </option>
            <option value="recommended">
              Recommended (Client-Side, Balanced)
            </option>
            <option value="low">Low (Client-Side, Minimal Reduction)</option>
          </select>
        </div>
        <Button
          onClick={compressPDF}
          className="mb-6"
          aria-label="Compress the PDF file"
          color="primary"
          isLoading={isCompressing}
          spinner={<Spinner color="white" size="sm" />}
          disabled={isCompressing}
        >
          Compress PDF
        </Button>
        {compressedPdfUrl && (
          <div className="text-center">
            <p className="text-gray-400 text-sm sm:text-base mb-4">
              Compression Percentage: {compressionPercentage}%
            </p>
            <a
              href={compressedPdfUrl}
              download={`compressed-${fileName}`}
              className="text-blue-400 hover:underline"
              aria-label="Download the compressed PDF file"
            >
              Download Compressed PDF
            </a>
          </div>
        )}
      </div>
    </>
  );
}
