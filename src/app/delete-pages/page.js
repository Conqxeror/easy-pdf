"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";
import MetaHead from "@/components/ui/MetaHead";

export default function DeletePagesPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [selected, setSelected] = useState([]);

  const handleFiles = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    if (newFiles.length === 0) return;
    try {
      const file = newFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setNumPages(pdfDoc.getPageCount());
      setSelected([]);
    } catch (e) {
      setError("Failed to load PDF.");
    }
  };

  const togglePage = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleDelete = async () => {
    if (files.length === 0) {
      setError("Please upload a PDF file.");
      return;
    }
    setIsProcessing(true);
    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const newDoc = await PDFDocument.create();
      for (let i = 0; i < srcDoc.getPageCount(); i++) {
        if (!selected.includes(i)) {
          const [copied] = await newDoc.copyPages(srcDoc, [i]);
          newDoc.addPage(copied);
        }
      }
      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "deleted-pages.pdf";
      link.click();
      setError("");
    } catch (e) {
      setError("Failed to delete pages.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <MetaHead
        title="Delete PDF Pages - easy-pdf"
        description="Remove specific pages from your PDF easily."
        url="/delete-pages"
      />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Delete PDF Pages</h1>
        <FileDropzone
          accept="application/pdf"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload PDF"
          description="Drag & drop or click to select a PDF file"
        />
        {numPages > 0 && (
          <div className="my-4">
            <h2 className="font-semibold mb-2">Select Pages to Delete</h2>
            <ul
              className="flex flex-wrap gap-2"
              aria-label="Select pages to delete"
            >
              {Array.from({ length: numPages }, (_, i) => (
                <li key={i}>
                  <Button
                    size="sm"
                    variant={selected.includes(i) ? "destructive" : "secondary"}
                    aria-label={`Toggle delete for page ${i + 1}`}
                    onClick={() => togglePage(i)}
                  >
                    Page {i + 1}
                  </Button>
                </li>
              ))}
            </ul>
            <div className="w-full aspect-[1.414/1] bg-gray-100 border rounded flex items-center justify-center text-gray-400 mt-4">
              <span className="text-xs">PDF preview coming soon</span>
            </div>
          </div>
        )}
        {error && <Alert variant="destructive">{error}</Alert>}
        <Button
          className="mt-4"
          onClick={handleDelete}
          disabled={isProcessing || numPages === 0}
          aria-label="Download PDF with pages deleted"
        >
          {isProcessing ? "Processing..." : "Download PDF (Pages Deleted)"}
        </Button>
      </div>
    </>
  );
}
