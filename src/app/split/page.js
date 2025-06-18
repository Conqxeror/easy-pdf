"use client";
import { useState } from "react";
import MetaHead from "@/components/ui/MetaHead";
import { PDFDocument } from "pdf-lib";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import PageRangeInput from "@/components/ui/PageRangeInput";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import JSZip from "jszip"; // Assuming JSZip is installed (npm install jszip)

export default function SplitPdfPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [splitMode, setSplitMode] = useState("range"); // "range" or "all-pages"
  const [downloadFileName, setDownloadFileName] = useState("");

  const handleFile = async (selectedFiles) => {
    if (selectedFiles.length === 0) {
      setError("Please select a PDF file.");
      setFile(null);
      setFileName("");
      setPdfUrl(null);
      setTotalPages(0);
      setDownloadFileName("");
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
    setLoading(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdfDoc.getPageCount());
      // Future: Automatically set a default range like all pages or the first page if desired.
      // setStartPage("1");
      // setEndPage(pdfDoc.getPageCount().toString());
    } catch (err) {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      setFile(null);
      setFileName("");
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const splitPDF = async () => {
    if (!file) {
      setError("Please upload a PDF first.");
      return;
    }

    setLoading(true);
    setPdfUrl(null);
    setError("");
    setDownloadFileName("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      if (splitMode === "range") {
        if (!startPage || !endPage) {
          setError("Please enter both start and end page numbers.");
          setLoading(false);
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
            "Invalid page range. Please enter valid page numbers within the document."
          );
          setLoading(false);
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
        setPdfUrl(URL.createObjectURL(blob));
        setDownloadFileName(`split-pages-${start}-to-${end}.pdf`);
      } else if (splitMode === "all-pages") {
        const zip = new JSZip();
        const pageCount = pdfDoc.getPageCount();

        for (let i = 0; i < pageCount; i++) {
          const newPdfDoc = await PDFDocument.create();
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
          newPdfDoc.addPage(copiedPage);
          const pdfBytes = await newPdfDoc.save();
          zip.file(
            `${fileName.replace(/\.pdf$/, "")}_page-${i + 1}.pdf`,
            pdfBytes
          );
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        setPdfUrl(URL.createObjectURL(zipBlob));
        setDownloadFileName(
          `${fileName.replace(/\.pdf$/, "")}_split_pages.zip`
        );
      }
    } catch (err) {
      console.error("Error splitting PDF:", err);
      setError("Failed to split PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSplitButtonDisabled =
    loading ||
    !file ||
    (splitMode === "range" &&
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
      <MetaHead
        title="Split PDF – Free, Fast & Secure | PDF Toolkit"
        description="Split PDF documents into multiple files, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized."
        url="https://yourdomain.com/split"
        ogImage="/public/og-image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Split PDF",
          description:
            "Split PDF documents into multiple files, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized.",
          url: "https://yourdomain.com/split",
        }}
      />

      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-gray-800 text-white shadow-lg rounded-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-extrabold text-blue-400">
              Split PDF
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 mt-2">
              Extract specific pages or ranges, or separate all pages. 100%
              client-side.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6">
            <FileDropzone
              accept="application/pdf"
              onFiles={handleFile}
              error={error}
              setError={setError}
              label="Upload PDF"
              description="Drag & drop or click to select a PDF file."
            />

            {loading && !file && (
              <Loader label="Loading PDF..." className="mt-6" />
            )}

            {fileName && (
              <div className="mt-4 text-center text-gray-300">
                Selected file:{" "}
                <span className="font-semibold text-blue-300">{fileName}</span>
              </div>
            )}

            {totalPages > 0 && (
              <>
                <div className="mt-6 w-full flex flex-col items-center">
                  <label className="text-lg font-semibold mb-3">
                    Split Options:
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="range"
                        checked={splitMode === "range"}
                        onChange={() => setSplitMode("range")}
                        className="form-radio text-blue-600"
                      />
                      <span className="ml-2 text-gray-300">By Page Range</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="all-pages"
                        checked={splitMode === "all-pages"}
                        onChange={() => setSplitMode("all-pages")}
                        className="form-radio text-blue-600"
                      />
                      <span className="ml-2 text-gray-300">
                        Extract All Pages
                      </span>
                    </label>
                  </div>
                </div>

                {splitMode === "range" && (
                  <div className="mt-6 w-full flex justify-center">
                    <PageRangeInput
                      startPage={startPage}
                      endPage={endPage}
                      setStartPage={setStartPage}
                      setEndPage={setEndPage}
                      totalPages={totalPages}
                      className="w-full max-w-xs"
                    />
                  </div>
                )}
              </>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4 text-center">
                {error}
              </Alert>
            )}

            <Button
              onClick={splitPDF}
              className="mt-6 w-full max-w-xs"
              disabled={isSplitButtonDisabled}
            >
              {loading && file ? "Splitting..." : "Split PDF"}
            </Button>
          </CardContent>

          {pdfUrl && (
            <CardFooter className="flex flex-col items-center mt-6 border-t border-gray-700 pt-6">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">
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
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a
                  href={pdfUrl}
                  download={downloadFileName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download{" "}
                  {splitMode === "range" ? "Split PDF" : "ZIP of Pages"}
                </a>
              </Button>
            </CardFooter>
          )}

          {loading && file && !pdfUrl && (
            <Loader label="Splitting PDF..." className="mt-4" />
          )}
        </Card>
      </main>
    </>
  );
}
