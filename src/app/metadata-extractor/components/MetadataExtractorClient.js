"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert } from "@/components/ui/alert";
import { Info } from "lucide-react";
import EXIF from "exif-js";

export default function MetadataExtractorClient() {
  const [metadata, setMetadata] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files) => {
    if (!files?.length) return;
    const selected = files[0];
    setError("");
    setMetadata(null);
    setIsProcessing(true);

    try {
      if (selected.type.startsWith("image/")) {
        await extractImageMetadata(selected);
      } else if (selected.type === "application/pdf") {
        await extractPdfMetadata(selected);
      } else {
        setError("Unsupported file type. Please upload an image or PDF.");
        setIsProcessing(false);
      }
    } catch {
      setError("Failed to extract metadata.");
      setIsProcessing(false);
    }
  };

  const extractImageMetadata = (file) => {
    return new Promise((resolve) => {
      // Basic file info
      const basicInfo = {
        "File Name": file.name,
        "File Size": formatBytes(file.size),
        "File Type": file.type,
        "Last Modified": new Date(file.lastModified).toLocaleString(),
      };

      EXIF.getData(file, function () {
        const exifData = EXIF.getAllTags(this);

        // Filter out binary data or huge strings
        const cleanExif = {};
        for (const key in exifData) {
          if (key === "MakerNote" || key === "UserComment" || typeof exifData[key] === 'object') continue;
          cleanExif[key] = exifData[key];
        }

        setMetadata({ ...basicInfo, ...cleanExif });
        setIsProcessing(false);
        resolve();
      });
    });
  };

  const extractPdfMetadata = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const data = await pdf.getMetadata();

      const info = {
        "File Name": file.name,
        "File Size": formatBytes(file.size),
        "Page Count": pdf.numPages,
        "PDF Version": data.info.PDFFormatVersion,
        "Title": data.info.Title || "-",
        "Author": data.info.Author || "-",
        "Subject": data.info.Subject || "-",
        "Keywords": data.info.Keywords || "-",
        "Creator": data.info.Creator || "-",
        "Producer": data.info.Producer || "-",
        "Creation Date": data.info.CreationDate ? formatPdfDate(data.info.CreationDate) : "-",
        "Modification Date": data.info.ModDate ? formatPdfDate(data.info.ModDate) : "-",
      };

      setMetadata(info);
    } catch {
      throw new Error("Could not read PDF metadata");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const formatPdfDate = (dateStr) => {
    if (!dateStr) return "-";
    // PDF date format: D:YYYYMMDDHHmmSSOHH'mm'
    // Simple cleanup
    return dateStr.replace("D:", "").replace(/'/g, "");
  };

  return (
    <ToolPageLayout
      title="Metadata Extractor"
      subtitle="View hidden metadata from images and PDF files."
      toolName="Metadata Extractor"
      toolDescription="Extract and view EXIF data from images (camera model, settings, location) and metadata from PDF documents (author, creator, dates). 100% client-side."
      currentTool="metadata-extractor"
      steps={[
        "Upload an image (JPG, PNG) or PDF file.",
        "Wait for the tool to analyze the file.",
        "View the extracted metadata in the table below."
      ]}
      faqs={[
        {
          question: "What is metadata?",
          answer: "Metadata is 'data about data'. For images, it can include camera settings, date taken, and sometimes GPS location. For PDFs, it includes author, title, and creation dates."
        },
        {
          question: "Is my file uploaded?",
          answer: "No, all analysis happens in your browser."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Metadata Extractor", href: "/metadata-extractor" }
      ]}
    >
      <div className="space-y-8">
        <FileDropzone
          accept=".jpg,.jpeg,.png,.pdf"
          multiple={false}
          onFiles={handleFiles}
          label="Upload File"
          description="Drag & drop an image or PDF to view metadata"
          isLoading={isProcessing}
        />

        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        {metadata && (
          <Card className="animate-in fade-in slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                File Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Property</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(metadata).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{key}</TableCell>
                      <TableCell className="break-all">{value?.toString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolPageLayout>
  );
}
