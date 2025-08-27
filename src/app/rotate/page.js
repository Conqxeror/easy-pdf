"use client";

import React, { useState, useEffect  } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageRangeInput from "@/components/ui/PageRangeInput";
import ToolPageLayout from "@/components/ui/ToolPageLayout";

export default function RotatePdfPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [rotatedUrl, setRotatedUrl] = useState(null);
  const [isRotating, setIsRotating] = useState(false);
  const [startPage, setStartPage] = useState(""); // 1-based string
  const [endPage, setEndPage] = useState(""); // 1-based string
  const [angle, setAngle] = useState("90"); // Store as string to match Select value
  const [totalPages, setTotalPages] = useState(null);

  // Cleanup function for object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (rotatedUrl) {
        URL.revokeObjectURL(rotatedUrl);
      }
    };
  }, [rotatedUrl]); // Run when rotatedUrl changes or component unmounts

  /**
   * Handles file selection from the dropzone.
   * Loads the PDF to get total pages for the range input.
   * @param {File[]} files - An array of selected files.
   */
  const handleFiles = async (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    setError("");
    setRotatedUrl(null);
    setStartPage(""); // Reset page range
    setEndPage(""); // Reset page range
    setTotalPages(null); // Reset total pages

    if (!selectedFile) return;

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdfDoc.getPageCount());
      // Set default range to all pages if a file is loaded
      setStartPage("1");
      setEndPage(String(pdfDoc.getPageCount()));
    } catch (e) {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      console.error("PDF load error:", e);
      setTotalPages(null);
      setFile(null); // Clear file on error
      setFileName("");
    }
  };

  /**
   * Rotates pages of the PDF based on the selected range and angle.
   */
  const rotatePDF = async () => {
    setError("");
    setRotatedUrl(null);
    if (!file) {
      setError("Please upload a PDF file.");
      return;
    }
    setIsRotating(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const total = pdfDoc.getPageCount();

      // Parse and validate page range
      const start = startPage ? Math.max(1, parseInt(startPage, 10)) : 1; // 1-based start
      const end = endPage ? Math.min(total, parseInt(endPage, 10)) : total; // 1-based end

      if (start > end || start < 1 || end > total) {
        setError(
          "Invalid page range. Please ensure start page is less than or equal to end page, and within total pages."
        );
        setIsRotating(false);
        return;
      }

      // Parse the rotation angle
      const rotationAngle = parseInt(angle, 10);

      // Validate that rotationAngle is one of the allowed values
      const validAngles = [0, 90, 180, 270];
      const normalizedAngle = validAngles.includes(rotationAngle) 
        ? rotationAngle 
        : validAngles.reduce((prev, curr) => 
            Math.abs(curr - rotationAngle) < Math.abs(prev - rotationAngle) ? curr : prev
          );

      // Loop through the selected pages (0-based for pdf-lib)
      for (let i = start - 1; i < end; i++) {
        const page = pdfDoc.getPage(i);
        
        // Try to set rotation with the normalized angle (in degrees)
        page.setRotation(normalizedAngle);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setRotatedUrl((prev) => {
        try {
          if (prev) URL.revokeObjectURL(prev);
  } catch {
          // ignore
        }
        return url;
      });
    } catch (e) {
      setError(
        "Failed to rotate PDF. The file might be corrupted or cannot be processed."
      );
      console.error("Rotate PDF error:", e);
    } finally {
      setIsRotating(false);
    }
  };

  const toolName = "Rotate PDF";
  const toolDescription = "Easily rotate pages in your PDF documents. Whether you need to adjust the orientation of a single page, a specific range, or the entire document, our online tool allows you to rotate by 90, 180, or 270 degrees. All processing is done securely in your browser, ensuring your files remain private.";
  const steps = [
    "Upload your PDF file by dragging it into the dropzone or clicking to select.",
    "Specify the page range you want to rotate. You can choose to rotate all pages, or a custom range (e.g., pages 5-10).",
    "Select the rotation angle: 90° clockwise, 180°, or 270° clockwise (90° counter-clockwise).",
    "Click the 'Rotate PDF' button to apply the changes.",
    "Download your newly rotated PDF file.",
  ];
  const faqs = [
    {
      question: "Is it free to rotate PDF pages?",
      answer:
        "Yes, our Rotate PDF tool is completely free to use. You can rotate as many PDF files as you need without any hidden costs or limitations.",
    },
    {
      question: "Are my files secure when rotating PDFs?",
      answer:
        "Absolutely. Your privacy is our top priority. All PDF processing, including rotation, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential.",
    },
    {
      question: "Can I rotate only specific pages?",
      answer:
        "Yes, you can specify a custom page range to rotate. This allows you to precisely control which pages are affected by the rotation.",
    },
    {
      question: "What rotation angles are supported?",
      answer:
        "You can choose from 90 degrees clockwise, 180 degrees, or 270 degrees clockwise (which is equivalent to 90 degrees counter-clockwise).",
    },
    {
      question: "Does rotating affect the quality of my PDF?",
      answer:
        "No, rotating your PDF pages with our tool does not affect the quality of your document. The content remains sharp and clear.",
    },
  ];

  return (
    <ToolPageLayout
      title="Rotate PDF"
      subtitle="Rotate specific pages or the entire PDF document by 90, 180, or 270 degrees."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="rotate"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Rotate PDF', href: '/rotate' }
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
          isLoading={isRotating}
        />

        {fileName && (
          <div className="text-center text-gray-300 text-sm">
            Selected:{" "}
            <span className="font-medium text-gray-100">{fileName}</span>
          </div>
        )}

        {totalPages !== null && (
          <PageRangeInput
            startPage={startPage}
            endPage={endPage}
            setStartPage={setStartPage}
            setEndPage={setEndPage}
            totalPages={totalPages}
          />
        )}

        <div className="space-y-2">
          <Label
            htmlFor="angle"
            className="text-sm font-medium text-gray-200"
          >
            Rotate by:
          </Label>
          <Select value={angle} onValueChange={setAngle}>
            <SelectTrigger
              id="angle"
              className="w-full bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            >
              <SelectValue placeholder="Select angle" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-gray-100 border-gray-600">
              <SelectItem value="90">90° Clockwise</SelectItem>
              <SelectItem value="180">180°</SelectItem>
              <SelectItem value="270">
                270° Clockwise (90° Counter-Clockwise)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}

        <div className="flex justify-center">
          <Button
            onClick={rotatePDF}
            disabled={isRotating || !file || totalPages === null}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
            variant="default"
            size="lg"
            aria-label="Rotate PDF"
          >
            {isRotating ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Rotating...
              </span>
            ) : (
              "Rotate PDF"
            )}
          </Button>
        </div>

        {rotatedUrl && !isRotating && (
          <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="w-full text-center space-y-4 text-gray-100">
              <h3 className="text-2xl font-semibold flex items-center justify-center text-green-400">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                PDF Rotated!
              </h3>
              <p className="text-gray-300">
                Your PDF has been successfully rotated.
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
                  href={rotatedUrl}
                  download={`rotated_${fileName || "document"}.pdf`}
                  className="text-center flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Download Rotated PDF
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}