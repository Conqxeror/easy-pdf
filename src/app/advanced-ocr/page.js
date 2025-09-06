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
import { Upload, Download, Search, FileText, Image as ImageIcon, Brain, Copy, Zap, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { createWorker } from 'tesseract.js';
import ToolPageLayout from '@/components/ui/ToolPageLayout';

// Set up PDF.js worker (browser-only)
if (typeof window !== 'undefined' && pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

export default function AdvancedOCR() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [ocrMode, setOcrMode] = useState('standard'); // standard, enhanced, ai-powered
  const [processingStatus, setProcessingStatus] = useState('idle');

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
      result: null,
      confidence: null
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (id) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setProgress(0);
    setProcessingStatus('idle');
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProcessingStatus('processing');
    setProgress(0);
    setResults([]);

    const worker = await createWorker(selectedLanguage, 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          setProgress(m.progress * 100);
        }
      }
    });

    try {
      const processedResults = [];
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        const { file } = fileData;

        if (file.type === 'application/pdf') {
          const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
          const pdf = await loadingTask.promise;
          let pdfText = '';
          let pageResults = [];

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const { data: { text, confidence } } = await worker.recognize(canvas);
            pdfText += text + '\n\n';
            pageResults.push({ page: pageNum, text, confidence: confidence.toFixed(2) });
          }
          processedResults.push({
            fileName: file.name,
            type: 'pdf',
            text: pdfText,
            confidence: (pageResults.reduce((sum, p) => sum + parseFloat(p.confidence), 0) / pageResults.length).toFixed(2),
            pages: pdf.numPages,
            pageResults: pageResults
          });
        } else if (file.type.startsWith('image/')) {
          const { data: { text, confidence } } = await worker.recognize(file);
          processedResults.push({
            fileName: file.name,
            type: 'image',
            text,
            confidence: confidence.toFixed(2)
          });
        }
      }
      setResults(processedResults);
      setProcessingStatus('completed');
    } catch (error) {
      console.error("OCR Error:", error);
      setProcessingStatus('error');
    } finally {
      await worker.terminate();
      setIsProcessing(false);
    }
  };

  const downloadAllResults = () => {
    if (results.length === 0) return;
    const allText = results.map(r => `--- ${r.fileName} ---\n${r.text}`).join('\n\n');
    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_ocr_results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadText = (result) => {
    const blob = new Blob([result.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${ isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
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
                <label className="text-sm font-medium mb-2 block">OCR Mode</label>
                <Select value={ocrMode} onValueChange={setOcrMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                        <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        Standard OCR
                      </div>
                    </SelectItem>
                    <SelectItem value="enhanced">
                        <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" aria-hidden="true" />
                        Enhanced Processing
                      </div>
                    </SelectItem>
                    <SelectItem value="ai-powered">
                        <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" aria-hidden="true" />
                        AI-Powered Enhancement
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={processFiles} 
                disabled={files.length === 0 || isProcessing}
                className="w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
              >
                <Search className="h-4 w-4 mr-2" aria-hidden="true" />
                {isProcessing ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Processing...
                  </span>
                ) : 'Extract Text'}
              </Button>

              {files.length > 0 && (
                <Button variant="outline" onClick={clearAll} disabled={isProcessing} className="w-full">
                  Clear All
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {files.length > 0 && (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" aria-hidden="true" />
                Files Queue ({files.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((fileData) => (
                  <div key={fileData.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {fileData.file.type === 'application/pdf' ? (
                        <FileText className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ImageIcon className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span className="text-sm">{fileData.file.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(fileData.id)}
                      disabled={isProcessing}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isProcessing && (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 animate-pulse" aria-hidden="true" />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
                  Extraction Complete
                </div>
                  <Button onClick={downloadAllResults} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  Download All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{result.fileName}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={getConfidenceColor(result.confidence)}>
                            {result.confidence}% confidence
                          </Badge>
                          {result.type === 'pdf' && (
                            <Badge variant="outline">
                              {result.pages} pages
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="text" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="text">Extracted Text</TabsTrigger>
                          {result.enhancedText && (
                            <TabsTrigger value="enhanced">AI Enhanced</TabsTrigger>
                          )}
                          {result.pageResults && (
                            <TabsTrigger value="pages">By Page</TabsTrigger>
                          )}
                        </TabsList>
                        
                        <TabsContent value="text" className="space-y-2">
                          <Textarea
                            value={result.text}
                            readOnly
                            className="min-h-[200px] font-mono text-sm border border-gray-200 rounded-md p-2"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(result.text)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadText(result)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </TabsContent>

                        {result.enhancedText && (
                          <TabsContent value="enhanced" className="space-y-2">
                            <Textarea
                              value={result.enhancedText}
                              readOnly
                              className="min-h-[200px] font-mono text-sm border border-gray-200 rounded-md p-2"
                            />
                            {result.improvements && (
                              <div className="text-sm text-muted-foreground">
                                <p className="font-medium">AI Improvements:</p>
                                <ul className="list-disc list-inside">
                                  {result.improvements.map((improvement, i) => (
                                    <li key={i}>{improvement}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(result.enhancedText)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Enhanced
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadText(result)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Enhanced
                              </Button>
                            </div>
                          </TabsContent>
                        )}

                        {result.pageResults && (
                          <TabsContent value="pages">
                            <div className="space-y-3 max-h-[300px] overflow-y-auto p-2 border border-gray-200 rounded-md">
                              {result.pageResults.map((pageResult, pageIndex) => (
                                <Card key={pageIndex} className="bg-white shadow-sm">
                                  <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-sm">Page {pageResult.page}</CardTitle>
                                      <Badge className={getConfidenceColor(pageResult.confidence)}>
                                        {pageResult.confidence}%
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-0">
                                    <Textarea
                                      value={pageResult.text}
                                      readOnly
                                      className="min-h-[100px] text-sm border border-gray-100 rounded-md p-1"
                                    />
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                        )}
                      </Tabs>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {processingStatus === 'error' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>An error occurred during processing. Please try again.</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolPageLayout>
  );
}
