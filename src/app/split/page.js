"use client";

import { Metadata } from 'next';
import { useState, useEffect } from "react";


import { PDFDocument } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
// import Loader from "@/components/ui/Loader"; // Replaced with progress bar
import PageRangeInput from "@/components/ui/PageRangeInput";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label"; // Import Label
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Import RadioGroup components
import { Progress } from "@/components/ui/progress"; // Import Progress
import JSZip from "jszip"; // Assuming JSZip is installed (npm install jszip)
import ToolPageContent from "@/components/ui/ToolPageContent";

export default function SplitPdfPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null); // URL for the resulting PDF or ZIP
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); // Renamed from 'loading' for consistency
  const [startPage, setStartPage] = useState(""); // 1-based string
  const [endPage, setEndPage] = useState(""); // 1-based string
  const [totalPages, setTotalPages] = useState(0);
  const [splitMode, setSplitMode] = useState("range"); // "range" or "all-pages"
  const [downloadFileName, setDownloadFileName] = useState("");
  const [progress, setProgress] = useState(0); // For conversion progress

  // Cleanup function for object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]); // Run when pdfUrl changes or component unmounts

  /**
   * Handles file selection from the dropzone.
   * Loads the PDF to get total pages.
   * @param {File[]} selectedFiles - An array containing the selected PDF file.
   */
  const handleFile = async (selectedFiles) => {
    if (selectedFiles.length === 0) {
      setError("Please select a PDF file.");
      setFile(null);
      setFileName("");
      setPdfUrl(null);
      setTotalPages(0);
      setDownloadFileName("");
      setProgress(0); // Reset progress
      return;
    }

    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError("");
    setPdfUrl(null);
    setStartPage("");
    setEndPage("");
    setTotalPages(0);
    setIsProcessing(true); // Indicate loading of PDF, not yet splitting

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const num = pdfDoc.getPageCount();
      setTotalPages(num);
      // Automatically set default range to all pages when PDF is loaded
      setStartPage("1");
      setEndPage(String(num));
    } catch (err) {
      setError(
        "Failed to load PDF. Please ensure it's a valid PDF file. " +
          err.message
      );
      console.error("PDF load error:", err);
      setFile(null);
      setFileName("");
      setTotalPages(0);
    } finally {
      setIsProcessing(false); // Done loading PDF
    }
  };

  /**
   * Splits the uploaded PDF based on the selected mode (range or all pages).
   */
  const splitPDF = async () => {
    if (!file) {
      setError("Please upload a PDF first.");
      return;
    }

    setIsProcessing(true);
    setPdfUrl(null); // Clear previous output URL
    setError("");
    setDownloadFileName("");
    setProgress(0); // Reset progress for splitting operation

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      if (splitMode === "range") {
        if (!startPage || !endPage) {
          setError(
            "Please enter both start and end page numbers for range splitting."
          );
          setIsProcessing(false);
          return;
        }
        const start = parseInt(startPage); // 1-based
        const end = parseInt(endPage); // 1-based

        if (
          isNaN(start) ||
          isNaN(end) ||
          start < 1 ||
          end < 1 ||
          start > end ||
          end > totalPages
        ) {
          setError(
            `Invalid page range. Please enter valid page numbers between 1 and ${totalPages}.`
          );
          setIsProcessing(false);
          return;
        }

        const newPdfDoc = await PDFDocument.create();
        // Convert to 0-based indices for pdf-lib
        const pageIndicesToCopy = Array.from(
          { length: end - start + 1 },
          (_, i) => start - 1 + i
        );
        const copiedPages = await newPdfDoc.copyPages(
          pdfDoc,
          pageIndicesToCopy
        );
        copiedPages.forEach((page) => newPdfDoc.addPage(page));

        const pdfBytes = await newPdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        setPdfUrl(URL.createObjectURL(blob));
        setDownloadFileName(
          `${file.name.replace(/\.pdf$/, "")}pages${start}-to-${end}.pdf`
        );
        setProgress(100); // Complete progress for range split
      } else if (splitMode === "all-pages") {
        const zip = new JSZip();
        const pageCount = pdfDoc.getPageCount();
        let pagesProcessed = 0;

        for (let i = 0; i < pageCount; i++) {
          const newPdfDoc = await PDFDocument.create();
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]); // Copy page by 0-based index
          newPdfDoc.addPage(copiedPage);
          const pdfBytes = await newPdfDoc.save();

          zip.file(
            `${file.name.replace(/\.pdf$/, "")}page-${i + 1}.pdf`,
            pdfBytes
          );

          pagesProcessed++;
          setProgress(Math.round((pagesProcessed / pageCount) * 100)); // Update progress
        }

        const zipBlob = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 9 },
        });
        setPdfUrl(URL.createObjectURL(zipBlob));
        setDownloadFileName(
          `${file.name.replace(/\.pdf$/, "")}split_pages.zip`
        );
        setProgress(100); // Complete progress for all-pages split
      }
    } catch (err) {
      console.error("Error splitting PDF:", err);
      setError("Failed to split PDF. Please try again.");
      setPdfUrl(null);
    } finally {
      setIsProcessing(false);
      // Reset progress after a short delay
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // Determine if the split button should be disabled
  const isSplitButtonDisabled =
    isProcessing || // If overall processing (loading or splitting)
    !file || // No file uploaded
    totalPages === 0 || // PDF not loaded or has no pages
    (splitMode === "range" && // If range mode, check page inputs
      (!startPage ||
        !endPage ||
        isNaN(parseInt(startPage)) ||
        isNaN(parseInt(endPage)) ||
        parseInt(startPage) < 1 ||
        parseInt(endPage) < 1 ||
        parseInt(startPage) > parseInt(endPage) ||
        parseInt(endPage) > totalPages));

  return (
    <>
      <main className="flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        {" "}
        {/* Centering the main card */}
        <Card className="w-full bg-gray-800 border-gray-700 shadow-lg rounded-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-100">
              Split PDF
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 mt-2">
              Extract specific pages or ranges, or separate all pages. All
              processing is 100% client-side.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6 space-y-6">
            <FileDropzone
              accept="application/pdf"
              onFiles={handleFile}
              error={error}
              setError={setError}
              label="Upload PDF"
              description="Drag & drop or click to select a PDF file (Max 50MB)"
              maxSize={50 * 1024 * 1024}
              isLoading={isProcessing && !file} // Show loading for file upload (initial processing)
            />

            {fileName && (
              <div className="text-center text-gray-300 text-sm">
                Selected file:{" "}
                <span className="font-semibold text-gray-100">{fileName}</span>
              </div>
            )}

            {totalPages > 0 && (
              <>
                <div className="w-full flex flex-col items-center space-y-4">
                  <Label className="text-lg font-semibold text-gray-100">
                    Split Options:
                  </Label>
                  <RadioGroup
                    value={splitMode}
                    onValueChange={setSplitMode}
                    className="flex gap-4 p-2 rounded-md bg-gray-700 border border-gray-600"
                  >
                    <Label
                      htmlFor="split-range"
                      className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-600 has-[input:checked]:bg-blue-600 has-[input:checked]:text-white transition-colors"
                    >
                      <RadioGroupItem
                        value="range"
                        id="split-range"
                        className="peer sr-only" // Hidden radio button
                      />
                      <div className="w-4 h-4 rounded-full border-2 border-gray-400 peer-data-[state=checked]:bg-white peer-data-[state=checked]:border-blue-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600 peer-data-[state=checked]:bg-white"></div>
                      </div>
                      <span className="ml-2 text-gray-300 peer-data-[state=checked]:text-white">
                        By Page Range
                      </span>
                    </Label>
                    <Label
                      htmlFor="split-all-pages"
                      className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-600 has-[input:checked]:bg-blue-600 has-[input:checked]:text-white transition-colors"
                    >
                      <RadioGroupItem
                        value="all-pages"
                        id="split-all-pages"
                        className="peer sr-only" // Hidden radio button
                      />
                      <div className="w-4 h-4 rounded-full border-2 border-gray-400 peer-data-[state=checked]:bg-white peer-data-[state=checked]:border-blue-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600 peer-data-[state=checked]:bg-white"></div>
                      </div>
                      <span className="ml-2 text-gray-300 peer-data-[state=checked]:text-white">
                        Extract All Pages
                      </span>
                    </Label>
                  </RadioGroup>
                </div>

                {splitMode === "range" && (
                  <div className="mt-4 w-full flex justify-center">
                    <PageRangeInput
                      startPage={startPage}
                      endPage={endPage}
                      setStartPage={setStartPage}
                      setEndPage={setEndPage}
                      totalPages={totalPages}
                      className="w-full max-w-xs" // Apply consistent width
                    />
                  </div>
                )}
              </>
            )}

            {isProcessing &&
              file && ( // Show progress only when splitting (file is loaded)
                <div className="space-y-2 w-full max-w-xs text-center">
                  <Progress
                    value={progress}
                    className="h-2 bg-gray-600 [&::-webkit-progress-bar]:bg-gray-600 [&::-webkit-progress-value]:bg-blue-500"
                  />
                  <p className="text-sm text-gray-400">
                    Splitting PDF... {progress}%
                  </p>
                </div>
              )}

            {error && (
              <Alert variant="destructive" className="mt-4 text-center">
                {error}
              </Alert>
            )}

            <Button
              onClick={splitPDF}
              className="mt-6 w-full max-w-xs mx-auto block bg-blue-700 text-white" // Consistent styling
              variant="default" // Using default variant
              size="lg"
              disabled={isSplitButtonDisabled}
              aria-label="Split PDF"
            >
              {isProcessing && file ? "Splitting..." : "Split PDF"}
            </Button>
          </CardContent>

          {pdfUrl && !isProcessing && (
            <CardFooter className="flex flex-col items-center mt-6 border-t border-gray-700 pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-100">
                Result:
              </h2>
              {splitMode === "range" && (
                <iframe
                  src={pdfUrl}
                  width="100%"
                  height="500px"
                  className="border border-gray-600 rounded-md mb-4 shadow-inner"
                  title="PDF Preview"
                ></iframe>
              )}
              {splitMode === "all-pages" && (
                <p className="text-gray-300 mb-4 text-center">
                  Your PDF has been split into individual pages and compressed
                  into a ZIP file.
                </p>
              )}
              <Button asChild variant="success" className="w-full max-w-xs">
                {" "}
                {/* Consistent styling */}
                <a
                  href={pdfUrl}
                  download={downloadFileName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    {" "}
                    {/* Added span to wrap children */}
                    Download{" "}
                    {splitMode === "range" ? "Split PDF" : "ZIP of Pages"}
                  </span>
                </a>
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>
      <ToolPageContent
        toolName="Split PDF"
        toolDescription="Easily split your PDF documents into multiple files. Extract specific pages or ranges, or separate every page into its own PDF. Our online PDF splitter is fast, secure, and processes all your files directly in your browser, ensuring your privacy. Perfect for creating smaller documents, reorganizing content, or sharing only relevant sections."
        steps={[
          "Upload your PDF file by dragging it into the dropzone or clicking to select it.",
          "Choose your splitting option: 'By Page Range' to extract a specific set of pages, or 'Extract All Pages' to get each page as a separate PDF.",
          "If splitting by page range, enter the start and end page numbers you wish to extract.",
          "Click the 'Split PDF' button. The tool will process your document instantly.",
          "Download your newly split PDF file(s). If you chose 'Extract All Pages', you will receive a ZIP archive containing individual PDF files.",
        ]}
        faqs={[
          {
            question: "Is it free to split PDF files?",
            answer:
              "Yes, our Split PDF tool is completely free to use. You can split as many PDF files as you need without any hidden costs or limitations.",
          },
          {
            question: "Are my files secure when splitting PDFs?",
            answer:
              "Absolutely. Your privacy is our top priority. All PDF processing, including splitting, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential.",
          },
          {
            question: "Can I extract multiple page ranges from one PDF?",
            answer:
              "Currently, our tool allows you to extract one continuous page range at a time. To extract multiple non-contiguous ranges, you would need to perform the operation multiple times.",
          },
          {
            question: "What happens if I choose 'Extract All Pages'?",
            answer:
              "If you select 'Extract All Pages', each page of your original PDF will be converted into a separate PDF file. These individual files will then be compressed into a single ZIP archive for easy download.",
          },
          {
            question: "Is there a file size limit for splitting PDFs?",
            answer:
              "Yes, the maximum file size for a PDF to be split is 50MB. For larger files, you might experience slower processing times.",
          },
        ]}
      />
    </>
  );
}