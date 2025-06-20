"use client";

import React, { useState } from "react";
import Tesseract from "tesseract.js";
import FileDropzone from "@/components/ui/FileDropzone";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";
import MetaHead from "@/components/ui/MetaHead";

export default function OcrPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState("");

  const handleOcr = async () => {
    if (files.length === 0) {
      setError("Please upload a PDF or image file.");
      return;
    }
    setIsProcessing(true);
    setError("");
    setResult("");
    try {
      const file = files[0];
      const url = URL.createObjectURL(file);
      const { data } = await Tesseract.recognize(url, "eng");
      setResult(data.text);
    } catch (e) {
      setError("Failed to extract text.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <MetaHead
        title="OCR PDF - easy-pdf"
        description="Extract text from scanned PDFs and images using OCR."
        url="/ocr"
      />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">OCR (Text Recognition)</h1>
        <FileDropzone
          accept="application/pdf,image/*"
          multiple={false}
          onFiles={setFiles}
          error={error}
          setError={setError}
          label="Upload PDF or Image"
          description="Drag & drop or click to select a PDF or image file"
        />
        <div className="w-full aspect-[1.414/1] bg-gray-100 border rounded flex items-center justify-center text-gray-400 mt-4">
          <span className="text-xs">PDF preview coming soon</span>
        </div>
        {error && <Alert variant="destructive">{error}</Alert>}
        <Button
          className="mt-4"
          onClick={handleOcr}
          disabled={isProcessing}
          aria-label="Extract text from file"
        >
          {isProcessing ? "Processing..." : "Extract Text"}
        </Button>
        {result && (
          <div className="mt-4 p-4 bg-gray-900 rounded">
            <h2 className="font-semibold mb-2">Extracted Text</h2>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </>
  );
}
