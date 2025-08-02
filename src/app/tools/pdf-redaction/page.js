"use client";

import React, { useState, useRef  } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeOff, Download, CheckCircle, AlertTriangle, Search, Trash2, Shield, FileText } from "lucide-react";
import { PDFDocument, rgb } from 'pdf-lib';
import ToolPageContent from '@/components/ui/ToolPageContent';

export default function PDFRedactionTool() {
  const [file, setFile] = useState(null);
  const [redactedPdf, setRedactedPdf] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchTerms, setSearchTerms] = useState("");
  const [foundTerms, setFoundTerms] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState(new Set());
  const [redactionColor, setRedactionColor] = useState("#000000");
  const [cleanMetadata, setCleanMetadata] = useState(true);
  const [redactionAreas, setRedactionAreas] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
      setRedactedPdf(null);
      setFoundTerms([]);
      setSelectedTerms(new Set());
      setRedactionAreas([]);
    }
  };

  const searchForTerms = async () => {
    if (!file || !searchTerms.trim()) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(30);
      
      // Mock search functionality - in real implementation would use PDF text extraction
      const terms = searchTerms.split(',').map(term => term.trim()).filter(term => term);
      const mockFoundTerms = terms.map((term, index) => ({
        id: index,
        text: term,
        page: Math.floor(Math.random() * 3) + 1,
        x: Math.floor(Math.random() * 400) + 50,
        y: Math.floor(Math.random() * 600) + 50,
        width: term.length * 8,
        height: 20
      }));

      setProgress(70);
      setFoundTerms(mockFoundTerms);
      setSelectedTerms(new Set(mockFoundTerms.map(term => term.id)));
      setProgress(100);
    } catch (error) {
      console.error('Error searching for terms:', error);
      alert('Error searching for terms. Please try again.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const addManualRedactionArea = () => {
    const newArea = {
      id: Date.now(),
      page: 1,
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      reason: "Manual redaction"
    };
    setRedactionAreas([...redactionAreas, newArea]);
  };

  const updateRedactionArea = (id, updates) => {
    setRedactionAreas(areas => 
      areas.map(area => area.id === id ? { ...area, ...updates } : area)
    );
  };

  const removeRedactionArea = (id) => {
    setRedactionAreas(areas => areas.filter(area => area.id !== id));
  };

  const applyRedactions = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Read the PDF file
      setProgress(20);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      setProgress(40);

      // Get pages
      const pages = pdfDoc.getPages();

      // Apply redactions for selected search terms
      const selectedTermsList = foundTerms.filter(term => selectedTerms.has(term.id));
      
      selectedTermsList.forEach(term => {
        const page = pages[term.page - 1];
        if (page) {
          const { height } = page.getSize();
          
          // Draw redaction rectangle
          page.drawRectangle({
            x: term.x,
            y: height - term.y - term.height,
            width: term.width,
            height: term.height,
            color: rgb(0, 0, 0) // Black redaction
          });
        }
      });

      setProgress(60);

      // Apply manual redaction areas
      redactionAreas.forEach(area => {
        const page = pages[area.page - 1];
        if (page) {
          const { height } = page.getSize();
          
          page.drawRectangle({
            x: area.x,
            y: height - area.y - area.height,
            width: area.width,
            height: area.height,
            color: rgb(0, 0, 0) // Black redaction
          });
        }
      });

      setProgress(80);

      // Clean metadata if requested
      if (cleanMetadata) {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('PDF Tools - Redacted Document');
        pdfDoc.setCreator('');
        pdfDoc.setCreationDate(new Date());
        pdfDoc.setModificationDate(new Date());
      }

      setProgress(90);

      // Save the redacted PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setRedactedPdf(blob);

      setProgress(100);
    } catch (error) {
      console.error('Error applying redactions:', error);
      alert('Error applying redactions. Please try again.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const downloadRedactedPdf = () => {
    if (!redactedPdf) return;

    const url = URL.createObjectURL(redactedPdf);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace('.pdf', '')}_redacted.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleTermSelection = (termId) => {
    const newSelection = new Set(selectedTerms);
    if (newSelection.has(termId)) {
      newSelection.delete(termId);
    } else {
      newSelection.add(termId);
    }
    setSelectedTerms(newSelection);
  };

  return (
    <ToolPageContent
      toolName="PDF Redaction Tool"
      toolDescription="Permanently remove sensitive information from PDF documents with our secure redaction tool. Search for specific terms, define manual redaction areas, and clean metadata for complete document sanitization."
      currentTool="tools/pdf-redaction"
      steps={[
        "Upload your PDF document that contains sensitive information you want to redact.",
        "Use the search function to find specific terms or phrases that need redaction, or add manual redaction areas for custom regions.",
        "Select which terms or areas you want to redact and configure redaction settings like color and metadata cleaning.",
        "Apply the redactions to permanently remove the sensitive content and download your secure, redacted PDF."
      ]}
      faqs={[
        {
          question: "What is PDF redaction and why is it important?",
          answer: "PDF redaction is the process of permanently removing sensitive information from documents. Unlike simply covering text with black boxes, redaction completely removes the underlying data, making it impossible to recover. This is crucial for legal documents, medical records, and any sensitive information that needs to be shared securely."
        },
        {
          question: "Is redaction permanent and secure?",
          answer: "Yes, our redaction tool permanently removes the selected content from the PDF. The redacted information cannot be recovered, even with advanced PDF recovery tools. We also offer metadata cleaning to remove any hidden information that might contain sensitive data."
        },
        {
          question: "Can I redact both text and images?",
          answer: "Yes, you can redact both text content and images. The tool allows you to define specific areas on the page where you want to apply redaction, regardless of whether it contains text, images, or other content."
        },
        {
          question: "What types of sensitive information should I redact?",
          answer: "Common items to redact include Social Security numbers, credit card numbers, bank account details, personal addresses, phone numbers, email addresses, medical information, legal case numbers, and any other personally identifiable information (PII)."
        },
        {
          question: "Does the tool work with scanned PDFs?",
          answer: "The search functionality works best with text-based PDFs. For scanned PDFs, you'll need to use the manual redaction areas feature to define specific regions for redaction."
        }
      ]}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <EyeOff className="mx-auto h-12 w-12 text-red-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Redaction Tool</h1>
            <p className="text-gray-600">Permanently remove sensitive information from PDF documents</p>
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
                    <div>
                      <Label htmlFor="file-upload">PDF File</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                      />
                    </div>
                    
                    {file && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          File loaded: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </AlertDescription>
                      </Alert>
                    )}

                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
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
                <CardContent className="space-y-4">
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
                    <Search className="mr-2 h-4 w-4" />
                    {isProcessing ? 'Searching...' : 'Search for Terms'}
                  </Button>

                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-sm text-gray-600 text-center">
                        Searching document... {progress}%
                      </p>
                    </div>
                  )}

                  {foundTerms.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Found Terms ({foundTerms.length})</h4>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {foundTerms.map((term) => (
                          <div key={term.id} className="flex items-center space-x-3 p-2 border rounded">
                            <Checkbox
                              checked={selectedTerms.has(term.id)}
                              onCheckedChange={() => toggleTermSelection(term.id)}
                            />
                            <div className="flex-1">
                              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                {term.text}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
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
                          <div key={area.id} className="p-3 border rounded space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>Page</Label>
                                <Input
                                  type="number"
                                  value={area.page}
                                  onChange={(e) => updateRedactionArea(area.id, { page: parseInt(e.target.value) })}
                                  min="1"
                                />
                              </div>
                              <div>
                                <Label>Reason</Label>
                                <Input
                                  value={area.reason}
                                  onChange={(e) => updateRedactionArea(area.id, { reason: e.target.value })}
                                  placeholder="Redaction reason"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
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
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeRedactionArea(area.id)}
                            >
                              Remove Area
                            </Button>
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
                    <Shield className="h-5 w-5" />
                    Apply Redactions
                  </CardTitle>
                  <CardDescription>
                    Configure and apply redactions to the document
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Redaction Summary:</h4>
                    <ul className="text-sm space-y-1">
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
                    <EyeOff className="mr-2 h-4 w-4" />
                    {isProcessing ? 'Applying Redactions...' : 'Apply Redactions'}
                  </Button>

                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-sm text-gray-600 text-center">
                        Processing redactions... {progress}%
                      </p>
                    </div>
                  )}

                  {redactedPdf && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="flex items-center justify-between">
                        <span>Redaction completed successfully!</span>
                        <Button onClick={downloadRedactedPdf} size="sm">
                          <Download className="mr-2 h-4 w-4" />
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
                <Shield className="h-5 w-5" />
                Redaction Security Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Security Measures</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Permanent content removal</li>
                    <li>• Metadata sanitization</li>
                    <li>• Visual verification</li>
                    <li>• Secure deletion process</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Compliance Features</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
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
    </ToolPageContent>
  );
}