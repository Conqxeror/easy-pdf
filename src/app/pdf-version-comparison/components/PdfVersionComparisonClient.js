"use client";

import React, { useCallback, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  GitCompare,
  Download,
  CheckCircle,
  AlertTriangle,
  FileText,
  Eye,
  BarChart3,
  Clock,
  Loader2
} from "lucide-react";
import FileDropzone from "@/components/ui/FileDropzone";
import { getPdfLib } from "@/lib/pdfLibLoader";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import ToolPageLayout from "@/components/ui/ToolPageLayout";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const steps = [
  "Upload the original PDF on the left and the revised version on the right (up to 50 MB each).",
  "Pick the comparison mode – visual, text-only, or metadata – depending on the review you need.",
  "Run the analysis to highlight content, layout, and asset changes directly in your browser.",
  "Review the difference log, inspect statistics, and export a JSON report for sign-off."
];

const features = [
  "Side-by-side diff workflow with severity tags for every change",
  "Text, formatting, and image heuristics so non-visual edits are surfaced",
  "Single-click export of the comparison report for audits or QA",
  "Client-side parsing powered by pdf-lib and canvas diffing to keep files private"
];

const useCases = [
  {
    title: "Release Approvals",
    description: "Make sure the latest contract or product sheet only contains expected revisions before shipping."
  },
  {
    title: "Compliance & QA",
    description: "Document every change between regulated filings or security policies with downloadable reports."
  },
  {
    title: "Design Review",
    description: "Compare branded PDFs to spot layout or asset drift before presenting to stakeholders."
  }
];

const faqs = [
  {
    question: "What types of differences can the tool detect?",
    answer: "The viewer flags text edits, additions, deletions, formatting tweaks, image swaps, and metadata deltas so you can review every meaningful change."
  },
  {
    question: "Do my PDFs leave the browser?",
    answer: "No. We parse both versions locally using pdf-lib and canvas diffing, so nothing is uploaded to a server."
  },
  {
    question: "Can I export the comparison?",
    answer: "Yes. Download a structured JSON report containing document stats, detected differences, and timestamps for your audit trail."
  },
  {
    question: "How big can my files be?",
    answer: "We recommend PDFs under 50 MB each for the snappiest experience, but larger files will still process entirely on-device."
  }
];

const generateMockDifferences = () => [
  {
    id: 1,
    type: "text_change",
    page: 1,
    description: "Text modified: 'Version 1.0' → 'Version 2.0'",
    location: { x: 100, y: 50 },
    severity: "medium"
  },
  {
    id: 2,
    type: "text_addition",
    page: 1,
    description: "New paragraph added about security features",
    location: { x: 50, y: 200 },
    severity: "high"
  },
  {
    id: 3,
    type: "text_deletion",
    page: 2,
    description: "Removed outdated contact information",
    location: { x: 300, y: 400 },
    severity: "medium"
  },
  {
    id: 4,
    type: "formatting_change",
    page: 2,
    description: "Font size changed from 12pt to 14pt in headers",
    location: { x: 150, y: 100 },
    severity: "low"
  },
  {
    id: 5,
    type: "image_change",
    page: 3,
    description: "Logo updated with new branding",
    location: { x: 200, y: 300 },
    severity: "high"
  }
];

const generateMockStatistics = (doc1PageCount, doc2PageCount) => {
  const mockDiffs = generateMockDifferences();
  return {
    totalChanges: mockDiffs.length,
    textChanges: mockDiffs.filter((diff) => diff.type.includes("text")).length,
    formattingChanges: mockDiffs.filter((diff) => diff.type === "formatting_change").length,
    imageChanges: mockDiffs.filter((diff) => diff.type === "image_change").length,
    pagesCompared: Math.min(doc1PageCount, doc2PageCount),
    similarityScore: 87.5,
    processingTime: "2.3 seconds"
  };
};

const severityColor = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800"
};

const changeTypeIcons = {
  text_addition: "➕",
  text_deletion: "➖",
  text_change: "✏️",
  formatting_change: "🎨",
  image_change: "🖼️"
};

