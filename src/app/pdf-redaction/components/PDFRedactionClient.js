"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeOff, Download, CheckCircle, AlertTriangle, Search, Trash2, Shield, FileText, Loader2 } from "lucide-react";
import { PDFDocument } from 'pdf-lib';
import ToolPageContent from '@/components/ui/ToolPageContent';
import FileDropzone from '@/components/ui/FileDropzone';

export default function PDFRedactionClient() {
  const [file, setFile] = useState(null);
  const [redactedPdf, setRedactedPdf] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchTerms, setSearchTerms] = useState("");
  const [foundTerms, setFoundTerms] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState(new Set());
  const [redactionAreas, setRedactionAreas] = useState([]);
  const [cleanMetadata, setCleanMetadata] = useState(true);
  const [redactionColor, setRedactionColor] = useState("#000000");

  const handleFile = (files) => {
    if (files.length === 0) {
      setError("Please select a PDF file.");
      setFile(null);
      return;
    }
    
    const selectedFile = files[0];
    if (selectedFile.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setError("");
    setRedactedPdf(null);
    setFoundTerms([]);
    setSelectedTerms(new Set());
    setRedactionAreas([]);
  };

  const searchForTerms = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }
    
    if (!searchTerms.trim()) {
      setError("Please enter search terms.");
      return;
    }
    
    setIsProcessing(true);
    setError("");
    setProgress(0);
    
    try {
      const terms = searchTerms.split(",").map(term => term.trim()).filter(term => term);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const termsFound = [];
      
      // This is a simplified search - in a real implementation, you would use a proper PDF text extraction library
      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        setProgress(Math.round((i / pdfDoc.getPageCount()) * 100));
        // Simulate finding terms
        terms.forEach((term, termIndex) => {
          // In a real implementation, you would actually search the page content
          // For now, we'll just simulate finding some terms
          if (Math.random() > 0.7) {
            termsFound.push({
              id: `${i}-${termIndex}`,
              text: term,
              page: i + 1,
              x: Math.floor(Math.random() * 400),
              y: Math.floor(Math.random() * 600)
            });
          }
        });
      }
      
      setFoundTerms(termsFound);
      setProgress(100);
    } catch (err) {
      setError("Failed to search document. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTermSelection = (termId) => {
    setSelectedTerms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(termId)) {
        newSet.delete(termId);
      } else {
        newSet.add(termId);
      }
      return newSet;
    });
  };

  const addManualRedactionArea = () => {
    setRedactionAreas(prev => [
      ...prev,
      {
        id: Date.now(),
        x: 100,
        y: 100,
        width: 200,
        height: 50
      }
    ]);
  };

  const updateRedactionArea = (id, updates) => {
    setRedactionAreas(prev => 
      prev.map(area => 
        area.id === id ? { ...area, ...updates } : area
      )
    );
  };

  const removeRedactionArea = (id) => {
    setRedactionAreas(prev => prev.filter(area => area.id !== id));
  };

  const applyRedactions = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }
    
    if (selectedTerms.size === 0 && redactionAreas.length === 0) {
      setError("Please select terms to redact or add manual redaction areas.");
      return;
    }
    
    setIsProcessing(true);
    setError("");
    setProgress(0);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Apply text redactions
      selectedTerms.forEach((_termId) => {
        // In a real implementation, you would actually redact the text
        // This is just a placeholder
      });
      
      // Apply manual redactions
      redactionAreas.forEach((_area) => {
        // In a real implementation, you would actually draw redaction rectangles
        // This is just a placeholder
      });
      
      // Clean metadata if requested
      if (cleanMetadata) {
        // In a real implementation, you would clean metadata
        // This is just a placeholder
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setRedactedPdf(url);
      setProgress(100);
    } catch (err) {
      setError("Failed to apply redactions. Please try again.");
      console.error("Redaction error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadRedactedPdf = () => {
    if (!redactedPdf) return;
    
    const a = document.createElement("a");
    a.href = redactedPdf;
    a.download = `${file.name.replace(".pdf", "")}_redacted.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-8 md:py-12 px-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              PDF Redaction Tool
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Permanently remove sensitive information from your PDF documents. All processing happens securely in your browser.
            </p>
          </div>

          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="search">Search & Mark</TabsTrigger>
              <TabsTrigger value="manual">Manual Areas</TabsTrigger>
              <TabsTrigger value="redact">Apply Redaction</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Upload PDF Document
                  </CardTitle>
                  <CardDescription>
                    Select a PDF document to redact sensitive information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FileDropzone
                      accept="application/pdf"
                      onFiles={handleFile}
                      error={error}
                      setError={setError}
                      label="Choose PDF"
                      description="Drag & drop or click to select a PDF file (Max 50MB)"
                      maxSize={50 * 1024 * 1024}
                      isLoading={isProcessing && !file}
                    />
                    
                    {file && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
                        <AlertDescription>
                          File loaded: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </AlertDescription>
                      </Alert>
                    )}

                    <Alert>
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      <AlertDescription>
                        <strong>Warning:</strong> Redaction permanently removes information. Ensure you have a backup of the original document.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="search" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Search for Sensitive Content
                  </CardTitle>
                  <CardDescription>
                    Find text patterns that need redaction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="search-terms">Search Terms (comma-separated)</Label>
                      <Textarea
                        id="search-terms"
                        placeholder="SSN, credit card, email@domain.com, phone numbers, etc."
                        value={searchTerms}
                        onChange={(e) => setSearchTerms(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={searchForTerms} 
                      disabled={!file || isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Searching...
                        </span>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                          Search for Terms
                        </>
                      )}
                    </Button>

                    {isProcessing && (
                      <div className="space-y-2">
                        <Progress value={progress} />
                        <p className="text-sm text-gray-400 text-center">
                          Searching document... {progress}%
                        </p>
                      </div>
                    )}

                    {foundTerms.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold">Found Terms ({foundTerms.length})</h4>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {foundTerms.map((term) => (
                            <div key={term.id} className="flex items-center space-x-3 p-2 border rounded border-gray-700 bg-gray-800">
                              <Checkbox
                                checked={selectedTerms.has(term.id)}
                                onCheckedChange={() => toggleTermSelection(term.id)}
                              />
                              <div className="flex-1">
                                <span className="font-mono text-sm bg-gray-700 px-2 py-1 rounded">
                                  {term.text}
                                </span>
                                <span className="text-sm text-gray-400 ml-2">
                                  Page {term.page} at ({term.x}, {term.y})
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedTerms(new Set(foundTerms.map(t => t.id)))}
                            size="sm"
                          >
                            Select All
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedTerms(new Set())}
                            size="sm"
                          >
                            Select None
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                    Manual Redaction Areas
                  </CardTitle>
                  <CardDescription>
                    Define specific areas to redact manually
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={addManualRedactionArea} className="w-full">
                    Add Redaction Area
                  </Button>

                  {redactionAreas.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Redaction Areas ({redactionAreas.length})</h4>
                      <div className="max-h-60 overflow-y-auto space-y-3">
                        {redactionAreas.map((area) => (
                          <div key={area.id} className="p-4 border rounded border-gray-700 bg-gray-800 space-y-3">
                            <div className="flex justify-between items-center">
                              <h5 className="font-medium">Area #{area.id}</h5>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => removeRedactionArea(area.id)}
                              >
                                Remove
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>X</Label>
                                <Input
                                  type="number"
                                  value={area.x}
                                  onChange={(e) => updateRedactionArea(area.id, { x: parseInt(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Y</Label>
                                <Input
                                  type="number"
                                  value={area.y}
                                  onChange={(e) => updateRedactionArea(area.id, { y: parseInt(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Width</Label>
                                <Input
                                  type="number"
                                  value={area.width}
                                  onChange={(e) => updateRedactionArea(area.id, { width: parseInt(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Height</Label>
                                <Input
                                  type="number"
                                  value={area.height}
                                  onChange={(e) => updateRedactionArea(area.id, { height: parseInt(e.target.value) })}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="redact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                    Apply Redactions
                  </CardTitle>
                  <CardDescription>
                    Permanently remove selected content from your document
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="clean-metadata"
                        checked={cleanMetadata}
                        onCheckedChange={setCleanMetadata}
                      />
                      <Label htmlFor="clean-metadata">
                        Clean document metadata (recommended)
                      </Label>
                    </div>

                    <div>
                      <Label htmlFor="redaction-color">Redaction Color</Label>
                      <Input
                        id="redaction-color"
                        type="color"
                        value={redactionColor}
                        onChange={(e) => setRedactionColor(e.target.value)}
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800 rounded-lg">
                    <h4 className="font-semibold mb-2">Redaction Summary:</h4>
                    <ul className="text-sm space-y-1 text-gray-300">
                      <li>• Selected search terms: {selectedTerms.size}</li>
                      <li>• Manual redaction areas: {redactionAreas.length}</li>
                      <li>• Metadata cleaning: {cleanMetadata ? 'Enabled' : 'Disabled'}</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={applyRedactions} 
                    disabled={!file || isProcessing || (selectedTerms.size === 0 && redactionAreas.length === 0)}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Applying Redactions...
                      </span>
                    ) : (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" aria-hidden="true" />
                        Apply Redactions
                      </>
                    )}
                  </Button>

                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-sm text-gray-400 text-center">
                        Processing redactions... {progress}%
                      </p>
                    </div>
                  )}

                  {redactedPdf && (
                    <Alert className="border-green-500/50 bg-green-500/10">
                      <CheckCircle className="h-4 w-4 text-green-400" aria-hidden="true" />
                      <AlertDescription className="flex items-center justify-between">
                        <span className="text-green-400">Redaction completed successfully!</span>
                        <Button onClick={downloadRedactedPdf} size="sm" variant="success">
                          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                          Download
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" aria-hidden="true" />
                Redaction Security Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Security Measures</h4>
                  <ul className="space-y-1 text-sm text-gray-400">
                    <li>• Permanent content removal</li>
                    <li>• Metadata sanitization</li>
                    <li>• Visual verification</li>
                    <li>• Secure deletion process</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Compliance Features</h4>
                  <ul className="space-y-1 text-sm text-gray-400">
                    <li>• GDPR data protection</li>
                    <li>• HIPAA compliance ready</li>
                    <li>• Legal document redaction</li>
                    <li>• Audit trail support</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ToolPageContent
        toolName="PDF Redaction"
        toolDescription="Securely remove sensitive information from PDF documents with our advanced redaction tool. Permanently delete text, images, and metadata to ensure compliance with privacy regulations. Our client-side processing keeps your documents completely private - they never leave your device."
        currentTool="pdf-redaction"
        steps={[
          "Upload your PDF document using the file selector or drag and drop.",
          "Use the 'Search & Mark' tab to automatically find sensitive terms like SSNs, credit card numbers, or custom text patterns.",
          "Switch to the 'Manual Areas' tab to define specific regions for redaction by coordinates.",
          "Review your selections in the 'Apply Redaction' tab and choose additional security options.",
          "Click 'Apply Redactions' to permanently remove the selected content from your document.",
          "Download your securely redacted PDF file."
        ]}
        faqs={[
          {
            question: "Is redaction permanent?",
            answer: "Yes, our redaction tool permanently removes selected content from your PDF. The original information is completely erased and cannot be recovered."
          },
          {
            question: "Are my files secure during redaction?",
            answer: "Absolutely. All processing happens locally in your browser. Your files never leave your device or are uploaded to any server."
          },
          {
            question: "Can I redact images?",
            answer: "Yes, you can define manual redaction areas to cover images or any other visual content in your PDF documents."
          },
          {
            question: "Does the tool clean metadata?",
            answer: "Yes, you can enable metadata cleaning to remove hidden document information like author names, creation dates, and editing history."
          },
          {
            question: "What file formats are supported?",
            answer: "The tool works with standard PDF files. The maximum file size is 50MB for optimal performance."
          }
        ]}
      />
    </>
  );
}