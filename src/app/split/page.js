"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Head from "next/head";

export default function SplitPDFs() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
    const fileUrl = URL.createObjectURL(selectedFile);
    setPdfUrl(fileUrl);
  };

  const splitPDF = async () => {
    if (!file) {
      alert("Please upload a PDF file.");
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();

    const start = parseInt(startPage, 10) - 1;
    const end = parseInt(endPage, 10) - 1;

    if (start < 0 || end >= totalPages || start > end) {
      alert("Invalid page range.");
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
  };

  return (
    <>
      <Head>
        <title>Split PDFs - PDF Toolkit</title>
        <meta
          name="description"
          content="Split a PDF into specific pages or ranges with our easy-to-use tool. Fully client-side and privacy-focused."
        />
        <meta
          name="keywords"
          content="split PDFs, divide PDFs, PDF toolkit, online PDF tools"
        />
        <meta name="author" content="PDF Toolkit" />
      </Head>
      <div
        className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 sm:p-8 flex flex-col items-center justify-center"
        role="main"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 sm:mb-8 text-center">
          Split PDFs
        </h1>
        <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 text-center">
          Split a PDF into specific pages or ranges. Fully client-side and
          privacy-focused.
        </p>
        <div className="w-full max-w-sm sm:max-w-md mx-auto mb-4">
          <label
            htmlFor="file-input"
            className="block bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded cursor-pointer text-center hover:bg-blue-600 transition duration-300 shadow-md"
            aria-label="Upload a PDF file"
          >
            Choose File
          </label>
          <input
            id="file-input"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            aria-describedby="file-input-description"
            className="hidden"
          />
          <p id="file-input-description" className="sr-only">
            Upload a PDF file to split into specific pages or ranges.
          </p>
        </div>
        {fileName && (
          <div className="bg-blue-500 text-white text-center py-2 px-4 rounded mb-4">
            Selected File: {fileName}
          </div>
        )}
        {pdfUrl && (
          <div className="w-full max-w-3xl mx-auto mb-6 sm:mb-8">
            <iframe
              src={pdfUrl}
              className="w-full h-64 sm:h-96 border border-gray-600 rounded shadow-lg"
              title="PDF Viewer"
              aria-label="Preview of uploaded PDF file"
            ></iframe>
          </div>
        )}
        <div className="text-center mb-6 sm:mb-8">
          <label
            htmlFor="start-page"
            className="text-gray-400 text-sm sm:text-base"
          >
            Start Page:
          </label>
          <input
            id="start-page"
            type="number"
            value={startPage}
            onChange={(e) => setStartPage(e.target.value)}
            className="w-24 sm:w-32 mx-2 bg-gray-700 text-white rounded px-3 py-2"
            aria-label="Enter the start page number"
          />
          <label
            htmlFor="end-page"
            className="text-gray-400 text-sm sm:text-base"
          >
            End Page:
          </label>
          <input
            id="end-page"
            type="number"
            value={endPage}
            onChange={(e) => setEndPage(e.target.value)}
            className="w-24 sm:w-32 mx-2 bg-gray-700 text-white rounded px-3 py-2"
            aria-label="Enter the end page number"
          />
          <button
            onClick={splitPDF}
            className="ml-2 bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition duration-300"
            aria-label="Split the PDF file"
          >
            Split PDF
          </button>
        </div>
      </div>
    </>
  );
}
