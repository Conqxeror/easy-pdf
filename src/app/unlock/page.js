"use client";

import React, { useState, useEffect  } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ToolPageLayout from "@/components/ui/ToolPageLayout";

export default function UnlockPdfPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [unlockedUrl, setUnlockedUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cleanup function for object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (unlockedUrl) {
        URL.revokeObjectURL(unlockedUrl);
      }
    };
  }, [unlockedUrl]); // Runs when unlockedUrl changes or component unmounts

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : ""); // Handle case where selectedFile might be null
    setError("");
    setUnlockedUrl(null); // Clear previous URL on new file selection
  };

  const unlockPDF = async () => {
    setError("");
    setUnlockedUrl(null); // Clear previous URL on new attempt
    if (!file || !password) {
      setError("Please upload a PDF and enter the password.");
      return;
    }
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Attempt to load the PDF with the provided password
      const pdfDoc = await PDFDocument.load(arrayBuffer, { password });

      // If loading is successful, the PDF is effectively unlocked in memory.
      // Simply save it to get an unencrypted version.
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setUnlockedUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error("Unlock PDF error:", e);
      // More specific error messages for better UX
      if (e.message.includes("Incorrect password")) {
        setError("Failed to unlock PDF. The password provided is incorrect.");
      } else if (e.message.includes("encrypted")) {
        setError(
          "Failed to unlock PDF. This PDF is encrypted and requires a valid password."
        );
      } else {
        setError(
          "Failed to unlock PDF. The file might be corrupted or not supported."
        );
      }
    }
    setIsProcessing(false);
  };

  const toolName = "Unlock PDF";
  const toolDescription = "Remove password protection from your PDF documents quickly and securely. Our online Unlock PDF tool allows you to decrypt password-protected PDFs directly in your browser, ensuring your files remain private. Simply upload your file, enter the correct password, and download the unlocked version instantly.";
  const steps = [
    "Upload your password-protected PDF file by dragging it into the dropzone or clicking to select.",
    "Enter the correct password for the PDF in the provided input field.",
    "Click the 'Unlock PDF' button to remove the password protection.",
    "Once processed, your unlocked PDF will be available for preview and download.",
  ];
  const faqs = [
    {
      question: "Is it free to unlock a PDF?",
      answer:
        "Yes, our Unlock PDF tool is completely free to use. You can remove password protection from as many PDF files as you need without any hidden costs.",
    },
    {
      question: "Are my files secure when unlocking a PDF?",
      answer:
        "Absolutely. Your privacy is our top priority. All PDF processing, including unlocking, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential.",
    },
    {
      question: "What if I don't know the password?",
      answer:
        "Our tool requires the correct password to unlock the PDF. If you do not know the password, we cannot unlock the document for you, as this would be a security breach.",
    },
    {
      question: "Is there a file size limit for unlocking PDFs?",
      answer:
        "Yes, the maximum file size for a PDF to be unlocked is 50MB. For larger files, you might experience slower processing times or need to use a desktop application.",
    },
  ];

  return (
    <ToolPageLayout
      title="Unlock PDF"
      subtitle="Remove password protection from your PDF documents securely in your browser."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="unlock"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Unlock PDF', href: '/unlock' }
      ]}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="application/pdf"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Choose a PDF File"
          description="Drag & drop or click to select a password-protected PDF file (Max 50MB)"
          maxSize={50 * 1024 * 1024}
          isLoading={isProcessing}
        />

        {fileName && (
          <div className="text-center text-gray-300 text-sm">
            Selected:{" "}
            <span className="font-medium text-gray-100">{fileName}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-200"
          >
            Enter Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter the password to unlock"
            className="w-full bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            aria-label="Password for PDF protection"
          />
          <p className="text-xs text-gray-400 mt-1">
            This is the password required to open the uploaded PDF.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}

        <div className="flex justify-center">
          <Button
            onClick={unlockPDF}
            disabled={isProcessing || !file || password.length === 0}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
            variant="default"
            size="lg"
            aria-label="Unlock PDF"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Unlocking...
              </span>
            ) : (
              "Unlock PDF"
            )}
          </Button>
        </div>

        {unlockedUrl && !isProcessing && (
          <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="w-full text-center space-y-4 text-gray-100">
              <h3 className="text-2xl font-semibold flex items-center justify-center text-green-400">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                PDF Unlocked!
              </h3>
              <p className="text-gray-300">
                Your PDF has been successfully unlocked.
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                asChild
                variant="success"
                size="lg"
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
              >
                <a
                  href={unlockedUrl}
                  download={`unlocked_${fileName || "document"}.pdf`}
                  className="text-center flex items-center"
                  onClick={() => {
                    const urlToRevoke = unlockedUrl;
                    setTimeout(() => {
                      try { if (urlToRevoke) URL.revokeObjectURL(urlToRevoke); } catch { /* ignore */ }
                    }, 500);
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Download Unlocked PDF
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
