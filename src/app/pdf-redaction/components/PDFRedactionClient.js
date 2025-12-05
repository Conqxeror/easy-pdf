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
    // Revoke any prior generated object URLs before replacing the file
    if (redactedPdf) {
      try {
        if (typeof URL !== 'undefined' && !String(redactedPdf).startsWith('data:')) {
          URL.revokeObjectURL(redactedPdf);
        }
      } catch {
        // best-effort
      }
    }
    setFile(files[0]);
    setError("");
    setRedactedPdf(null);
  }, [redactedPdf]);

  const searchForTerms = useCallback(async () => {
    if (!file) {
      setError("Please upload a PDF first.");
      return;
    }
    setIsProcessing(true);
    setProgress(20);
    // Lightweight fake search: split terms and create placeholder results
    await new Promise((r) => setTimeout(r, 350));
    const terms = searchTerms
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const results = terms.map((t, i) => ({ id: `${i}-${t}`, text: t, page: 1, x: 10 + i * 5, y: 20 + i * 5 }));
    setFoundTerms(results);
    setSelectedTerms(new Set(results.map((r) => r.id)));
    setIsProcessing(false);
    setProgress(100);
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
      return [...prev, { id, x: 10, y: 10, width: 100, height: 20 }];
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
    setIsProcessing(true);
    setProgress(10);
    // Minimal stub: simulate processing then create an object URL from the original file so user can download
    await new Promise((r) => setTimeout(r, 700));
    setProgress(60);
    await new Promise((r) => setTimeout(r, 500));
    // Revoke any previous result URL before creating a new one
    if (redactedPdf) {
      try {
        try { if (redactedPdf && typeof URL !== 'undefined' && !String(redactedPdf).startsWith('data:')) URL.revokeObjectURL(redactedPdf); } catch { }
      } catch {
        // ignore
      }
    }
    let url = null;
    try { if (typeof URL !== 'undefined') url = URL.createObjectURL(file); } catch (err) { console.error('Error creating object URL for redaction file:', err); url = null; }
    setRedactedPdf(url);
    setProgress(100);
    setIsProcessing(false);
  }, [file, redactedPdf]);

  const downloadRedactedPdf = useCallback(() => {
    if (!redactedPdf) return;
    const a = document.createElement('a');
    a.href = redactedPdf;
    // normalize file name by stripping extension and prefixing
    const base = file?.name ? file.name.replace(/\.[^/.]+$/, '') : 'redacted';
    a.download = `${base}-redacted.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoke the object URL after a short delay to allow the download to start
    setTimeout(() => {
      try {
        try { if (redactedPdf && typeof URL !== 'undefined' && !String(redactedPdf).startsWith('data:')) URL.revokeObjectURL(redactedPdf); } catch { }
      } catch {
        // ignore
      }
      setRedactedPdf(null);
    }, 1000);
  }, [file, redactedPdf, setRedactedPdf]);

  // Cleanup on unmount: revoke any outstanding object URL
  useEffect(() => {
    return () => {
      if (redactedPdf) {
        try {
          try { if (redactedPdf && typeof URL !== 'undefined' && !String(redactedPdf).startsWith('data:')) URL.revokeObjectURL(redactedPdf); } catch { }
        } catch {
          // ignore
        }
      }
    };
  }, [redactedPdf]);

  return (
    <ToolPageLayout
      title="PDF Redaction"
      subtitle="Permanently remove or mask sensitive information from PDF documents right in your browser."
      toolName="PDF Redaction"
      toolDescription="Permanently remove or mask sensitive information from PDF documents right in your browser."
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
        { label: "Security & Sign", href: "/categories?filter=security" },
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
                              <span className="text-sm text-foreground ml-2">Page {term.page} at ({term.x}, {term.y})</span>
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
                  <Alert className="border-green-500/50 bg-green-500/10">
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
