"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";
import MetaHead from "@/components/ui/MetaHead";

export default function OrganizePage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageOrder, setPageOrder] = useState([]);
  const [numPages, setNumPages] = useState(0);
  const [selected, setSelected] = useState([]);

  // Load PDF and set page order
  const handleFiles = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    if (newFiles.length === 0) return;
    try {
      const file = newFiles[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setNumPages(pdfDoc.getPageCount());
      setPageOrder(Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i));
      setSelected([]);
    } catch (e) {
      setError("Failed to load PDF.");
    }
  };

  // Simple up/down reorder
  const movePage = (from, to) => {
    if (to < 0 || to >= pageOrder.length) return;
    const newOrder = [...pageOrder];
    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, moved);
    setPageOrder(newOrder);
  };

  const togglePage = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleOrganize = async () => {
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
      for (const idx of pageOrder) {
        if (!selected.includes(idx)) {
          const [copied] = await newDoc.copyPages(srcDoc, [idx]);
          newDoc.addPage(copied);
        }
      }
      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "organized.pdf";
      link.click();
      setError("");
    } catch (e) {
      setError("Failed to organize PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <MetaHead
        title="Organize PDF - easy-pdf"
        description="Organize, reorder, and manage your PDF pages."
        url="/organize"
      />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Organize PDF</h1>
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
            <h2 className="font-semibold mb-2">Page Order & Selection</h2>
            <ul
              className="space-y-2"
              aria-label="Page order and selection list"
            >
              {pageOrder.map((idx, i) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-8 inline-block">Page {idx + 1}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    aria-label={`Move page ${idx + 1} up`}
                    onClick={() => movePage(i, i - 1)}
                    disabled={i === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    aria-label={`Move page ${idx + 1} down`}
                    onClick={() => movePage(i, i + 1)}
                    disabled={i === pageOrder.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      selected.includes(idx) ? "destructive" : "secondary"
                    }
                    aria-label={
                      selected.includes(idx)
                        ? `Remove page ${idx + 1}`
                        : `Keep page ${idx + 1}`
                    }
                    onClick={() => togglePage(idx)}
                  >
                    {selected.includes(idx) ? "Remove" : "Keep"}
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
          onClick={handleOrganize}
          disabled={isProcessing || numPages === 0}
          aria-label="Download organized PDF"
        >
          {isProcessing ? "Processing..." : "Download Organized PDF"}
        </Button>
      </div>
    </>
  );
}
