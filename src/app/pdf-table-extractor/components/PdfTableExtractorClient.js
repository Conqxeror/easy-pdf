"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { loadPdfJs, ensurePdfWorkerEntry } from '@/lib/pdfjsWorker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText, Table, Loader2, AlertCircle } from 'lucide-react';
import ToolPageLayout from '@/components/ui/ToolPageLayout';
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from '@/lib/enhancedUX';
import { toast } from 'sonner';

// PDF.js will be loaded lazily when a PDF file is processed. The helper
// `loadPdfJs` configures the workerSrc via the centralized helper `getPdfWorkerUrl()` which
// respects the configured asset prefix to locate the worker binary in production.

export default function PDFTableExtractorClient() {
  const [file, setFile] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [, setSelectedTable] = useState(null); // Feature incomplete
  // const [extractionMethod, setExtractionMethod] = useState('auto'); // Feature incomplete

  const extractTables = useCallback(async (file) => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setTables([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Lazily import pdfjs and ensure worker is configured
      try {
        // Optionally attempt to load the worker entry (this may return null)
        // but it's a best-effort; the main `loadPdfJs` call sets workerSrc.
        await ensurePdfWorkerEntry();
      } catch {
        // ignore - helper logs if needed
      }

      const pdfjsLib = await loadPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const extractedTables = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Simple table detection logic
        const items = textContent.items;
        const lines = [];
        let currentLine = [];
        let lastY = null;

        items.forEach(item => {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            if (currentLine.length > 0) {
              lines.push(currentLine);
              currentLine = [];
            }
          }
          currentLine.push(item.str);
          lastY = item.transform[5];
        });

        if (currentLine.length > 0) {
          lines.push(currentLine);
        }

        // Detect table-like structures
        const tableLines = lines.filter(line => line.length > 2);
        if (tableLines.length > 1) {
          extractedTables.push({
            page: pageNum,
            rows: tableLines.map(line => line.map(cell => cell.trim()).filter(cell => cell))
          });
        }
      }

      setTables(extractedTables);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setFile(file);
      await extractTables(file);
    }
  }, [extractTables]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const exportToCSV = (table) => {
    const csvContent = table.rows.map(row =>
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    let url = null;
    try {
      setError(null);
      url = safeCreateObjectURL(blob);
      const link = document.createElement('a');
      const safeName = `${sanitizeFileName(table.page ? `table_page_${table.page}` : 'table')}.csv`;
      link.setAttribute('href', url || '');
      link.setAttribute('download', safeName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast.error(err?.message || 'Failed to export CSV');
      setError('Failed to export the CSV file. Please try again.');
    } finally {
      setTimeout(() => { try { safeRevokeObjectURL(url); } catch { } }, 500);
    }
  };

  const exportAllToCSV = () => {
    tables.forEach(table => exportToCSV(table));
  };

  return (
    <ToolPageLayout
      title="PDF Table Extractor"
      subtitle="Extract table-like PDF content and export the results as CSV"
      toolName="PDF Table Extractor"
      toolDescription="Extract table-like text structures from PDF documents and export the results as CSV files for Excel, Google Sheets, or other spreadsheet tools. All processing happens locally in your browser for complete privacy and security."
      currentTool="pdf-table-extractor"
      steps={[
        "Upload your PDF file by dragging it into the dropzone or clicking to select it.",
        "The tool will automatically scan all pages and detect table-like structures in the document.",
        "Review the extracted tables that are displayed with their page numbers and content.",
        "Export individual tables or all tables to CSV format for use in spreadsheets or data analysis tools."
      ]}
      faqs={[
        {
          question: "How does the table extraction work?",
          answer: "The tool uses advanced text analysis to detect table-like structures in PDF documents. It identifies patterns of aligned text that form rows and columns, then extracts the data while preserving the table structure."
        },
        {
          question: "What types of tables can be extracted?",
          answer: "The tool can extract various types of tables including data tables, comparison tables, and structured information. It works best with clearly formatted tables that have consistent row and column alignment."
        },
        {
          question: "Can I export the extracted tables?",
          answer: "Yes, you can export individual tables or all detected tables at once to CSV format. The CSV files can be opened in Excel, Google Sheets, or any spreadsheet application for further cleanup and analysis."
        },
        {
          question: "What if no tables are found in my PDF?",
          answer: "If no tables are detected, it may be because the document doesn't contain structured table data, or the tables are in image format rather than text. The tool works best with text-based tables."
        },
        {
          question: "Is there a limit to the number of tables that can be extracted?",
          answer: "There's no limit to the number of tables that can be extracted. The tool will process all pages in your PDF and extract every table-like structure it finds."
        }
      ]}
    >
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Table className="h-8 w-8" aria-hidden="true" />
            PDF Table Extractor
          </h1>
          <p className="text-muted-foreground">
            Extract tables from PDF documents and export to CSV format for further analysis.
          </p>
        </div>

        {/* Upload Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload PDF
            </CardTitle>
            <CardDescription>
              Select a PDF file to extract tables from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25'
                }`}
            >
              <input {...getInputProps()} />
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg">Drop the PDF file here...</p>
              ) : (
                <div>
                  <p className="text-lg mb-2">Drag and drop a PDF file here, or click to select</p>
                  <p className="text-sm text-muted-foreground">Only PDF files are supported</p>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-4 p-3 bg-background dark:bg-background">
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Extracting tables from PDF...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="text-center py-8">
              <div className="flex items-center justify-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>Error: {error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {tables.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Table className="w-5 h-5" />
                  Extracted Tables ({tables.length})
                </CardTitle>
                <Button onClick={exportAllToCSV} className="flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export All CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tables.map((table, index) => (
                  <div key={index} className="border border-border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        Table from Page {table.page}
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportToCSV(table)}
                        className="flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-border">
                        <tbody>
                          {table.rows.slice(0, 10).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="border border-border px-3 py-2 text-sm"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {table.rows.length > 10 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Showing first 10 rows of {table.rows.length} total rows
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Tables Found */}
        {!loading && !error && file && tables.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Table className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No tables found in this PDF. The document may not contain structured table data.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolPageLayout>
  );
}
