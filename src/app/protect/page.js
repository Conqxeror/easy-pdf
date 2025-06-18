"use client";
import { useState } from "react";
import MetaHead from "@/components/ui/MetaHead";
import FileDropzone from "@/components/ui/FileDropzone";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import Loader from "@/components/ui/Loader";

export default function ProtectPdfPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [protectedUrl, setProtectedUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError("");
    setProtectedUrl(null);
  };

  const protectPDF = async () => {
    setError("");
    setProtectedUrl(null);
    if (!file || !password) {
      setError("Please upload a PDF and enter a password.");
      return;
    }
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      await pdfDoc.encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: {
          printing: "highResolution",
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: false,
          documentAssembly: false,
        },
      });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setProtectedUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError("Failed to protect PDF. Please try again.");
    }
    setIsProcessing(false);
  };

  return (
    <>
      <MetaHead
        title="Protect PDF with Password – Free, Fast & Secure | PDF Toolkit"
        description="Add password protection to your PDF files, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized."
        url="https://yourdomain.com/protect"
        ogImage="/public/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Protect PDF",
          description:
            "Add password protection to your PDF files, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized.",
          url: "https://yourdomain.com/protect",
        }}
      />
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Protect PDF</h1>
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
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="mb-4 w-full max-w-md px-3 py-2 rounded border border-gray-300 text-black"
          aria-label="Password"
        />
        <Button
          onClick={protectPDF}
          disabled={isProcessing || !file || !password}
          className="mb-4 w-full max-w-xs"
        >
          {isProcessing ? "Protecting..." : "Protect PDF"}
        </Button>
        {isProcessing && <Loader label="Protecting PDF..." className="mb-4" />}
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}
        {protectedUrl && (
          <a
            href={protectedUrl}
            download="protected.pdf"
            className="mt-2 inline-block bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
            aria-label="Download protected PDF"
          >
            Download Protected PDF
          </a>
        )}
      </main>
    </>
  );
}
