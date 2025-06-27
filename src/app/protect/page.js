"use client";
import { Metadata } from 'next';
import { useState, useEffect } from "react";


import FileDropzone from "@/components/ui/FileDropzone";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
// import Loader from "@/components/ui/Loader"; // Removed Loader as it's not used directly
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription, // Import CardDescription
} from "@/components/ui/card";
import { Label } from "@/components/ui/label"; // Import Label
import { Input } from "@/components/ui/input"; // Import Input
import ToolPageContent from "@/components/ui/ToolPageContent";

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
        URL.revokeObjectURL(protectedUrl);
      }
    };
  }, [protectedUrl]); // Run when protectedUrl changes or component unmounts

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    setError("");
    setProtectedUrl(null); // Clear previous URL on new file selection
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
      setError(
        "Failed to protect PDF. The file might be corrupted or already encrypted."
      );
      console.error("Protect PDF error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <main className="flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        {" "}
        {/* Centering the main content */}
        <Card className="bg-gray-800 border-gray-700 w-full">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              Protect PDF
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Add password protection to your PDF documents. Keep your files
              secure and private.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
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

            <Button
              onClick={protectPDF}
              disabled={isProcessing || !file || password.length === 0} // Disable if password is empty
              className="w-full max-w-xs mx-auto block bg-blue-700 text-white"
              variant="default" // Consistent styling
              size="lg"
              aria-label="Protect PDF with password"
            >
              {isProcessing ? "Protecting..." : "Protect PDF"}
            </Button>
          </CardContent>

          {protectedUrl && !isProcessing && (
            <CardFooter className="flex flex-col gap-4 border-t border-gray-700 pt-6">
              <div className="w-full text-center space-y-2 text-gray-100">
                <h3 className="text-xl font-semibold">PDF Protected!</h3>
                <p className="text-sm text-gray-400">
                  Your PDF has been successfully encrypted.
                </p>
              </div>
              <Button
                asChild
                variant="success"
                className="w-full max-w-xs mx-auto block"
              >
                <a
                  href={protectedUrl}
                  download={`protected_${fileName || "document"}.pdf`}
                  className="text-center"
                >
                  Download Protected PDF
                </a>
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>
      <ToolPageContent
        toolName="Protect PDF"
        toolDescription="Secure your sensitive PDF documents with password protection. Our online tool allows you to encrypt your PDFs, restricting access and ensuring only authorized individuals can view or modify them. All processing is done client-side, guaranteeing your privacy and the confidentiality of your files."
        steps={[
          "Upload the PDF file you wish to protect by dragging it into the dropzone or clicking to select.",
          "Enter a strong password in the designated field. This password will be required to open the protected PDF.",
          "Click the 'Protect PDF' button to apply the encryption.",
          "Download your newly password-protected PDF file.",
        ]}
        faqs={[
          {
            question: "Is it free to protect a PDF with a password?",
            answer:
              "Yes, our Protect PDF tool is completely free to use. You can add password protection to as many PDF files as you need without any hidden costs or limitations.",
          },
          {
            question: "Are my files secure when I protect them?",
            answer:
              "Absolutely. Your privacy is our top priority. All PDF processing, including encryption, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential.",
          },
          {
            question: "What kind of password should I use?",
            answer:
              "We recommend using a strong, unique password that combines uppercase and lowercase letters, numbers, and symbols to maximize security.",
          },
          {
            question: "Can I remove the password later?",
            answer:
              "Yes, you can use our 'Unlock PDF' tool to remove the password protection from your PDF, provided you know the correct password.",
          },
          {
            question: "Does protecting a PDF affect its content or quality?",
            answer:
              "No, adding password protection to your PDF does not alter its content or quality. It only encrypts the file, restricting access to unauthorized users.",
          },
        ]}
      />
    </>
  );
}