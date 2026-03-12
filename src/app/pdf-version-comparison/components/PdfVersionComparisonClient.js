"use client";

import React, { useCallback, useState } from "react";
import { diffWords } from "diff";
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
import { loadPdfJs } from "@/lib/pdfjsWorker";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import ToolPageLayout from "@/components/ui/ToolPageLayout";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const steps = [
  "Upload the original PDF on the left and the revised version on the right (up to 50 MB each).",
  "Pick the comparison mode – full, text-only, or metadata-first – depending on the review you need.",
  "Run the browser-side analysis to inspect text, metadata, page count, and layout differences.",
  "Review the change log, inspect statistics, and export a JSON report for sign-off."
];

const features = [
  "Page-by-page text diff summaries with added and removed word counts",
  "Metadata, page-count, and page-size checks to catch structural document drift",
  "Single-click export of the comparison report for audits or QA",
  "Client-side parsing powered by pdf-lib and PDF.js to keep files private"
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
    answer: "The viewer flags text edits, additions, deletions, metadata deltas, page-count changes, and page-size/layout shifts so you can review every meaningful change."
  },
  {
    question: "Do my PDFs leave the browser?",
    answer: "No. We parse both versions locally using pdf-lib and PDF.js, so nothing is uploaded to a server."
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

const severityColor = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400",
  low: "bg-muted text-foreground"
};

const changeTypeIcons = {
  text_addition: "➕",
  text_deletion: "➖",
  text_change: "✏️",
  formatting_change: "🎨",
  metadata_change: "🏷️",
  page_count_change: "📄",
  binary_change: "🔍"
};

const metadataFields = [
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  { key: "subject", label: "Subject" },
  { key: "creator", label: "Creator" },
  { key: "producer", label: "Producer" },
  { key: "keywords", label: "Keywords" }
];

const normalizeExtractedText = (value = "") => value.replace(/\s+/g, " ").trim();

const countWords = (value = "") => {
  const normalized = normalizeExtractedText(value);
  return normalized ? normalized.split(" ").filter(Boolean).length : 0;
};

const summarizeChangedText = (parts = []) => {
  const changedSnippet = parts
    .filter((part) => part.added || part.removed)
    .map((part) => part.value.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!changedSnippet) return "";

  return changedSnippet.length > 160 ? `${changedSnippet.slice(0, 157)}...` : changedSnippet;
};

const formatFileSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const formatDuration = (durationMs) => `${(durationMs / 1000).toFixed(1)} seconds`;

const hashArrayBuffer = async (arrayBuffer) => {
  if (!globalThis.crypto?.subtle) return null;

  const digest = await globalThis.crypto.subtle.digest("SHA-256", arrayBuffer);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
};

const extractPdfSnapshot = async ({ file, comparisonType, progressStart, progressEnd, setProgress }) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjs = await loadPdfJs();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const { PDFDocument } = await getPdfLib();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const pages = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      let text = "";

      if (comparisonType !== "metadata") {
        const textContent = await page.getTextContent();
        text = normalizeExtractedText(textContent.items.map((item) => item.str).join(" "));
      }

      pages.push({
        pageNumber,
        width: Math.round(viewport.width),
        height: Math.round(viewport.height),
        text
      });

      if (typeof page.cleanup === "function") {
        page.cleanup();
      }

      const ratio = pageNumber / pdf.numPages;
      setProgress(Math.round(progressStart + (progressEnd - progressStart) * ratio));
    }
  } finally {
    try {
      await loadingTask.destroy();
    } catch {
      // Ignore cleanup failures from pdf.js.
    }

    try {
      await pdf.destroy();
    } catch {
      // Ignore cleanup failures from pdf.js.
    }
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    fileHash: await hashArrayBuffer(arrayBuffer),
    pageCount: pdf.numPages,
    metadata: {
      title: pdfDoc.getTitle() || "",
      author: pdfDoc.getAuthor() || "",
      subject: pdfDoc.getSubject() || "",
      creator: pdfDoc.getCreator() || "",
      producer: pdfDoc.getProducer() || "",
      keywords: pdfDoc.getKeywords() || ""
    },
    pages
  };
};

