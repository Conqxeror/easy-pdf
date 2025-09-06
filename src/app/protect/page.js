"use client";

import React, { useState, useEffect  } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Lock } from "lucide-react";

export default function ProtectPdfPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [protectedUrl, setProtectedUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cleanup function for object URLs
  useEffect(() => {
    return () => {
      if (protectedUrl) {
        try { URL.revokeObjectURL(protectedUrl); } catch { /* ignore */ }
      }
    };
  }, [protectedUrl]);

  const handleFiles = (newFiles) => {
    const selectedFile = newFiles[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    setError("");
    setProtectedUrl(null);
    setPassword("");
  };

  const handleProtect = async () => {
    if (!file || !password) {
      setError("Please upload a PDF and enter a password.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setProtectedUrl(null);

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
      const url = URL.createObjectURL(blob);

      setProtectedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });

      setError("");
    } catch (e) {
      console.error("Protect PDF error:", e);
      setError("Failed to protect PDF. The file might be corrupted or already encrypted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toolName = "Protect PDF";
  const toolDescription = "Secure your sensitive PDF documents with password protection. Our online tool allows you to encrypt your PDFs, restricting access and ensuring only authorized individuals can view or modify them. All processing is done client-side, guaranteeing your privacy and the confidentiality of your files.";
  const steps = [
    "Upload the PDF file you wish to protect by dragging it into the dropzone or clicking to select.",
    "Enter a strong password in the designated field. This password will be required to open the protected PDF.",
    "Click the 'Protect PDF' button to apply the encryption.",
    "Download your newly password-protected PDF file.",
  ];
  const faqs = [
    {
      question: "Is it free to protect a PDF with a password?",
      answer: "Yes, our Protect PDF tool is completely free to use. You can add password protection to as many PDF files as you need without any hidden costs or limitations.",
    },
    {
      question: "Are my files secure when I protect them?",
      answer: "Absolutely. Your privacy is our top priority. All PDF processing, including encryption, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential.",
    },
    {
      question: "What kind of password should I use?",
      answer: "We recommend using a strong, unique password that combines uppercase and lowercase letters, numbers, and symbols to maximize security.",
    },
    {
      question: "Can I remove the password later?",
      answer: "Yes, you can use our 'Unlock PDF' tool to remove the password protection from your PDF, provided you know the correct password.",
    },
    {
      question: "Does protecting a PDF affect its content or quality?",
      answer: "No, adding password protection to your PDF does not alter its content or quality. It only encrypts the file, restricting access to unauthorized users.",
    },
  ];

  return (
    <ToolPageLayout
      title="Protect PDF"
      subtitle="Add password protection to your PDF documents. Keep your files secure and private."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="protect"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Protect PDF', href: '/protect' }
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
          description="Drag & drop or click to select a PDF file (Max 50MB)"
          maxSize={50 * 1024 * 1024}
          isLoading={isProcessing}
        />

        {fileName && (
          <div className="text-center text-gray-300 text-sm">
            Selected: <span className="font-medium text-gray-100">{fileName}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-200 flex items-center"
          >
            <Lock className="w-4 h-4 mr-2" />
            Enter Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a strong password"
            className="w-full bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            aria-label="Password for PDF protection"
          />
          <p className="text-xs text-gray-400 mt-1">
            This password will be required to open the protected PDF.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}

        <div className="flex justify-center">
          <Button
            onClick={handleProtect}
            disabled={isProcessing || !file || password.length === 0}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
            variant="default"
            size="lg"
            aria-label="Protect PDF with password"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Protecting...
              </span>
            ) : (
              "Protect PDF"
            )}
          </Button>
        </div>

        {protectedUrl && !isProcessing && (
          <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="w-full text-center space-y-4 text-gray-100">
              <h3 className="text-2xl font-semibold flex items-center justify-center text-green-400">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                PDF Protected!
              </h3>
              <p className="text-gray-300">
                Your PDF has been successfully encrypted.
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
                  href={protectedUrl}
                  download={`protected_${fileName || "document"}.pdf`}
                  className="text-center flex items-center"
                  onClick={() => {
                    const urlToRevoke = protectedUrl;
                    setTimeout(() => {
                      try { if (urlToRevoke) URL.revokeObjectURL(urlToRevoke); } catch { }
                    }, 500);
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Download Protected PDF
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}