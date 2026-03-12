"use client";

import React, { useState, useCallback, useEffect } from "react";
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
import FileDropzone from '@/components/ui/FileDropzone';
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { getPdfLib } from "@/lib/pdfLibLoader";
import { loadPdfJs } from "@/lib/pdfjsWorker";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";

const RENDER_SCALE = 2;

const normalizeSearchTerms = (value) => value
  .split(',')
  .map((term) => term.trim())
  .filter(Boolean);

const hexToRgbCss = (value) => value || '#000000';

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

  const handleFile = useCallback((files) => {
    if (!files || files.length === 0) return;
    if (redactedPdf) {
      safeRevokeObjectURL(redactedPdf);
    }
    setFile(files[0]);
    setError("");
    setRedactedPdf(null);
    setFoundTerms([]);
    setSelectedTerms(new Set());
  }, [redactedPdf]);

  const searchForTerms = useCallback(async () => {
    if (!file) {
      setError("Please upload a PDF first.");
      return;
    }

    const terms = normalizeSearchTerms(searchTerms);
    if (!terms.length) {
      setError('Enter one or more comma-separated search terms first.');
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await loadPdfJs();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const matches = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const textContent = await page.getTextContent();

        textContent.items.forEach((item, index) => {
          const rawText = String(item.str || '');
          const normalizedText = rawText.toLowerCase();

          if (!normalizedText.trim()) return;

          terms.forEach((term) => {
            if (!normalizedText.includes(term.toLowerCase())) return;

            const itemWidth = Math.max(24, item.width || (rawText.length * 6));
            const itemHeight = Math.max(12, Math.abs(item.height || item.transform?.[3] || 12));

            matches.push({
              id: `${pageNumber}-${index}-${term}`,
              text: term,
              preview: rawText.trim(),
              page: pageNumber,
              x: Math.max(0, item.transform?.[4] || 0),
              y: Math.max(0, viewport.height - (item.transform?.[5] || 0) - itemHeight),
              width: itemWidth,
              height: itemHeight,
            });
          });
        });

        if (typeof page.cleanup === 'function') {
          page.cleanup();
        }

        setProgress(Math.round((pageNumber / pdf.numPages) * 100));
      }

      try {
        await loadingTask.destroy();
      } catch {
        // ignore
      }

      setFoundTerms(matches);
      setSelectedTerms(new Set(matches.map((match) => match.id)));

      if (!matches.length) {
        setError('No matching text was found in the extracted PDF text layer. For scanned PDFs, add manual areas instead.');
      }
    } catch (searchError) {
      setError(searchError?.message || 'Unable to search this PDF.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 500);
    }
  }, [file, searchTerms]);

  const toggleTermSelection = useCallback((id) => {
    setSelectedTerms((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  }, []);

  const addManualRedactionArea = useCallback(() => {
    setRedactionAreas((prev) => {
      const id = prev.length + 1;
      return [...prev, { id, page: 1, x: 10, y: 10, width: 100, height: 20 }];
    });
  }, []);

  const updateRedactionArea = useCallback((id, patch) => {
    setRedactionAreas((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const removeRedactionArea = useCallback((id) => {
    setRedactionAreas((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const applyRedactions = useCallback(async () => {
    if (!file) {
      setError("Please upload a PDF first.");
      return;
    }

    if (selectedTerms.size === 0 && redactionAreas.length === 0) {
      setError('Select at least one search result or manual area before redacting.');
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError('');

    try {
      const [arrayBuffer, pdfjs, { PDFDocument } ] = await Promise.all([
        file.arrayBuffer(),
        loadPdfJs(),
        getPdfLib(),
      ]);
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const outputPdf = await PDFDocument.create();

      const selectedSearchAreas = foundTerms.filter((term) => selectedTerms.has(term.id));

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const renderViewport = page.getViewport({ scale: RENDER_SCALE });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Canvas rendering is unavailable in this browser.');
        }

        canvas.width = Math.ceil(renderViewport.width);
        canvas.height = Math.ceil(renderViewport.height);

        await page.render({
          canvasContext: context,
          viewport: renderViewport,
        }).promise;

        context.fillStyle = hexToRgbCss(redactionColor);

        const areasForPage = [
          ...selectedSearchAreas.filter((term) => term.page === pageNumber),
          ...redactionAreas.filter((area) => area.page === pageNumber),
        ];

        areasForPage.forEach((area) => {
          context.fillRect(
            area.x * RENDER_SCALE,
            area.y * RENDER_SCALE,
            area.width * RENDER_SCALE,
            area.height * RENDER_SCALE,
          );
        });

        const pngBytes = await fetch(canvas.toDataURL('image/png')).then((response) => response.arrayBuffer());
        const embeddedImage = await outputPdf.embedPng(pngBytes);
        const outputPage = outputPdf.addPage([viewport.width, viewport.height]);

        outputPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });

        if (typeof page.cleanup === 'function') {
          page.cleanup();
        }

        setProgress(Math.round((pageNumber / pdf.numPages) * 85));
      }

      if (cleanMetadata) {
        outputPdf.setTitle(`${sanitizeFileName(file.name.replace(/\.[^/.]+$/, '')) || 'document'} - redacted`);
        outputPdf.setAuthor('');
        outputPdf.setSubject('Redacted document');
        outputPdf.setKeywords(['redacted', 'easy-pdf']);
        outputPdf.setCreator('easy-pdf redaction tool');
        outputPdf.setProducer('easy-pdf redaction tool');
      }

      const pdfBytes = await outputPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      if (redactedPdf) {
        safeRevokeObjectURL(redactedPdf);
      }

      const url = safeCreateObjectURL(blob);
      if (!url) {
        throw new Error('Unable to create a download URL for the redacted PDF.');
      }

      setRedactedPdf(url);
      setProgress(100);

      try {
        await loadingTask.destroy();
      } catch {
        // ignore
      }
    } catch (redactionError) {
      setError(redactionError?.message || 'Unable to redact this PDF.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 800);
    }
  }, [file, redactedPdf]);

  const downloadRedactedPdf = useCallback(() => {
    if (!redactedPdf) return;
    const a = document.createElement('a');
    a.href = redactedPdf;
    const base = file?.name ? sanitizeFileName(file.name.replace(/\.[^/.]+$/, '')) : 'redacted';
    a.download = `${base}-redacted.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => {
      safeRevokeObjectURL(redactedPdf);
      setRedactedPdf(null);
    }, 1000);
  }, [file, redactedPdf, setRedactedPdf]);

  useEffect(() => {
    return () => {
      if (redactedPdf) {
        safeRevokeObjectURL(redactedPdf);
      }
    };
  }, [redactedPdf]);

  return (
    <ToolPageLayout
      title="PDF Redaction"
      subtitle="Flatten and redact sensitive PDF content entirely in your browser."
      toolName="PDF Redaction"
      toolDescription="Search for text, define manual areas, and generate a flattened redacted PDF so masked content is no longer exposed in the output text layer."
      currentTool="pdf-redaction"
      steps={[
        "Upload or drop your PDF using the file selector or drag & drop area.",
        "Use the 'Search & Mark' tab to find text patterns (emails, SSNs, numbers).",
        "Add manual redaction areas for images or custom regions.",
        "Review your selections and click 'Apply Redactions' to generate the redacted PDF.",
        "Download the redacted PDF and verify the output locally."
      ]}
      faqs={[
        { question: "Is redaction reversible?", answer: "No — redaction permanently removes the selected content from the output PDF. Always keep a backup of the original." },
        { question: "Does this upload files?", answer: "No. All processing happens client-side in your browser; nothing is sent to our servers by default." },
        { question: "Can I redact images as well as text?", answer: "Yes — use the Manual Areas tab to define rectangles that cover images or any visual content." },
        { question: "Is this suitable for compliance needs?", answer: "The tool is designed to help with GDPR/HIPAA-style redaction workflows, but for high-assurance legal requirements, validate results with your compliance team." },
        { question: "How do I verify redactions?", answer: "Open the redacted PDF and visually inspect pages; for critical use-cases, use dedicated PDF forensics tools to verify removal." }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Advanced PDF Tools", href: "/categories/advanced-pdf-tools" },
        { label: "PDF Redaction", href: "/pdf-redaction" }
      ]}
    >
      <div className="space-y-6 w-full">
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
                <CardDescription>Select a PDF document to redact sensitive information</CardDescription>
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
                <CardDescription>Find text patterns that need redaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search-terms">Search Terms (comma-separated)</Label>
                    <Textarea
                      id="search-terms"
                      placeholder="SSN, credit card, email, phone numbers, etc."
                      value={searchTerms}
                      onChange={(e) => setSearchTerms(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button onClick={searchForTerms} disabled={!file || isProcessing} className="w-full">
                    {isProcessing ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
                      </span>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" aria-hidden="true" /> Search for Terms
                      </>
                    )}
                  </Button>

                  {foundTerms.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Found Terms ({foundTerms.length})</h4>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {foundTerms.map((term) => (
                          <div key={term.id} className="flex items-center space-x-3 p-2 border border-border bg-background">
                            <Checkbox checked={selectedTerms.has(term.id)} onCheckedChange={() => toggleTermSelection(term.id)} />
                            <div className="flex-1">
                              <span className="font-mono text-sm bg-background px-2 py-1">{term.text}</span>
                              <span className="text-sm text-foreground ml-2">Page {term.page} • “{term.preview}”</span>
                            </div>
                          </div>
                        ))}
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
                  <Trash2 className="h-5 w-5" aria-hidden="true" /> Manual Redaction Areas
                </CardTitle>
                <CardDescription>Define specific areas to redact manually</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={addManualRedactionArea} className="w-full">Add Redaction Area</Button>

                {redactionAreas.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Redaction Areas ({redactionAreas.length})</h4>
                    <div className="max-h-60 overflow-y-auto space-y-3">
                      {redactionAreas.map((area) => (
                        <div key={area.id} className="p-4 border border-border bg-background space-y-3">
                          <div className="flex justify-between items-center">
                            <h5 className="font-medium">Area #{area.id}</h5>
                            <Button variant="destructive" size="sm" onClick={() => removeRedactionArea(area.id)}>Remove</Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label>Page</Label>
                              <Input type="number" min="1" value={area.page} onChange={(e) => updateRedactionArea(area.id, { page: parseInt(e.target.value || '1', 10) || 1 })} />
                            </div>
                            <div>
                              <Label>X</Label>
                              <Input type="number" value={area.x} onChange={(e) => updateRedactionArea(area.id, { x: parseInt(e.target.value) })} />
                            </div>
                            <div>
                              <Label>Y</Label>
                              <Input type="number" value={area.y} onChange={(e) => updateRedactionArea(area.id, { y: parseInt(e.target.value) })} />
                            </div>
                            <div>
                              <Label>Width</Label>
                              <Input type="number" value={area.width} onChange={(e) => updateRedactionArea(area.id, { width: parseInt(e.target.value) })} />
                            </div>
                            <div>
                              <Label>Height</Label>
                              <Input type="number" value={area.height} onChange={(e) => updateRedactionArea(area.id, { height: parseInt(e.target.value) })} />
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
                  <EyeOff className="h-5 w-5" aria-hidden="true" /> Apply Redactions
                </CardTitle>
                <CardDescription>Permanently remove selected content from your document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="clean-metadata" checked={cleanMetadata} onCheckedChange={setCleanMetadata} />
                    <Label htmlFor="clean-metadata">Clean document metadata (recommended)</Label>
                  </div>

                  <div>
                    <Label htmlFor="redaction-color">Redaction Color</Label>
                    <Input id="redaction-color" type="color" value={redactionColor} onChange={(e) => setRedactionColor(e.target.value)} className="w-20" />
                  </div>
                </div>

                <div className="p-4 bg-background">
                  <h4 className="font-semibold mb-2">Redaction Summary:</h4>
                  <ul className="text-sm space-y-1 text-foreground">
                    <li>• Selected search terms: {selectedTerms.size}</li>
                    <li>• Manual redaction areas: {redactionAreas.length}</li>
                    <li>• Metadata cleaning: {cleanMetadata ? 'Enabled' : 'Disabled'}</li>
                    <li>• Output mode: Flattened image-based PDF for safer text removal</li>
                  </ul>
                </div>

                <Button onClick={applyRedactions} disabled={!file || isProcessing || (selectedTerms.size === 0 && redactionAreas.length === 0)} className="w-full">
                  {isProcessing ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Applying Redactions...
                    </span>
                  ) : (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" aria-hidden="true" /> Apply Redactions
                    </>
                  )}
                </Button>

                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-foreground text-center">Processing redactions... {progress}%</p>
                  </div>
                )}

                {redactedPdf && (
                  <Alert className="border-emerald-500/50 bg-emerald-500/10">
                    <CheckCircle className="h-4 w-4 text-green-400" aria-hidden="true" />
                    <AlertDescription className="flex items-center justify-between">
                      <span className="text-green-400">Redaction completed successfully!</span>
                      <Button onClick={downloadRedactedPdf} size="sm" variant="success">
                        <Download className="mr-2 h-4 w-4" aria-hidden="true" /> Download
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
              <Shield className="h-5 w-5" aria-hidden="true" /> Redaction Security Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Security Measures</h4>
                <ul className="space-y-1 text-sm text-foreground">
                  <li>• Permanent content removal</li>
                  <li>• Metadata sanitization</li>
                  <li>• Visual verification</li>
                  <li>• Secure deletion process</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Compliance Features</h4>
                <ul className="space-y-1 text-sm text-foreground">
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
    </ToolPageLayout>
  );
}
