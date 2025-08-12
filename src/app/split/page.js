"use client";

import React, { useState, useEffect  } from "react";
import { PDFDocument } from "pdf-lib";
import { Download, FileText, Split } from "lucide-react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import PageRangeInput from "@/components/ui/PageRangeInput";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import JSZip from "jszip";
import ToolPageContent from "@/components/ui/ToolPageContent";

export default function SplitPdfPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [splitMode, setSplitMode] = useState("range");
  const [downloadFileName, setDownloadFileName] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleFile = async (selectedFiles) => {
    if (selectedFiles.length === 0) {
      setError("Please select a PDF file.");
      setFile(null);
      setFileName("");
      setPdfUrl(null);
      setTotalPages(0);
      setDownloadFileName("");
      setProgress(0);
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
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const num = pdfDoc.getPageCount();
      setTotalPages(num);
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
      setIsProcessing(false);
    }
  };

  const splitPDF = async () => {
    if (!file) {
      setError("Please upload a PDF first.");
      return;
    }

    setIsProcessing(true);
    setPdfUrl(null);
    setError("");
    setDownloadFileName("");
    setProgress(0);

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
        const start = parseInt(startPage);
        const end = parseInt(endPage);

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
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setDownloadFileName(
          `${fileName.replace(/\.pdf$/i, "")}_pages_${start}-${end}.pdf`
        );
        setProgress(100);
      } else if (splitMode === "all-pages") {
        const zip = new JSZip();
        const numPages = pdfDoc.getPageCount();

        for (let i = 0; i < numPages; i++) {
          const singlePageDoc = await PDFDocument.create();
          const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i]);
          singlePageDoc.addPage(copiedPage);

          const pdfBytes = await singlePageDoc.save();
          const pageNumber = i + 1;
          zip.file(
            `${fileName.replace(/\.pdf$/i, "")}_page_${pageNumber}.pdf`,
            pdfBytes
          );

          setProgress(Math.round(((i + 1) / numPages) * 100));
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        setPdfUrl(url);
        setDownloadFileName(`${fileName.replace(/\.pdf$/i, "")}_pages.zip`);
      }
    } catch (err) {
      setError("Failed to split PDF. Please try again. " + err.message);
      console.error("Split error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const isSplitButtonDisabled =
    isProcessing ||
    !file ||
    totalPages === 0 ||
    (splitMode === "range" && (!startPage || !endPage));

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-8 md:py-12 px-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Split PDF
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Extract specific pages or ranges, or separate all pages. All processing is 100% client-side.
            </p>
          </div>

          <div className="space-y-6">
            <FileDropzone
              accept="application/pdf"
              onFiles={handleFile}
              error={error}
              setError={setError}
              label="Upload PDF"
              description="Drag & drop or click to select a PDF file (Max 50MB)"
              maxSize={50 * 1024 * 1024}
              isLoading={isProcessing && !file}
            />

            {fileName && (
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-500/10 mr-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-100">{fileName}</h3>
                    <p className="text-sm text-gray-400">
                      {totalPages} pages
                    </p>
                  </div>
                </div>
              </div>
            )}

            {totalPages > 0 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-lg font-semibold text-gray-100 mb-3 block">
                    Split Options:
                  </Label>
                  <RadioGroup
                    value={splitMode}
                    onValueChange={setSplitMode}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <div>
                      <RadioGroupItem
                        value="range"
                        id="split-range"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="split-range"
                        className="flex items-center space-x-3 cursor-pointer p-4 rounded-lg border-2 border-gray-600 bg-gray-700 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 transition-colors"
                      >
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-gray-400 peer-data-[state=checked]:border-blue-500">
                          <div className="w-2 h-2 rounded-full bg-blue-500 peer-data-[state=checked]:bg-blue-500"></div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-100">By Page Range</span>
                          <p className="text-xs text-gray-400 mt-1">Extract specific pages</p>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="all-pages"
                        id="split-all-pages"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="split-all-pages"
                        className="flex items-center space-x-3 cursor-pointer p-4 rounded-lg border-2 border-gray-600 bg-gray-700 hover:bg-gray-600 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 transition-colors"
                      >
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-gray-400 peer-data-[state=checked]:border-blue-500">
                          <div className="w-2 h-2 rounded-full bg-blue-500 peer-data-[state=checked]:bg-blue-500"></div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-100">Extract All Pages</span>
                          <p className="text-xs text-gray-400 mt-1">Get each page as separate PDF</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {splitMode === "range" && (
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <Label className="text-gray-200 mb-3 block flex items-center">
                      <Split className="w-4 h-4 mr-2" />
                      Page Range
                    </Label>
                    <PageRangeInput
                      startPage={startPage}
                      endPage={endPage}
                      setStartPage={setStartPage}
                      setEndPage={setEndPage}
                      totalPages={totalPages}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}

            {isProcessing &&
              file && (
                <div className="space-y-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <Progress
                    value={progress}
                    className="h-2.5 bg-gray-700 [&::-webkit-progress-bar]:bg-gray-700 [&::-webkit-progress-value]:bg-blue-500 rounded-full"
                  />
                  <p className="text-sm text-center text-gray-400">
                    Splitting PDF... {progress}%
                  </p>
                </div>
              )}

            {error && (
              <Alert variant="destructive" className="text-center">
                {error}
              </Alert>
            )}

            <div className="flex justify-center">
              <Button
                onClick={splitPDF}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
                variant="default"
                size="lg"
                disabled={isSplitButtonDisabled}
                aria-label="Split PDF"
              >
                {isProcessing && file ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Splitting...
                  </span>
                ) : (
                  "Split PDF"
                )}
              </Button>
            </div>

            {pdfUrl && !isProcessing && (
              <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                <div className="w-full text-center space-y-4 text-gray-100">
                  <h3 className="text-2xl font-semibold flex items-center justify-center">
                    <Download className="w-6 h-6 mr-2 text-green-400" />
                    Split Complete
                  </h3>
                  
                  {splitMode === "range" && (
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <p className="text-gray-300 mb-3">Pages {startPage} to {endPage} extracted</p>
                      <iframe
                        src={pdfUrl}
                        width="100%"
                        height="400px"
                        className="border border-gray-600 rounded-md shadow-inner"
                        title="PDF Preview"
                      ></iframe>
                    </div>
                  )}
                  
                  {splitMode === "all-pages" && (
                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 text-center">
                      <p className="text-gray-300 mb-4">
                        Your PDF has been split into individual pages and compressed into a ZIP file.
                      </p>
                      <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-500/10 mb-4">
                        <FileText className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="text-gray-400 text-sm">
                        {totalPages} individual PDF files
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button asChild variant="success" size="lg" className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl">
                    <a
                      href={pdfUrl}
                      download={downloadFileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download {splitMode === "range" ? "Split PDF" : "ZIP of Pages"}
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ToolPageContent
        toolName="Split PDF"
        toolDescription="Easily split your PDF documents into multiple files. Extract specific pages or ranges, or separate every page into its own PDF. Our online PDF splitter is fast, secure, and processes all your files directly in your browser, ensuring your privacy. Perfect for creating smaller documents, reorganizing content, or sharing only relevant sections."
        currentTool="split"
        steps={[
          'Upload your PDF file by dragging it into the dropzone or clicking to select it.',
          'Choose your splitting option: By Page Range to extract a specific set of pages, or Extract All Pages to get each page as a separate PDF.',
          'If splitting by page range, enter the start and end page numbers you wish to extract.',
          'Click the Split PDF button. The tool will process your document instantly.',
          'Download your newly split PDF file(s). If you chose Extract All Pages, you will receive a ZIP archive containing individual PDF files.'
        ]}
        faqs={[
          { question: "Is it free to split PDF files?", answer: "Yes, our PDF splitter is 100% free to use with no hidden fees or limits." },
          { question: "Are my files secure and private?", answer: "All splitting is done client-side in your browser. Your files never leave your device." },
          { question: "Can I split large PDFs?", answer: "You can split PDFs up to 50MB in size. For very large files, consider splitting in batches." },
          { question: "Can I extract non-consecutive pages?", answer: "This tool currently supports extracting a range or all pages. For custom selection, split in multiple steps." },
          { question: "What format will my split files be in?", answer: "You will receive standard PDF files, or a ZIP archive if extracting all pages." }
        ]}
        relatedLinks={[
          { name: "Merge PDF", url: "/merge" },
          { name: "Compress PDF", url: "/compress" }
        ]}
      />
    </>
  );
}