const buildComparisonSummary = ({ originalSnapshot, revisedSnapshot, comparisonType, durationMs }) => {
  const differences = [];
  let nextId = 1;

  const pushDifference = (difference) => {
    differences.push({ id: nextId, ...difference });
    nextId += 1;
  };

  if (originalSnapshot.pageCount !== revisedSnapshot.pageCount) {
    pushDifference({
      type: "page_count_change",
      severity: "high",
      description: `Page count changed from ${originalSnapshot.pageCount} to ${revisedSnapshot.pageCount}.`,
      details: revisedSnapshot.pageCount > originalSnapshot.pageCount
        ? `${revisedSnapshot.pageCount - originalSnapshot.pageCount} page(s) were added in the revised PDF.`
        : `${originalSnapshot.pageCount - revisedSnapshot.pageCount} page(s) were removed in the revised PDF.`
    });
  }

  metadataFields.forEach(({ key, label }) => {
    const originalValue = String(originalSnapshot.metadata[key] || "").trim();
    const revisedValue = String(revisedSnapshot.metadata[key] || "").trim();

    if (originalValue !== revisedValue) {
      pushDifference({
        type: "metadata_change",
        severity: "low",
        description: `${label} metadata changed.`,
        details: `${originalValue || "(empty)"} → ${revisedValue || "(empty)"}`
      });
    }
  });

  const pagesCompared = Math.min(originalSnapshot.pages.length, revisedSnapshot.pages.length);

  if (comparisonType !== "metadata") {
    for (let index = 0; index < pagesCompared; index += 1) {
      const originalPage = originalSnapshot.pages[index];
      const revisedPage = revisedSnapshot.pages[index];

      if (originalPage.width !== revisedPage.width || originalPage.height !== revisedPage.height) {
        pushDifference({
          type: "formatting_change",
          page: index + 1,
          severity: "medium",
          description: `Page ${index + 1} size changed.`,
          details: `${originalPage.width}×${originalPage.height} → ${revisedPage.width}×${revisedPage.height}`
        });
      }

      if (originalPage.text !== revisedPage.text) {
        const wordDiff = diffWords(originalPage.text || "", revisedPage.text || "");
        const addedWords = wordDiff.filter((part) => part.added).reduce((total, part) => total + countWords(part.value), 0);
        const removedWords = wordDiff.filter((part) => part.removed).reduce((total, part) => total + countWords(part.value), 0);
        const changedWords = addedWords + removedWords;

        let type = "text_change";
        let description = `Text changed on page ${index + 1}.`;

        if (!originalPage.text && revisedPage.text) {
          type = "text_addition";
          description = `Extractable text was added on page ${index + 1}.`;
        } else if (originalPage.text && !revisedPage.text) {
          type = "text_deletion";
          description = `Extractable text was removed from page ${index + 1}.`;
        } else if (addedWords > 0 || removedWords > 0) {
          description = `Text changed on page ${index + 1}: ${addedWords} word(s) added, ${removedWords} removed.`;
        }

        pushDifference({
          type,
          page: index + 1,
          severity: changedWords > 80 ? "high" : changedWords > 20 ? "medium" : "low",
          description,
          details: summarizeChangedText(wordDiff)
        });
      }
    }
  }

  if (!differences.length && originalSnapshot.fileHash && revisedSnapshot.fileHash && originalSnapshot.fileHash !== revisedSnapshot.fileHash) {
    pushDifference({
      type: "binary_change",
      severity: "low",
      description: "Binary PDF content changed even though extracted text, metadata, and page geometry matched.",
      details: "The revision likely contains image, annotation, font, or compression-level updates that do not change extracted text."
    });
  }

  const statistics = {
    totalChanges: differences.length,
    textChanges: differences.filter((difference) => difference.type.startsWith("text_")).length,
    formattingChanges: differences.filter((difference) => difference.type === "formatting_change" || difference.type === "page_count_change").length,
    metadataChanges: differences.filter((difference) => difference.type === "metadata_change").length,
    binaryChanges: differences.filter((difference) => difference.type === "binary_change").length,
    pagesCompared,
    similarityScore: Math.max(
      0,
      100 - differences.reduce((score, difference) => score + ({ low: 4, medium: 9, high: 16 }[difference.severity] || 6), 0)
    ),
    processingTime: formatDuration(durationMs)
  };

  return {
    differences,
    statistics,
    comparisonResult: {
      doc1Info: {
        name: originalSnapshot.fileName,
        pages: originalSnapshot.pageCount,
        size: formatFileSize(originalSnapshot.fileSize)
      },
      doc2Info: {
        name: revisedSnapshot.fileName,
        pages: revisedSnapshot.pageCount,
        size: formatFileSize(revisedSnapshot.fileSize)
      },
      comparisonDate: new Date().toLocaleString(),
      summary: differences.length
        ? `${differences.length} change(s) detected in ${pagesCompared} comparable page(s).`
        : "No detectable differences were found with the selected comparison mode."
    }
  };
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
  const [error, setError] = useState("");

  const handleFileUpload = useCallback(
    (setter) => (files) => {
      const uploadedFile = files?.[0];
      if (uploadedFile && uploadedFile.type === "application/pdf") {
        setter(uploadedFile);
        setComparisonResult(null);
        setDifferences([]);
        setStatistics(null);
        setError("");
      }
    },
    []
  );

  const compareDocuments = useCallback(async () => {
    if (!file1 || !file2) {
      setError("Upload both PDF versions before starting a comparison.");
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError("");
    setComparisonResult(null);
    setDifferences([]);
    setStatistics(null);

    try {
      const startedAt = performance.now();
      const originalSnapshot = await extractPdfSnapshot({
        file: file1,
        comparisonType,
        progressStart: 10,
        progressEnd: 45,
        setProgress
      });

      const revisedSnapshot = await extractPdfSnapshot({
        file: file2,
        comparisonType,
        progressStart: 45,
        progressEnd: 85,
        setProgress
      });

      setProgress(92);

      const summary = buildComparisonSummary({
        originalSnapshot,
        revisedSnapshot,
        comparisonType,
        durationMs: performance.now() - startedAt
      });

      setDifferences(summary.differences);
      setStatistics(summary.statistics);
      setComparisonResult(summary.comparisonResult);

      setProgress(100);
    } catch (error) {
      setError(error?.message || "Failed to compare PDF versions. Please try again.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1200);
    }
  }, [comparisonType, file1, file2]);

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
      setError("Unable to generate a download link in this browser.");
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
      subtitle="Compare two PDF revisions with real browser-side checks for text, metadata, page count, and layout drift."
      toolName="PDF Compare"
      toolDescription="Drop two revisions, inspect detected differences, and export a shareable report without uploading your files."
      currentTool="pdf-version-comparison"
      steps={steps}
      features={features}
      useCases={useCases}
      faqs={faqs}
      badge="New"
      icon={null}
      primaryActionHref="/pdf/merge"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Advanced PDF Tools", href: "/categories/advanced-pdf-tools" },
        { label: "PDF Version Comparison", href: "/pdf-version-comparison" }
      ]}
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                      <Eye className="mr-2 h-4 w-4" /> Full Check
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
                      <BarChart3 className="mr-2 h-4 w-4" /> Metadata First
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => void compareDocuments()}
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
                      <AlertDescription>{comparisonResult.summary}</AlertDescription>
                    </Alert>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-background rounded-none">
                        <h4 className="font-semibold text-foreground">Document 1</h4>
                        <p className="text-sm text-foreground">{comparisonResult.doc1Info.name}</p>
                        <p className="text-sm text-foreground">
                          {comparisonResult.doc1Info.pages} pages • {comparisonResult.doc1Info.size}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-none">
                        <h4 className="font-semibold text-green-900">Document 2</h4>
                        <p className="text-sm text-green-700">{comparisonResult.doc2Info.name}</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
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
                    <p className="text-muted-foreground">
                      {comparisonResult
                        ? "No differences were detected with the selected comparison mode."
                        : "No comparison results yet. Upload and compare documents first."}
                    </p>
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
                                  {typeof diff.page === "number" ? `Page ${diff.page}` : "Document-wide"}
                                </p>
                                {diff.details && <p className="text-xs text-muted-foreground mt-1">{diff.details}</p>}
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
                      <div className="text-center p-4 bg-muted rounded-none">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{statistics.similarityScore}%</div>
                        <div className="text-sm text-foreground">Similarity</div>
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
                            <span className="text-sm">Metadata Changes</span>
                            <Badge variant="outline">{statistics.metadataChanges}</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-background rounded-none">
                            <span className="text-sm">Binary-only Changes</span>
                            <Badge variant="outline">{statistics.binaryChanges}</Badge>
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
                            <span>Detection Scope:</span>
                            <span className="font-medium">
                              {comparisonType === "metadata" ? "Metadata only" : comparisonType === "text" ? "Text + structure" : "Text + metadata + structure"}
                            </span>
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
                <h4 className="font-semibold mb-2">Document Structure</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Page-count verification</li>
                  <li>• Page-size drift detection</li>
                  <li>• Metadata field comparison</li>
                  <li>• Binary revision fallback</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Text Analysis</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Word-level comparison</li>
                  <li>• Addition/deletion tracking</li>
                  <li>• Page-specific summaries</li>
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
