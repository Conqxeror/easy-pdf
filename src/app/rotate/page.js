"use client";

import { Metadata } from 'next';
import { useState, useEffect } from "react";


import FileDropzone from "@/components/ui/FileDropzone";
import { PDFDocument, Rotation } from "pdf-lib"; // Import Rotation enum
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
// import Loader from "@/components/ui/Loader"; // Removed Loader for consistency
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription, // Import CardDescription
} from "@/components/ui/card";
import { Label } from "@/components/ui/label"; // Import Label
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import PageRangeInput from "@/components/ui/PageRangeInput"; // Assuming this component is themed correctly
import ToolPageContent from "@/components/ui/ToolPageContent";

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

      const rotationAngle = parseInt(angle, 10);

      // Loop through the selected pages (0-based for pdf-lib)
      for (let i = start - 1; i < end; i++) {
        const page = pdfDoc.getPage(i);
        // Add the new rotation angle to the existing rotation angle
        // pdf-lib's setRotation takes a Rotation object.
        // Rotation.of() is used directly as it's the most robust way to set rotation.
        page.setRotation(
          Rotation.of((page.getRotation().angle + rotationAngle) % 360)
        );
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setRotatedUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(
        "Failed to rotate PDF. The file might be corrupted or cannot be processed."
      );
      console.error("Rotate PDF error:", e);
    } finally {
      setIsRotating(false);
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
              Rotate PDF
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Rotate specific pages or the entire PDF document by 90, 180, or
              270 degrees.
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
              isLoading={isRotating} // Use isRotating for FileDropzone isLoading state
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

            <Button
              onClick={rotatePDF}
              disabled={isRotating || !file || totalPages === null} // Disable if file not loaded
              className="w-full max-w-xs mx-auto block"
              variant="default" // Consistent styling for action button
              size="lg"
              aria-label="Rotate PDF"
            >
              {isRotating ? "Rotating..." : "Rotate PDF"}
            </Button>
          </CardContent>

          {rotatedUrl && !isRotating && (
            <CardFooter className="flex flex-col gap-4 border-t border-gray-700 pt-6">
              <div className="w-full text-center space-y-2 text-gray-100">
                <h3 className="text-xl font-semibold">PDF Rotated!</h3>
                <p className="text-sm text-gray-400">
                  Your PDF has been successfully rotated.
                </p>
              </div>
              <Button
                asChild
                variant="success"
                className="w-full max-w-xs mx-auto block"
              >
                <a
                  href={rotatedUrl}
                  download={`rotated_${fileName || "document"}.pdf`}
                  className="text-center"
                >
                  Download Rotated PDF
                </a>
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>
      <ToolPageContent
        toolName="Rotate PDF"
        toolDescription="Easily rotate pages in your PDF documents. Whether you need to adjust the orientation of a single page, a specific range, or the entire document, our online tool allows you to rotate by 90, 180, or 270 degrees. All processing is done securely in your browser, ensuring your files remain private."
        steps={[
          "Upload your PDF file by dragging it into the dropzone or clicking to select.",
          "Specify the page range you want to rotate. You can choose to rotate all pages, or a custom range (e.g., pages 5-10).",
          "Select the rotation angle: 90° clockwise, 180°, or 270° clockwise (90° counter-clockwise).",
          "Click the 'Rotate PDF' button to apply the changes.",
          "Download your newly rotated PDF file.",
        ]}
        faqs={[
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
        ]}
      />
    </>
  );
}