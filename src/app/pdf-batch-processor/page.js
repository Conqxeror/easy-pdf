"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, Layers, FileText, Trash2, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import ToolPageLayout from '@/components/ui/ToolPageLayout';
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from '@/lib/enhancedUX';

export default function PDFBatchProcessor() {
  const [files, setFiles] = useState([]);
  const [operation, setOperation] = useState('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [processingStatus, setProcessingStatus] = useState('idle'); // idle, processing, completed, error

  const onDrop = useCallback((acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    setFiles(prev => [...prev, ...pdfFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      status: 'ready',
      result: null
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeFile = (id) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setProgress(0);
    setProcessingStatus('idle');
  };

  const processBatch = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProcessingStatus('processing');
    setProgress(0);
    setResults([]);

    try {
      switch (operation) {
        case 'merge':
          await processMerge();
          break;
        case 'compress':
          await processCompress();
          break;
        case 'split':
          await processSplit();
          break;
        case 'rotate':
          await processRotate();
          break;
        default:
          throw new Error('Unknown operation');
      }
      setProcessingStatus('completed');
    } catch (error) {
      console.error('Batch processing error:', error);
      setProcessingStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const processMerge = async () => {
    const mergedPdf = await PDFDocument.create();
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const arrayBuffer = await file.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
        
      setProgress(((i + 1) / files.length) * 100);
  } catch {
    console.error(`Error processing ${file.file.name}:`);
      }
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = safeCreateObjectURL(blob);

    // Revoke any previous result URLs to avoid leaks
    try { results.forEach((r) => { try { safeRevokeObjectURL(r.url); } catch {} }); } catch {}

    setResults([
      {
        name: 'merged_documents.pdf',
        url,
        size: pdfBytes.length,
      },
    ]);
  };

  const processCompress = async () => {
    const compressedResults = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const arrayBuffer = await file.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        
        // Basic compression by re-saving (pdf-lib automatically optimizes)
        const pdfBytes = await pdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = safeCreateObjectURL(blob);

      compressedResults.push({
          name: file.file.name.replace(/\.pdf$/i, '') + '_compressed.pdf',
          url,
          size: pdfBytes.length,
          originalSize: file.file.size,
          compressionRatio: ((file.file.size - pdfBytes.length) / file.file.size * 100).toFixed(1)
        });
        
      setProgress(((i + 1) / files.length) * 100);
  } catch {
    console.error(`Error compressing ${file.file.name}:`);
      }
    }
    
    try { results.forEach((r) => { try { safeRevokeObjectURL(r.url); } catch {} }); } catch {}
    setResults(compressedResults);
  };

  const processSplit = async () => {
    const splitResults = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const arrayBuffer = await file.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();
        
        for (let pageNum = 0; pageNum < pageCount; pageNum++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(pdf, [pageNum]);
          newPdf.addPage(page);
          
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = safeCreateObjectURL(blob);

          splitResults.push({
            name: sanitizeFileName(file.file.name.replace(/\.pdf$/i, '')) + `_page_${pageNum + 1}.pdf`,
            url,
            size: pdfBytes.length
          });
        }
        
      setProgress(((i + 1) / files.length) * 100);
  } catch {
    console.error(`Error splitting ${file.file.name}:`);
      }
    }
    
    try { results.forEach((r) => { try { safeRevokeObjectURL(r.url); } catch {} }); } catch {}
    setResults(splitResults);
  };

  const processRotate = async () => {
    const rotatedResults = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const arrayBuffer = await file.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = pdf.getPages();
        
        // Rotate all pages 90 degrees clockwise
        pages.forEach(page => {
          page.setRotation({ angle: 90 });
        });
        
        const pdfBytes = await pdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = safeCreateObjectURL(blob);

      rotatedResults.push({
          name: sanitizeFileName(file.file.name.replace(/\.pdf$/i, '')) + '_rotated.pdf',
          url,
          size: pdfBytes.length
        });
        
      setProgress(((i + 1) / files.length) * 100);
  } catch {
    console.error(`Error rotating ${file.file.name}:`);
      }
    }
    
    try { results.forEach((r) => { try { safeRevokeObjectURL(r.url); } catch {} }); } catch {}
    setResults(rotatedResults);
  };

  const downloadAll = () => {
    results.forEach((result) => {
      try {
        if (!result || !result.url) return;
        const link = document.createElement('a');
        link.href = result.url;
        link.download = result.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        console.error('Error downloading result:', err);
      }
    });
    // Revoke result URLs shortly after download to free memory
    setTimeout(() => {
      try { results.forEach((r) => { try { safeRevokeObjectURL(r.url); } catch {} }); } catch {}
    }, 1000);
  };

  // Cleanup on unmount: revoke any created object URLs
  useEffect(() => {
    return () => { try { results.forEach((r) => { try { safeRevokeObjectURL(r.url); } catch {} }); } catch {} };
  }, [results]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ToolPageLayout
      title="PDF Batch Processor"
      subtitle="Process multiple PDF files at once with various operations"
      toolName="PDF Batch Processor"
      toolDescription="Process multiple PDF files at once with various operations including merge, compress, split, and rotate. All processing happens locally in your browser for complete privacy and security."
      currentTool="pdf-batch-processor"
      steps={[
        "Upload multiple PDF files by dragging them into the dropzone or clicking to select them from your device.",
        "Choose the batch operation you want to perform: merge all PDFs, compress all PDFs, split all PDFs by page, or rotate all PDFs.",
        "Click 'Start Processing' to begin the batch operation. You can monitor the progress in real-time.",
        "Once processing is complete, download all the processed files individually or use 'Download All Files' to get everything at once."
      ]}
      faqs={[
        {
          question: "What types of batch operations are available?",
          answer: "The PDF Batch Processor supports four main operations: merge (combine all PDFs into one), compress (reduce file sizes), split (separate each PDF by page), and rotate (rotate all pages 90 degrees)."
        },
        {
          question: "Is there a limit to how many files I can process?",
          answer: "You can upload multiple PDF files, but for best performance, we recommend processing up to 20 files at once. Each file should be under 50MB for optimal results."
        },
        {
          question: "Are my files secure during batch processing?",
          answer: "Absolutely! All processing happens locally in your browser. Your files never leave your device, ensuring complete privacy and security for your sensitive documents."
        },
        {
          question: "Can I process different operations on different files?",
          answer: "Currently, the batch processor applies the same operation to all uploaded files. For different operations, you'll need to process files in separate batches."
        },
        {
          question: "What happens if one file fails during processing?",
          answer: "If a file fails during processing, the tool will continue with the remaining files. Failed files will be logged in the console, and you'll still receive the successfully processed files."
        }
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Add multiple PDF files for batch processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
                {isDragActive ? (
                  <p>Drop the PDF files here...</p>
                ) : (
                  <div>
                    <p className="mb-1">Drag & drop PDF files here, or click to select</p>
                    <p className="text-sm text-muted-foreground">Multiple files supported</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operation Settings</CardTitle>
              <CardDescription>
                Choose the operation to perform on all files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Batch Operation</label>
                <Select value={operation} onValueChange={setOperation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merge">Merge All PDFs</SelectItem>
                    <SelectItem value="compress">Compress All PDFs</SelectItem>
                    <SelectItem value="split">Split All PDFs (by page)</SelectItem>
                    <SelectItem value="rotate">Rotate All PDFs (90°)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={processBatch} 
                  disabled={files.length === 0 || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</span>
                  ) : (
                    <><Play className="h-4 w-4 mr-2" aria-hidden="true" />Start Processing</>
                  )}
                </Button>
                <Button variant="outline" onClick={clearAll} disabled={isProcessing}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {files.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Files Queue ({files.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{file.file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.file.size)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(file.id)}
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isProcessing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Processing...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                {progress.toFixed(1)}% complete
              </p>
            </CardContent>
          </Card>
        )}

        {processingStatus === 'completed' && results.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
                Processing Complete
              </CardTitle>
              <CardDescription>
                {results.length} file(s) ready for download
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      <span className="text-sm">{result.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(result.size)}
                      </span>
                      {result.compressionRatio && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          -{result.compressionRatio}%
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        try {
                          const link = document.createElement('a');
                          link.href = result.url;
                          link.download = result.name;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          // Revoke shortly after download starts (skip data: URLs)
                          const urlToRevoke = result.url;
                          if (!urlToRevoke || String(urlToRevoke).startsWith('data:')) return;
                          setTimeout(() => {
                            try { if (typeof URL !== 'undefined' && !String(urlToRevoke).startsWith('data:')) URL.revokeObjectURL(urlToRevoke); } catch { /* ignore */ }
                          }, 500);
                        } catch (err) {
                          console.error('Error during download click:', err);
                        }
                      }}
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button onClick={downloadAll} className="w-full">
                <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                Download All Files
              </Button>
            </CardContent>
          </Card>
        )}

        {processingStatus === 'error' && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                <span>An error occurred during processing. Please try again.</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Layers className="h-4 w-4" aria-hidden="true" />
              <span>All processing happens locally in your browser. Your files never leave your device.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}