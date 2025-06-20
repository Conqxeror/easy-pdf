"use client";

import React, { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";
import MetaHead from "@/components/ui/MetaHead";

export default function SignPage() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef();
  const [drawMode, setDrawMode] = useState(false);
  const [drawing, setDrawing] = useState(false);

  // Canvas drawing handlers
  const handleMouseDown = (e) => {
    if (!drawMode) return;
    setDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };
  const handleMouseMove = (e) => {
    if (!drawMode || !drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };
  const handleMouseUp = () => {
    setDrawing(false);
  };

  const handleSign = async () => {
    if (files.length === 0) {
      setError("Please upload a PDF file.");
      return;
    }
    setIsProcessing(true);
    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const page = pages[0];
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL();
      const pngImage = await pdfDoc.embedPng(dataUrl);
      page.drawImage(pngImage, { x: 50, y: 50, width: 200, height: 100 });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "signed.pdf";
      link.click();
      setError("");
    } catch (e) {
      setError("Failed to sign PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <MetaHead
        title="Sign/Annotate PDF - easy-pdf"
        description="Sign or annotate your PDF with a canvas overlay."
        url="/sign"
      />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Sign / Annotate PDF</h1>
        <FileDropzone
          accept="application/pdf"
          multiple={false}
          onFiles={setFiles}
          error={error}
          setError={setError}
          label="Upload PDF"
          description="Drag & drop or click to select a PDF file"
        />
        <div className="my-4">
          <Button
            onClick={() => setDrawMode(!drawMode)}
            variant="secondary"
            aria-label="Toggle draw mode"
          >
            {drawMode ? "Disable Draw" : "Enable Draw"}
          </Button>
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            className="border mt-2 bg-white"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            aria-label="Signature canvas"
          />
          <div className="w-full aspect-[1.414/1] bg-gray-100 border rounded flex items-center justify-center text-gray-400 mt-4">
            <span className="text-xs">PDF preview coming soon</span>
          </div>
        </div>
        {error && <Alert variant="destructive">{error}</Alert>}
        <Button
          className="mt-4"
          onClick={handleSign}
          disabled={isProcessing}
          aria-label="Download signed PDF"
        >
          {isProcessing ? "Processing..." : "Download Signed PDF"}
        </Button>
      </div>
    </>
  );
}
