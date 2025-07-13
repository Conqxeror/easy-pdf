"use client";

import React, { useState, useCallback  } from 'react';
import { useDropzone } from 'react-dropzone';
import { getDocument } from 'pdfjs-dist';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText, Table } from 'lucide-react';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  import('pdfjs-dist/build/pdf.worker.entry').then((pdfjsWorker) => {
    window.pdfjsLib = { GlobalWorkerOptions: { workerSrc: pdfjsWorker.default } };
  });
}

export default function PDFTableExtractor() {
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
      const pdf = await getDocument({ data: arrayBuffer }).promise;
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
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `table_page_${table.page}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllToCSV = () => {
    tables.forEach(table => exportToCSV(table));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          PDF Table Extractor
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Extract tables from PDF documents and export to CSV format
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload PDF
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-blue-600 dark:text-blue-400">Drop the PDF file here...</p>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop a PDF file here, or click to select
                </p>
                <p className="text-sm text-gray-500">Supports PDF files up to 50MB</p>
              </div>
            )}
          </div>
          
          {file && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Extracting tables from PDF...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {tables.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Table className="w-5 h-5 mr-2" />
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
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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
                    <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                      <tbody>
                        {table.rows.slice(0, 10).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td 
                                key={cellIndex}
                                className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {table.rows.length > 10 && (
                      <p className="text-sm text-gray-500 mt-2">
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
            <Table className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              No tables found in this PDF. The document may not contain structured table data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}