"use client";

import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";

const ACCEPT = ".csv,text/csv";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB guard

export default function CsvToXlsxClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { };
      }
    };
  }, [downloadUrl]);

  const handleFiles = (files) => {
    setError("");
    if (!files?.length) {
      setFile(null);
      setPreviewData(null);
      setDownloadUrl(null);
      return;
    }

    const selected = files[0];
    if (selected.size > MAX_FILE_SIZE) {
      setError("File too large. Please use CSV files under 50MB for client-side processing.");
      return;
    }

    if (!selected.name.toLowerCase().endsWith('.csv')) {
      setError("Please upload a CSV file (.csv)");
      return;
    }

    setFile(selected);
    setDownloadUrl(null);
    setPreviewData(null);

    // Preview the CSV data
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target.result;
      try {
        // Parse CSV to show preview (simple approach)
        const lines = csvText.split(/\r?\n/);
        const headers = lines[0]?.split(',').map(h => h.trim().replace(/^"|"$/g, '')) || [];
        const rows = lines.slice(1, 6).map(line =>
          line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
        ).filter(row => row.length > 1 || row[0]); // Filter out empty lines

        setPreviewData({
          headers,
          rows,
          totalRows: lines.length - 1  // Subtract header row
        });
      } catch {
        setError("Failed to parse CSV file. Please ensure it's a valid CSV format.");
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    };
    reader.readAsText(selected);
  };

  const convertCsvToXlsx = async () => {
    if (!file) {
      setError("Please upload a CSV file first.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Load the xlsx library
      const xlsxModule = await import("xlsx");
      const XLSX = xlsxModule.default || xlsxModule;

      // Read the CSV file content
      const csvText = await file.text();

      // Parse the CSV using XLSX
      const workbook = XLSX.read(csvText, { type: "string", delimiter: "," });

      // Convert to XLSX format
      const xlsxBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

      // Create a blob
      const xlsxBlob = new Blob([xlsxBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

      // Create download URL
      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { };
      }
      const newDownloadUrl = safeCreateObjectURL(xlsxBlob);
      setDownloadUrl(newDownloadUrl);

      setError("");
    } catch (err) {
      console.error("CSV to XLSX conversion failed", err);
      setError("Failed to convert CSV to XLSX. Make sure the xlsx library is installed: npm install xlsx");
    } finally {
      setIsProcessing(false);
    }
  };

  const toolName = "CSV to Excel Converter";
  const toolDescription = "Convert CSV files to Excel spreadsheet format (XLSX). Transform comma-separated data into structured Excel workbooks with proper formatting and cell types.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={[
        "Upload a CSV file via drag & drop or the file picker",
        "Preview the CSV data structure",
        "Click 'Convert to XLSX' to generate the Excel file",
        "Download the converted XLSX file"
      ]}
      faqs={[
        {
          question: "Does this tool require server processing?",
          answer: "No. This tool processes CSV files directly in your browser using the xlsx library. Your data never leaves your device."
        },
        {
          question: "What CSV formats are supported?",
          answer: "Standard CSV files with various delimiters (comma, semicolon, tab) are supported. The tool automatically detects the delimiter used in your file."
        },
        {
          question: "Are there any file size limits?",
          answer: "For optimal performance, keep CSV files under 50MB. Larger files may take longer to process or cause browser memory issues."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "CSV to Excel", href: "/csv-to-xlsx" },
      ]}
      currentTool="csv-to-xlsx"
    >
      <div className="space-y-6">
        <FileDropzone
          accept={ACCEPT}
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload CSV file"
          description="Comma-Separated Values (max 50MB)"
          maxSize={MAX_FILE_SIZE}
        />

        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}

        {file && (
          <div className="space-y-6">
            <div className="p-4 bg-background dark:bg-background rounded-none">
              <h3 className="font-semibold mb-2">File Info</h3>
              <p className="text-sm">{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</p>
            </div>

            {previewData && (
              <div className="p-4 bg-background dark:bg-background rounded-none border overflow-x-auto">
                <h3 className="font-semibold mb-2">CSV Preview</h3>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                  <thead>
                    <tr className="bg-background dark:bg-background">
                      {previewData.headers.map((header, idx) => (
                        <th key={idx} className="px-2 py-1 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {previewData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-2 py-1">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-foreground mt-2">
                  Displaying first {Math.min(5, previewData.rows.length)} rows of {previewData.totalRows} total rows
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={convertCsvToXlsx} disabled={isProcessing}>
                {isProcessing ? 'Converting...' : 'Convert to XLSX'}
              </Button>
              <Button variant="outline" onClick={() => {
                setFile(null);
                setPreviewData(null);
                setDownloadUrl(null);
                setError("");
              }}>
                Clear
              </Button>
            </div>

            {downloadUrl && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-none">
                <p className="font-semibold text-green-800">Conversion complete!</p>
                <a
                  className="text-blue-600 underline inline-block mt-2 px-4 py-2 bg-blue-100 rounded-none hover:bg-blue-200 transition-colors"
                  href={downloadUrl}
                  download={`${sanitizeFileName(file.name.replace(/\.[^.]+$/, "")) || "converted"}.xlsx`}
                >
                  Download XLSX File
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
