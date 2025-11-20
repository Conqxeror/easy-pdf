"use client";

import React, { useState, useEffect, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";

const ACCEPT = ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,application/vnd.ms-excel";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB guard

export default function XlsxToCsvClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { };
      }
    };
  }, [downloadUrl]);

  const handleFiles = useCallback((incomingFiles) => {
    setError("");
    if (!incomingFiles?.length) { setFile(null); return; }

    const selected = incomingFiles[0];
    if (selected.size > MAX_FILE_SIZE) {
      setError("File too large. Please use files under 50MB for client-side processing.");
      return;
    }

    if (!selected.name.toLowerCase().endsWith(".xlsx") && !selected.name.toLowerCase().endsWith(".xls")) {
      setError("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    setFile(selected);
  }, []);

  const convertXlsxToCsv = async () => {
    if (!file) {
      setError("Please upload an Excel file first.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setProgress(10);

    try {
      // Load the xlsx library
      const xlsxModule = await import("xlsx");
      const XLSX = xlsxModule.default || xlsxModule;
      setProgress(30);

      // Read the file
      const arrayBuffer = await file.arrayBuffer();
      setProgress(50);

      // Parse the workbook
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      setProgress(70);

      // Convert to CSV
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

      // Create download blob
      const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
      const url = safeCreateObjectURL(blob);
      setDownloadUrl(url);
      setProgress(100);

    } catch (err) {
      console.error("Conversion error:", err);
      if (err.message && err.message.includes("Cannot find module")) {
        setError("The xlsx library is required for this tool. Please install it using npm install xlsx.");
      } else {
        setError("Failed to convert file. Please ensure it is a valid Excel file.");
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <ToolPageLayout
      title="XLSX to CSV Converter"
      subtitle="Convert Excel spreadsheets to CSV format instantly."
      toolName="XLSX to CSV"
      toolDescription="Convert Excel files (XLSX/XLS) to Comma Separated Values (CSV) format directly in your browser. Fast, secure, and private conversion without uploading your files to any server."
      currentTool="xlsx-to-csv"
      steps={[
        "Upload your Excel file (.xlsx or .xls) by dragging it into the dropzone.",
        "Click Convert to CSV to process the file locally.",
        "Download the resulting CSV file instantly."
      ]}
      faqs={[
        {
          question: "Is my data secure?",
          answer: "Yes! All processing happens entirely in your browser. Your Excel files are never uploaded to any server."
        },
        {
          question: "Does it support multiple sheets?",
          answer: "Currently, the tool converts the first sheet of your Excel workbook to CSV format."
        },
        {
          question: "Do I need to install anything?",
          answer: "No, the tool runs directly in your web browser. However, the underlying library must be present in the application build."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "XLSX to CSV", href: "/xlsx-to-csv" }
      ]}
    >
      <div className="space-y-6">
        <FileDropzone
          accept={ACCEPT}
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload Excel File"
          description="Drag & drop or click to select an Excel file (max 50MB)"
          maxSize={MAX_FILE_SIZE}
          isLoading={isProcessing}
        />

        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Converting...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button
            onClick={convertXlsxToCsv}
            disabled={!file || isProcessing}
            size="lg"
          >
            {isProcessing ? "Converting..." : "Convert to CSV"}
          </Button>

          {downloadUrl && (
            <Button asChild variant="success" size="lg">
              <a
                href={downloadUrl}
                download={`${sanitizeFileName(file?.name?.replace(/\.[^/.]+$/, "") || "converted")}.csv`}
              >
                Download CSV
              </a>
            </Button>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
