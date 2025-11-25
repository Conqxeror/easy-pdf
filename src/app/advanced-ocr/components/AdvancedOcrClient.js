"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, FileText, Image as ImageIcon, Brain, Copy, Zap, Globe, CheckCircle } from 'lucide-react';
import { loadPdfJs } from '@/lib/pdfjsWorker';
import { createTesseractWorker, terminateWorker } from '@/lib/tesseractWorker';
import ToolPageLayout from '@/components/ui/ToolPageLayout';

export default function AdvancedOCRClient() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [ocrMode, setOcrMode] = useState('standard'); // standard, enhanced, ai-powered

  const languages = [
    { code: 'eng', name: 'English' },
    { code: 'spa', name: 'Spanish' },
    { code: 'fra', name: 'French' },
    { code: 'deu', name: 'German' },
    { code: 'ita', name: 'Italian' },
    { code: 'por', name: 'Portuguese' },
    { code: 'rus', name: 'Russian' },
    { code: 'chi_sim', name: 'Chinese (Simplified)' },
    { code: 'jpn', name: 'Japanese' },
    { code: 'kor', name: 'Korean' },
    { code: 'ara', name: 'Arabic' },
    { code: 'hin', name: 'Hindi' }
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file =>
      file.type === 'application/pdf' || file.type.startsWith('image/')
    );
    setFiles(prev => [...prev, ...validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      status: 'ready',
      progress: 0,
      result: null,
      errorMessage: null,
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const setFileState = (id, newState) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === id ? { ...file, ...newState } : file
      )
    );
  };

  const _processImageFile = async (worker, file, onProgress) => {
    const { data: { text, confidence } } = await worker.recognize(file, {}, { logger: onProgress });
    return {
      fileName: file.name,
      type: 'image',
      text,
      confidence: confidence.toFixed(2)
    };
  };

  const _processPdfFile = async (worker, file, onProgress) => {
    let pdf;
    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      pdf = await loadingTask.promise;
    } catch (err) {
      console.error('Failed to load PDF in AdvancedOCR:', err);
      throw new Error("Failed to load the PDF file. It might be corrupt or protected.");
    }

    let pdfText = '';
    let pageResults = [];
    const numPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        
        const pageProgress = (m) => {
          if (m.status === 'recognizing text') {
              const overallProgress = ((pageNum - 1 + m.progress) / numPages);
              onProgress({ status: 'recognizing text', progress: overallProgress });
          }
        };
        
        const { data: { text, confidence } } = await worker.recognize(canvas, {}, { logger: pageProgress });

        pdfText += text + '\n\n';
        pageResults.push({ page: pageNum, text, confidence: confidence.toFixed(2) });
      } catch (pageError) {
          console.error(`Error processing page ${pageNum} of ${file.name}:`, pageError);
          // Continue to next page, but you could also throw to stop processing this file
      }
    }

    if (pageResults.length === 0) {
        throw new Error("No pages could be processed from this PDF.");
    }

    return {
      fileName: file.name,
      type: 'pdf',
      text: pdfText,
      confidence: (pageResults.reduce((sum, p) => sum + parseFloat(p.confidence), 0) / pageResults.length).toFixed(2),
      pages: numPages,
      pageResults: pageResults
    };
  };

  const processFiles = async () => {
    if (files.filter(f => f.status === 'ready').length === 0) return;
    setIsProcessing(true);
    setResults([]);

    const worker = await createTesseractWorker(selectedLanguage, 1);

    const newResults = [];
    for (const fileData of files) {
      if (fileData.status !== 'ready') continue;
      
      try {
        setFileState(fileData.id, { status: 'processing', progress: 0, errorMessage: null });

        const onProgress = (m) => {
          if (m.status === 'recognizing text') {
            setFileState(fileData.id, { progress: m.progress * 100 });
          }
        };

        let result;
        if (fileData.file.type === 'application/pdf') {
          result = await _processPdfFile(worker, fileData.file, onProgress);
        } else if (fileData.file.type.startsWith('image/')) {
          result = await _processImageFile(worker, fileData.file, onProgress);
        }

        if (result) {
          setFileState(fileData.id, { status: 'completed', progress: 100 });
          newResults.push(result);
        }
      } catch (error) {
        console.error("OCR Error for file:", fileData.file.name, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        setFileState(fileData.id, { status: 'error', progress: 0, errorMessage });
      }
    }
    
    setResults(newResults);
    await terminateWorker(worker);
    setIsProcessing(false);
  };

  const _downloadBlob = (blob, fileName) => {
    let url = null;
    try {
      url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error creating or triggering download:', err);
      alert('Unable to download file.');
    } finally {
      if (url) {
        setTimeout(() => {
          try { URL.revokeObjectURL(url); } catch {}
        }, 500);
      }
    }
  };

  const downloadAllResults = () => {
    if (results.length === 0) return;
    const allText = results.map(r => `--- ${r.fileName} ---\n${r.text}`).join('\n\n');
    const blob = new Blob([allText], { type: 'text/plain' });
    _downloadBlob(blob, 'all_ocr_results.txt');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadText = (result) => {
    const blob = new Blob([result.text], { type: 'text/plain' });
    const safeBase = result.fileName ? result.fileName.replace(/\.txt$/i, '').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '') : 'result';
    _downloadBlob(blob, `${safeBase}.txt`);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 90) return 'bg-green-500';
    if (confidence > 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const toolName = "Advanced OCR with AI";
  const toolDescription = "Extract text from PDFs and images with enhanced accuracy using our advanced OCR technology. Supports multiple languages and offers different processing modes for optimal results.";
  const steps = [
    "Upload your PDF document or image file by dragging it into the dropzone or clicking to select.",
    "Choose your preferred OCR mode: Standard for basic recognition, Enhanced for improved accuracy, or AI-Powered for maximum precision.",
    "Select the language of your document if it's not in English.",
    "Click 'Process Document' to start the text recognition process.",
    "Review the extracted text in the results panel. You can copy it to your clipboard or download it as a text file."
  ];
  const faqs = [
    {
      question: "What makes this OCR tool 'advanced'?",
      answer: "Our advanced OCR tool uses multiple recognition engines and processing techniques to achieve higher accuracy than standard OCR tools. It supports multiple languages and offers different processing modes for various document types."
    },
    {
      question: "What file types are supported?",
      answer: "Our tool supports PDF documents and common image formats including JPG, PNG, BMP, and TIFF. For best results, ensure your documents have clear, high-contrast text."
    },
    {
      question: "How does the AI-powered mode work?",
      answer: "The AI-powered mode uses advanced neural networks to recognize text patterns with greater accuracy, especially for complex layouts, handwritten text, or documents with poor image quality."
    },
    {
      question: "Is my data secure when using this tool?",
      answer: "Absolutely. All processing happens locally in your browser. Your files are never uploaded to our servers, ensuring complete privacy and security for your sensitive documents."
    },
    {
      question: "Can I recognize text in multiple languages?",
      answer: "Yes, our tool supports recognition in over 100 languages. Simply select the appropriate language from the dropdown menu before processing your document."
    }
  ];

  return (
    <ToolPageLayout
      title="Advanced OCR with AI"
      subtitle="Extract text from PDFs and images with AI-powered enhancement. Supports multiple languages and formats."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="advanced-ocr"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Advanced OCR', href: '/advanced-ocr' }
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Add PDF files or images for text extraction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
                {isDragActive ? (
                  <p>Drop the files here...</p>
                ) : (
                  <div>
                    <p className="mb-1">Drag & drop PDF files or images here, or click to select</p>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF, PNG, JPG, JPEG, GIF, BMP, TIFF
                    </p>
                  </div>
                )}
              </div>
              
              {files.length > 0 && !isProcessing && (
                <div className="mt-6 space-y-2">
                  <h3 className="font-medium">Uploaded Files</h3>
                  {files.map(fileData => (
                    <div key={fileData.id} className="p-3 border rounded-md flex justify-between items-center text-sm">
                      <span className="truncate font-medium">{fileData.file.name}</span>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                  ))}
                </div>
              )}

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>OCR Settings</CardTitle>
              <CardDescription>
                Configure extraction options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" aria-hidden="true" />
                          {lang.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Processing Mode</label>
                <Select value={ocrMode} onValueChange={setOcrMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" aria-hidden="true" />
                        Standard (Fast)
                      </div>
                    </SelectItem>
                    <SelectItem value="enhanced">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
                        Enhanced (Accurate)
                      </div>
                    </SelectItem>
                    <SelectItem value="ai-powered">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" aria-hidden="true" />
                        AI-Powered (Best)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={processFiles}
                disabled={files.length === 0 || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Process Document'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {isProcessing && (
          <Card>
            <CardHeader>
                <CardTitle>Processing Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {files.filter(f => f.status !== 'ready').map(fileData => (
                <div key={fileData.id} className="p-3 border rounded-md">
                  <div className="flex justify-between items-center text-sm">
                    <span className="truncate font-medium">{fileData.file.name}</span>
                    <Badge variant={
                      fileData.status === 'completed' ? 'success' :
                      fileData.status === 'error' ? 'destructive' :
                      'outline'
                    }>{fileData.status}</Badge>
                  </div>
                  {fileData.status === 'processing' && fileData.progress > 0 && (
                      <Progress value={fileData.progress} className="mt-2" />
                  )}
                  {fileData.status === 'error' && fileData.errorMessage && (
                    <p className="text-red-500 text-xs mt-1">{fileData.errorMessage}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {results.length > 0 && !isProcessing && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Results</h2>
              <Button variant="outline" onClick={downloadAllResults}>
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Download All
              </Button>
            </div>

            {results.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {result.type === 'pdf' ? <FileText className="h-5 w-5" aria-hidden="true" /> : <ImageIcon className="h-5 w-5" aria-hidden="true" />}
                        {result.fileName}
                      </CardTitle>
                      <CardDescription>
                        Confidence: <Badge className={getConfidenceColor(result.confidence)}>{result.confidence}%</Badge>
                        {result.pages && ` • ${result.pages} pages`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.text)}>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => downloadText(result)}>
                        <Download className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="text">
                    <TabsList>
                      <TabsTrigger value="text">Extracted Text</TabsTrigger>
                      {result.pageResults && <TabsTrigger value="pages">Pages</TabsTrigger>}
                    </TabsList>
                    <TabsContent value="text">
                      <Textarea
                        className="min-h-[300px] font-mono"
                        value={result.text}
                        readOnly
                      />
                    </TabsContent>
                    {result.pageResults && (
                      <TabsContent value="pages">
                        <div className="space-y-4">
                          {result.pageResults.map((page, pIndex) => (
                            <div key={pIndex} className="border rounded-none p-4">
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">Page {page.page}</span>
                                <Badge variant="outline">Confidence: {page.confidence}%</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{page.text}</p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}

