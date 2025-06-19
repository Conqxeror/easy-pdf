"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjs from "pdfjs-dist";
import MetaHead from "@/components/ui/MetaHead";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JSZip from "jszip";

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfToJpgPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [images, setImages] = useState([]);
  const [quality, setQuality] = useState(85);
  const [selectedPages, setSelectedPages] = useState("all");
  const [totalPages, setTotalPages] = useState(0);

  const handleFiles = async (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError("");
    setImages([]);
    setIsProcessing(true);

    try {
      // Get total page count first
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      setTotalPages(pdf.numPages);
    } catch (err) {
      setError("Failed to load PDF. Please ensure it's a valid PDF file.");
      setFile(null);
      setFileName("");
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToJpg = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    setError("");
    setIsProcessing(true);
    setImages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      
      const pagesToConvert = selectedPages === "all" 
        ? Array.from({ length: pdf.numPages }, (_, i) => i + 1)
        : [parseInt(selectedPages)];

      const zip = new JSZip();
      const convertedImages = [];

      for (const pageNumber of pagesToConvert) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2.0 });
        
        // Create canvas for rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        // Convert canvas to JPG
        const imageData = canvas.toDataURL('image/jpeg', quality / 100);
        const base64Data = imageData.split(',')[1];
        const blob = await fetch(imageData).then(res => res.blob());
        
        const fileName = `page_${pageNumber}.jpg`;
        zip.file(fileName, base64Data, { base64: true });
        
        convertedImages.push({
          pageNumber,
          url: URL.createObjectURL(blob),
          fileName,
          size: blob.size
        });
        
        // Update progress
        const progress = Math.round((pageNumber / pagesToConvert.length) * 100);
        setIsProcessing({
          loading: true,
          progress,
          currentPage: pageNumber,
          totalPages: pagesToConvert.length
        });
      }

      // Create zip file if converting multiple pages
      if (pagesToConvert.length > 1) {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);
        setImages([...convertedImages, { isZip: true, url: zipUrl, fileName: `${file.name.replace('.pdf', '')}_images.zip` }]);
      } else {
        setImages(convertedImages);
      }

    } catch (err) {
      console.error("Conversion error:", err);
      setError("Failed to convert PDF to JPG. The file may be corrupted or password protected.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
  };

  return (
    <>
      <MetaHead
        title="PDF to JPG Converter – Free Online Tool | PDF Toolkit"
        description="Convert PDF pages to high-quality JPG images, 100% client-side. No uploads, no privacy risk. Fast, free, and India-optimized."
        url="https://yourdomain.com/pdf-to-jpg"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "PDF to JPG Converter",
          description: "Convert PDF pages to JPG images in your browser",
          url: "https://yourdomain.com/pdf-to-jpg",
        }}
      />

      <main className="container max-w-4xl py-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              PDF to JPG Converter
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <FileDropzone
              accept="application/pdf"
              multiple={false}
              onFiles={handleFiles}
              error={error}
              setError={setError}
              label="Choose a PDF File"
              description="Drag & drop or click to select a PDF file"
              maxSize={50 * 1024 * 1024}
            />

            {fileName && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Selected file:</span>
                  <span className="font-medium">{fileName}</span>
                </div>
                {totalPages > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pages to Convert</Label>
                      <Select 
                        value={selectedPages}
                        onValueChange={setSelectedPages}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select pages" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Pages</SelectItem>
                          {Array.from({ length: totalPages }, (_, i) => (
                            <SelectItem key={i+1} value={`${i+1}`}>Page {i+1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Image Quality ({quality}%)</Label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Converting page {isProcessing.currentPage} of {isProcessing.totalPages}</span>
                  <span className="font-medium">{isProcessing.progress}%</span>
                </div>
                <Progress value={isProcessing.progress} className="h-2" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">{error}</Alert>
            )}

            <Button
              onClick={convertToJpg}
              disabled={isProcessing || !file}
              className="w-full"
              size="lg"
            >
              {isProcessing ? "Converting..." : "Convert to JPG"}
            </Button>
          </CardContent>

          {images.length > 0 && (
            <CardFooter className="flex flex-col gap-6 border-t border-gray-700 pt-6">
              <h3 className="text-xl font-semibold text-center">
                {images.length > 1 ? "Download Images" : "Download Image"}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {images.filter(img => !img.isZip).map((image, index) => (
                  <div key={index} className="border border-gray-600 rounded-md p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <img 
                        src={image.url} 
                        alt={`Page ${image.pageNumber}`}
                        className="h-16 w-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{image.fileName}</p>
                        <p className="text-sm text-gray-400">{formatFileSize(image.size)}</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <a href={image.url} download={image.fileName}>
                        Download
                      </a>
                    </Button>
                  </div>
                ))}
              </div>

              {images.find(img => img.isZip) && (
                <div className="w-full text-center">
                  <Button asChild variant="success" className="w-full max-w-md">
                    <a 
                      href={images.find(img => img.isZip).url}
                      download={images.find(img => img.isZip).fileName}
                    >
                      Download All as ZIP
                    </a>
                  </Button>
                </div>
              )}
            </CardFooter>
          )}
        </Card>
      </main>
    </>
  );
}