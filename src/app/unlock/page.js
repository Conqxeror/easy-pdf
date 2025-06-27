"use client";
import { Metadata } from 'next';
import { useState, useEffect } from "react";


import FileDropzone from "@/components/ui/FileDropzone";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
// import Loader from "@/components/ui/Loader"; // Removed Loader as it's not explicitly used in the final UI beyond button text
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Assuming you have this component
import ToolPageContent from "@/components/ui/ToolPageContent";

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

  return (
    <>
      <main className="flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        {" "}
        {/* Centering the main card */}
        <Card className="bg-gray-800 border-gray-700 w-full">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              Unlock PDF
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Remove password protection from your PDF documents securely in
              your browser.
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
              description="Drag & drop or click to select a password-protected PDF file (Max 50MB)"
              maxSize={50 * 1024 * 1024}
              isLoading={isProcessing} // Use isProcessing for FileDropzone isLoading state
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

            <Button
              onClick={unlockPDF}
              disabled={isProcessing || !file || password.length === 0} // Disable if no file or empty password
              className="w-full max-w-xs mx-auto block bg-blue-700 text-white"
              variant="default" // Consistent styling for action button
              size="lg"
              aria-label="Unlock PDF"
            >
              {isProcessing ? "Unlocking..." : "Unlock PDF"}
            </Button>
          </CardContent>

          {unlockedUrl && !isProcessing && (
            <CardFooter className="flex flex-col gap-4 border-t border-gray-700 pt-6">
              <div className="w-full text-center space-y-2 text-gray-100">
                <h3 className="text-xl font-semibold">PDF Unlocked!</h3>
                <p className="text-sm text-gray-400">
                  Your PDF has been successfully unlocked.
                </p>
              </div>
              <Button
                asChild
                variant="success"
                className="w-full max-w-xs mx-auto block"
              >
                <a
                  href={unlockedUrl}
                  download={`unlocked_${fileName || "document"}.pdf`}
                  className="text-center"
                >
                  Download Unlocked PDF
                </a>
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>
      <ToolPageContent
        toolName="Unlock PDF"
        toolDescription="Remove password protection from your PDF documents quickly and securely. Our online Unlock PDF tool allows you to decrypt password-protected PDFs directly in your browser, ensuring your files remain private. Simply upload your file, enter the correct password, and download the unlocked version instantly."
        steps={[
          "Upload your password-protected PDF file by dragging it into the dropzone or clicking to select.",
          "Enter the correct password for the PDF in the provided input field.",
          "Click the 'Unlock PDF' button to remove the password protection.",
          "Once processed, your unlocked PDF will be available for preview and download.",
        ]}
        faqs={[
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
        ]}
      />
    </>
  );
}