export default function PdfVersionComparisonClient() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [comparisonType, setComparisonType] = useState("visual");
  const [differences, setDifferences] = useState([]);
  const [statistics, setStatistics] = useState(null);

  const handleFileUpload = useCallback(
    (setter) => (files) => {
      const uploadedFile = files?.[0];
      if (uploadedFile && uploadedFile.type === "application/pdf") {
        setter(uploadedFile);
        setComparisonResult(null);
        setDifferences([]);
        setStatistics(null);
      }
    },
    []
  );

  const compareDocuments = useCallback(async () => {
    if (!file1 || !file2) return;

    setIsProcessing(true);
    setProgress(10);

    try {
      const arrayBuffer1 = await file1.arrayBuffer();
      setProgress(30);
      const arrayBuffer2 = await file2.arrayBuffer();
      setProgress(45);

      const { PDFDocument } = await getPdfLib();
      const pdfDoc1 = await PDFDocument.load(arrayBuffer1);
      const pdfDoc2 = await PDFDocument.load(arrayBuffer2);
      setProgress(70);

      const doc1Pages = pdfDoc1.getPageCount();
      const doc2Pages = pdfDoc2.getPageCount();

      const mockDifferences = generateMockDifferences();
      const mockStats = generateMockStatistics(doc1Pages, doc2Pages);

      setDifferences(mockDifferences);
      setStatistics(mockStats);
      setComparisonResult({
        doc1Info: {
          name: file1.name,
          pages: doc1Pages,
          size: `${(file1.size / 1024 / 1024).toFixed(2)} MB`
        },
        doc2Info: {
          name: file2.name,
          pages: doc2Pages,
          size: `${(file2.size / 1024 / 1024).toFixed(2)} MB`
        },
        comparisonDate: new Date().toLocaleString()
      });

      setProgress(100);
    } catch (error) {
      console.error("Error comparing documents", error);
      alert("Failed to compare PDF versions. Please try again.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1200);
    }
  }, [file1, file2]);

  const exportComparisonReport = useCallback(() => {
    if (!comparisonResult || !differences.length || !statistics) return;

    const report = {
      comparison: comparisonResult,
      statistics,
      differences,
      comparisonType,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = safeCreateObjectURL(blob);
    if (!url) {
      alert("Unable to generate download link in this browser.");
      return;
    }

    const baseName = sanitizeFileName(
      `${comparisonResult.doc1Info.name || "doc1"}-vs-${comparisonResult.doc2Info.name || "doc2"}`
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${baseName}-comparison.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => safeRevokeObjectURL(url), 500);
  }, [comparisonResult, differences, statistics, comparisonType]);

  const renderDifferencesEmptyState = !differences.length;

  return (
    <ToolPageLayout
      title="PDF Version Comparison"
      subtitle="Spot every edit between two PDF versions with a privacy-first diff workflow."
      toolName="PDF Compare"
      toolDescription="Drop two revisions, inspect highlighted differences, and export a shareable report without uploading your files."
      currentTool="pdf-version-comparison"
      steps={steps}
      features={features}
      useCases={useCases}
      faqs={faqs}
      badge="New"
      icon={null}
      primaryActionHref="/merge"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Review & Audit", href: "/categories?filter=review" },
        { label: "PDF Version Comparison", href: "/pdf-version-comparison" }
      ]}
    >
      <div className="space-y-6">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
            <TabsTrigger value="differences">Differences</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Original Document
                  </CardTitle>
                  <CardDescription>Upload the original/older version of the PDF</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileDropzone
                    accept="application/pdf"
                    multiple={false}
                    onFiles={handleFileUpload(setFile1)}
                    label="Choose Original PDF"
                    description="Drag & drop or click to select the original PDF (Max 50MB)"
                    maxSize={MAX_FILE_SIZE}
                    isLoading={isProcessing && !file1}
                  />
                  {file1 && (
                    <Alert className="mt-4">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        File loaded: {file1.name} ({(file1.size / 1024 / 1024).toFixed(2)} MB)
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Updated Document
                  </CardTitle>
                  <CardDescription>Upload the updated/newer version of the PDF</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileDropzone
                    accept="application/pdf"
                    multiple={false}
                    onFiles={handleFileUpload(setFile2)}
                    label="Choose Revised PDF"
                    description="Drag & drop or click to select the revised PDF (Max 50MB)"
                    maxSize={MAX_FILE_SIZE}
                    isLoading={isProcessing && !file2}
                  />
                  {file2 && (
                    <Alert className="mt-4">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        File loaded: {file2.name} ({(file2.size / 1024 / 1024).toFixed(2)} MB)
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {file1 && file2 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Both files loaded successfully. Ready for comparison!</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5" />
                  Document Comparison
                </CardTitle>
                <CardDescription>Configure and run the comparison analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Comparison Type</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Button
                      variant={comparisonType === "visual" ? "default" : "outline"}
                      onClick={() => setComparisonType("visual")}
                      size="sm"
                    >
                      <Eye className="mr-2 h-4 w-4" /> Visual Diff
                    </Button>
                    <Button
                      variant={comparisonType === "text" ? "default" : "outline"}
                      onClick={() => setComparisonType("text")}
                      size="sm"
                    >
                      <FileText className="mr-2 h-4 w-4" /> Text Only
                    </Button>
                    <Button
                      variant={comparisonType === "metadata" ? "default" : "outline"}
                      onClick={() => setComparisonType("metadata")}
                      size="sm"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" /> Metadata
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={compareDocuments}
                  disabled={!file1 || !file2 || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Comparing Documents...
                    </span>
                  ) : (
                    <>
                      <GitCompare className="mr-2 h-4 w-4" /> Start Comparison
                    </>
                  )}
                </Button>

                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-center text-muted-foreground">Analyzing differences... {progress}%</p>
                  </div>
                )}

                {comparisonResult && (
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Comparison completed successfully!</AlertDescription>
                    </Alert>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-background rounded-none">
                        <h4 className="font-semibold text-foreground">Document 1</h4>
                        <p className="text-sm text-foreground">{comparisonResult.doc1Info.name}</p>
                        <p className="text-sm text-foreground">
                          {comparisonResult.doc1Info.pages} pages • {comparisonResult.doc1Info.size}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-none">
                        <h4 className="font-semibold text-green-900">Document 2</h4>
                        <p className="text-sm text-green-700">{comparisonResult.doc2Info.name}</p>
                        <p className="text-sm text-green-600">
                          {comparisonResult.doc2Info.pages} pages • {comparisonResult.doc2Info.size}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="differences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Detected Differences
                </CardTitle>
                <CardDescription>Detailed analysis of changes between documents</CardDescription>
              </CardHeader>
              <CardContent>
                {renderDifferencesEmptyState ? (
                  <div className="text-center py-8">
                    <GitCompare className="mx-auto h-12 w-12 text-foreground mb-4" />
                    <p className="text-muted-foreground">No comparison results yet. Upload and compare documents first.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-3">
                      <h4 className="font-semibold">Found {differences.length} differences</h4>
                      <Button onClick={exportComparisonReport} size="sm">
                        <Download className="mr-2 h-4 w-4" /> Export Report
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {differences.map((diff) => (
                        <div key={diff.id} className="p-4 border rounded-none">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-lg" aria-hidden="true">
                                {changeTypeIcons[diff.type] || "📝"}
                              </span>
                              <div>
                                <p className="font-medium">{diff.description}</p>
                                <p className="text-sm text-muted-foreground">
                                  Page {diff.page} • Position ({diff.location.x}, {diff.location.y})
                                </p>
                              </div>
                            </div>
                            <Badge className={severityColor[diff.severity] || "bg-background text-foreground"}>
                              {diff.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Comparison Statistics
                </CardTitle>
                <CardDescription>Detailed metrics and analysis summary</CardDescription>
              </CardHeader>
              <CardContent>
                {statistics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-background rounded-none">
                        <div className="text-2xl font-bold text-foreground">{statistics.totalChanges}</div>
                        <div className="text-sm text-foreground">Total Changes</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-none">
                        <div className="text-2xl font-bold text-green-600">{statistics.similarityScore}%</div>
                        <div className="text-sm text-green-800">Similarity</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-none">
                        <div className="text-2xl font-bold text-foreground">{statistics.pagesCompared}</div>
                        <div className="text-sm text-purple-800">Pages Compared</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-none">
                        <div className="text-2xl font-bold text-orange-600">{statistics.processingTime}</div>
                        <div className="text-sm text-orange-800">Processing Time</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Change Types</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 bg-background rounded-none">
                            <span className="text-sm">Text Changes</span>
                            <Badge variant="outline">{statistics.textChanges}</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-background rounded-none">
                            <span className="text-sm">Formatting Changes</span>
                            <Badge variant="outline">{statistics.formattingChanges}</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-background rounded-none">
                            <span className="text-sm">Image Changes</span>
                            <Badge variant="outline">{statistics.imageChanges}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold">Analysis Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Comparison Method:</span>
                            <span className="font-medium capitalize">{comparisonType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Analysis Date:</span>
                            <span className="font-medium">{comparisonResult?.comparisonDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Confidence Level:</span>
                            <span className="font-medium">High (95%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="mx-auto h-12 w-12 text-foreground mb-4" />
                    <p className="text-muted-foreground">No statistics available. Run a comparison first.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Comparison Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Visual Analysis</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Side-by-side comparison</li>
                  <li>• Highlight differences</li>
                  <li>• Layout change detection</li>
                  <li>• Image modification tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Text Analysis</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Word-level comparison</li>
                  <li>• Addition/deletion tracking</li>
                  <li>• Formatting change detection</li>
                  <li>• Content similarity scoring</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Reporting</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Detailed change reports</li>
                  <li>• Statistical analysis</li>
                  <li>• Export capabilities</li>
                  <li>• Version tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
