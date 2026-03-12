"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { loadPdfJs } from "@/lib/pdfjsWorker";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, CheckCircle, AlertTriangle, XCircle, FileText, Eye, Palette, Type, Image as ImageIcon, List, Shield, Loader2 } from 'lucide-react';
import ToolPageLayout from '@/components/ui/ToolPageLayout';
import { toast } from "sonner";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";

const flattenStructTree = (node, collected = []) => {
  if (!node) return collected;

  collected.push(node);

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => flattenStructTree(child, collected));
  }

  return collected;
};

const getImageOperationCount = (operatorList, pdfjsLib) => {
  if (!operatorList?.fnArray || !pdfjsLib?.OPS) return 0;

  const imageOps = new Set([
    pdfjsLib.OPS.paintImageXObject,
    pdfjsLib.OPS.paintInlineImageXObject,
    pdfjsLib.OPS.paintInlineImageXObjectGroup,
    pdfjsLib.OPS.paintImageMaskXObject,
    pdfjsLib.OPS.paintJpegXObject,
  ].filter((value) => typeof value === 'number'));

  return operatorList.fnArray.filter((operation) => imageOps.has(operation)).length;
};

const collectAccessibilityContext = async ({ pdf, pdfjsLib, setProgress }) => {
  const metadata = await pdf.getMetadata().catch(() => ({ info: {}, metadata: null }));
  const fieldObjects = typeof pdf.getFieldObjects === 'function'
    ? await pdf.getFieldObjects().catch(() => null)
    : null;

  const context = {
    totalPages: pdf.numPages,
    info: metadata?.info || {},
    xmpMetadata: metadata?.metadata || null,
    taggedPages: 0,
    headingSignals: 0,
    imagePages: 0,
    imagePagesMissingAltText: 0,
    readingOrderPasses: 0,
    lowTextPages: 0,
    formFieldCount: fieldObjects ? Object.keys(fieldObjects).length : 0,
  };

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const textItems = textContent.items
      .map((item) => ({
        text: String(item.str || '').trim(),
        height: Math.abs(item.height || item.transform?.[3] || 0),
        y: item.transform?.[5] || 0,
      }))
      .filter((item) => item.text.length > 0);

    if (!textItems.length) {
      context.lowTextPages += 1;
    }

    const averageHeight = textItems.length
      ? textItems.reduce((sum, item) => sum + item.height, 0) / textItems.length
      : 0;

    const headingLikeItems = textItems.filter((item) => item.text.length <= 120 && item.height >= averageHeight * 1.3);
    context.headingSignals += headingLikeItems.length;

    let readingOrderViolations = 0;
    for (let index = 1; index < textItems.length; index += 1) {
      if (textItems[index].y > textItems[index - 1].y + 24) {
        readingOrderViolations += 1;
      }
    }

    if (textItems.length === 0 || readingOrderViolations <= Math.max(2, Math.ceil(textItems.length * 0.05))) {
      context.readingOrderPasses += 1;
    }

    const structTree = typeof page.getStructTree === 'function'
      ? await page.getStructTree().catch(() => null)
      : null;
    const structNodes = flattenStructTree(structTree, []);
    const hasTaggedContent = structNodes.length > 0;
    const hasHeadingTags = structNodes.some((node) => /^H\d$/i.test(node.role || node.type || ''));
    const hasFigureAltText = structNodes.some((node) => {
      const role = String(node.role || node.type || '').toLowerCase();
      return role === 'figure' && Boolean(node.alt || node.altText || node.actualText);
    });

    if (hasTaggedContent) {
      context.taggedPages += 1;
    }

    if (hasHeadingTags) {
      context.headingSignals += 2;
    }

    const operatorList = await page.getOperatorList().catch(() => null);
    const imageOperationCount = getImageOperationCount(operatorList, pdfjsLib);

    if (imageOperationCount > 0) {
      context.imagePages += 1;
      if (!hasFigureAltText) {
        context.imagePagesMissingAltText += 1;
      }
    }

    if (typeof page.cleanup === 'function') {
      page.cleanup();
    }

    setProgress((pageNumber / pdf.numPages) * 80);
  }

  return context;
};

export default function PDFAccessibilityCheckerClient() {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('idle');

  const accessibilityChecks = [
    {
      id: 'title',
      name: 'Document Title',
      description: 'PDF must have a meaningful title',
      category: 'Structure',
      icon: <Type className="w-4 h-4" />
    },
    {
      id: 'language',
      name: 'Language Declaration',
      description: 'Document language must be specified',
      category: 'Structure',
      icon: <Type className="w-4 h-4" />
    },
    {
      id: 'tags',
      name: 'Tagged PDF',
      description: 'PDF must be properly tagged for screen readers',
      category: 'Structure',
      icon: React.createElement(List, { className: "w-4 h-4" })
    },
    {
      id: 'headings',
      name: 'Heading Structure',
      description: 'Proper heading hierarchy must be maintained',
      category: 'Structure',
      icon: React.createElement(List, { className: "w-4 h-4" })
    },
    {
      id: 'altText',
      name: 'Image Alt Text',
      description: 'All images must have alternative text',
      category: 'Images',
      icon: React.createElement(ImageIcon, { className: "w-4 h-4" })
    },
    {
      id: 'contrast',
      name: 'Color Contrast',
      description: 'Text must have sufficient color contrast',
      category: 'Visual',
      icon: React.createElement(Palette, { className: "w-4 h-4" })
    },
    {
      id: 'readingOrder',
      name: 'Reading Order',
      description: 'Content must have logical reading order',
      category: 'Structure',
      icon: React.createElement(Eye, { className: "w-4 h-4" })
    },
    {
      id: 'forms',
      name: 'Form Accessibility',
      description: 'Form fields must be properly labeled',
      category: 'Interactive',
      icon: React.createElement(FileText, { className: "w-4 h-4" })
    }
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const pdfFile = acceptedFiles[0];
    if (pdfFile && pdfFile.type === 'application/pdf') {
      setFile(pdfFile);
      setResults(null);
      setAnalysisStatus('idle');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const analyzeAccessibility = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisStatus('analyzing');
    setProgress(0);

    let pdf = null;
    try {
      const arrayBuffer = await file.arrayBuffer();

      // Dynamically load pdfjs and configure worker
      const pdfjsLib = await loadPdfJs();

      pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const context = await collectAccessibilityContext({ pdf, pdfjsLib, setProgress });

      const analysisResults = {
        fileName: file.name,
        totalPages: pdf.numPages,
        checks: [],
        score: 0,
        issues: [],
        recommendations: []
      };

      let completedChecks = 0;
      const totalChecks = accessibilityChecks.length;

      for (const check of accessibilityChecks) {
        const checkResult = await performAccessibilityCheck(check, context);
        analysisResults.checks.push(checkResult);

        if (!checkResult.passed) {
          analysisResults.issues.push({
            severity: checkResult.severity,
            message: checkResult.message,
            recommendation: checkResult.recommendation,
            category: check.category
          });
        }

        completedChecks++;
        setProgress(80 + ((completedChecks / totalChecks) * 20));
      }

      // Calculate overall score
      const passedChecks = analysisResults.checks.filter(c => c.passed).length;
      analysisResults.score = Math.round((passedChecks / totalChecks) * 100);

      // Generate recommendations
      analysisResults.recommendations = generateRecommendations(analysisResults);

      setResults(analysisResults);
      setAnalysisStatus('completed');

      // Destroy pdf.js document proxy to free memory (best-effort)
      try { if (pdf && typeof pdf.destroy === 'function') pdf.destroy(); } catch { /* ignore */ }
    } catch (error) {
      toast.error(error?.message || 'Analysis failed. Please try another file.');
      setAnalysisStatus('error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performAccessibilityCheck = async (check, context) => {
    const documentLanguage = context.info.Language || context.info.lang || context.xmpMetadata?.get?.('dc:language') || '';
    const documentTitle = context.info.Title || context.xmpMetadata?.get?.('dc:title') || '';
    const hasTaggedPages = context.taggedPages > 0;
    const hasHeadingSignals = context.headingSignals > 0;
    const hasImageAccessibilityIssues = context.imagePages > 0 && context.imagePagesMissingAltText > 0;
    const hasForms = context.formFieldCount > 0;

    switch (check.id) {
      case 'title':
        return {
          id: check.id,
          name: check.name,
          passed: Boolean(String(documentTitle).trim()),
          severity: String(documentTitle).trim() ? 'none' : 'high',
          message: String(documentTitle).trim() ? 'Document has a title in its PDF metadata' : 'Document is missing a title in its PDF metadata',
          recommendation: String(documentTitle).trim() ? null : 'Add a meaningful title to the PDF document properties before publishing.'
        };

      case 'language':
        return {
          id: check.id,
          name: check.name,
          passed: Boolean(String(documentLanguage).trim()),
          severity: String(documentLanguage).trim() ? 'none' : 'medium',
          message: String(documentLanguage).trim() ? `Document language is declared as ${documentLanguage}` : 'Document language is not specified in the PDF metadata',
          recommendation: String(documentLanguage).trim() ? null : 'Set the document language in the PDF metadata so assistive technologies choose the right pronunciation rules.'
        };

      case 'tags':
        return {
          id: check.id,
          name: check.name,
          passed: hasTaggedPages,
          severity: hasTaggedPages ? 'none' : 'high',
          message: hasTaggedPages ? `Detected structure information on ${context.taggedPages} page(s)` : 'No tagged structure information was detected',
          recommendation: hasTaggedPages ? null : 'Export the PDF as a tagged document so screen readers can understand the reading structure.'
        };

      case 'headings':
        return {
          id: check.id,
          name: check.name,
          passed: hasHeadingSignals,
          severity: hasHeadingSignals ? 'none' : 'medium',
          message: hasHeadingSignals ? 'Found heading-like structure signals in the document' : 'No clear heading structure was detected automatically',
          recommendation: hasHeadingSignals ? null : 'Use tagged headings or stronger heading hierarchy so assistive technologies can navigate the document outline.'
        };

      case 'altText':
        return {
          id: check.id,
          name: check.name,
          passed: context.imagePages === 0 || !hasImageAccessibilityIssues,
          severity: context.imagePages === 0 || !hasImageAccessibilityIssues ? 'none' : 'high',
          message: context.imagePages === 0
            ? 'No raster image operations were detected that require alt text review'
            : hasImageAccessibilityIssues
              ? `${context.imagePagesMissingAltText} image-heavy page(s) appear to be missing figure alt text`
              : 'Detected image content appears to include accessible figure descriptions',
          recommendation: context.imagePages === 0 || !hasImageAccessibilityIssues ? null : 'Add descriptive alternative text for every meaningful figure or image in the tagged PDF structure.'
        };

      case 'contrast':
        return {
          id: check.id,
          name: check.name,
          passed: context.lowTextPages === 0,
          severity: context.lowTextPages === 0 ? 'none' : 'medium',
          message: context.lowTextPages === 0
            ? 'Text was extracted from every page, so there are no obvious raster-only pages requiring manual contrast review'
            : `${context.lowTextPages} page(s) contain little or no extractable text and need manual contrast verification`,
          recommendation: context.lowTextPages === 0 ? null : 'Review scanned or image-based pages manually to confirm that text contrast meets WCAG requirements.'
        };

      case 'readingOrder':
        return {
          id: check.id,
          name: check.name,
          passed: context.readingOrderPasses >= Math.ceil(context.totalPages * 0.7),
          severity: context.readingOrderPasses >= Math.ceil(context.totalPages * 0.7) ? 'none' : 'medium',
          message: context.readingOrderPasses >= Math.ceil(context.totalPages * 0.7)
            ? 'Most pages follow a stable top-to-bottom reading sequence'
            : 'The extracted reading order looks inconsistent on several pages',
          recommendation: context.readingOrderPasses >= Math.ceil(context.totalPages * 0.7) ? null : 'Review the source document order or tagged structure to make sure content is announced in the intended sequence.'
        };

      case 'forms':
        return {
          id: check.id,
          name: check.name,
          passed: !hasForms,
          severity: !hasForms ? 'none' : 'medium',
          message: !hasForms ? 'No interactive form fields were detected' : `${context.formFieldCount} form field(s) detected and should be checked for accessible labels`,
          recommendation: !hasForms ? null : 'Verify that every form field has a programmatic label, tooltip, and logical tab order in the source PDF.'
        };

      default:
        return {
          id: check.id,
          name: check.name,
          passed: true,
          severity: 'none',
          message: 'Check completed',
          recommendation: null
        };
    }
  };

  const generateRecommendations = (results) => {
    const recommendations = [];
    const criticalIssues = results.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = results.issues.filter(i => i.severity === 'medium').length;

    if (criticalIssues > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Address Critical Accessibility Issues',
        description: `Fix ${criticalIssues} critical accessibility issue(s) that prevent screen reader access.`
      });
    }

    if (mediumIssues > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Improve Accessibility Features',
        description: `Address ${mediumIssues} medium-priority issue(s) to enhance accessibility.`
      });
    }

    if (results.score >= 80) {
      recommendations.push({
        priority: 'low',
        title: 'Maintain Good Practices',
        description: 'Your PDF has good accessibility. Continue following accessibility best practices.'
      });
    } else if (results.score >= 60) {
      recommendations.push({
        priority: 'medium',
        title: 'Enhance Accessibility',
        description: 'Your PDF has basic accessibility but could be improved for better user experience.'
      });
    } else {
      recommendations.push({
        priority: 'high',
        title: 'Significant Accessibility Improvements Needed',
        description: 'Your PDF requires substantial accessibility improvements to meet standards.'
      });
    }

    return recommendations;
  };

  const downloadReport = () => {
    if (!results) return;

    const reportContent = generateAccessibilityReport(results);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    let url = null;
    try { url = safeCreateObjectURL(blob); } catch { url = null; }
    const link = document.createElement('a');
    link.href = url;
    link.download = `${results.fileName}_accessibility_report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    try { if (url) safeRevokeObjectURL(url); } catch { /* ignore */ }
  };

  const generateAccessibilityReport = (results) => {
    let report = `PDF Accessibility Report\n`;
    report += `========================\n\n`;
    report += `File: ${results.fileName}\n`;
    report += `Pages: ${results.totalPages}\n`;
    report += `Overall Score: ${results.score}/100\n\n`;

    report += `Accessibility Checks:\n`;
    report += `--------------------\n`;
    results.checks.forEach(check => {
      const status = check.passed ? '✓ PASS' : '✗ FAIL';
      report += `${status} - ${check.name}: ${check.message}\n`;
      if (check.recommendation) {
        report += `  Recommendation: ${check.recommendation}\n`;
      }
      report += `\n`;
    });

    if (results.issues.length > 0) {
      report += `Issues Found:\n`;
      report += `-------------\n`;
      results.issues.forEach((issue, index) => {
        report += `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}\n`;
        report += `   Recommendation: ${issue.recommendation}\n\n`;
      });
    }

    report += `Recommendations:\n`;
    report += `----------------\n`;
    results.recommendations.forEach((rec, index) => {
      report += `${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}\n`;
      report += `   ${rec.description}\n\n`;
    });

    return report;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">Critical</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <ToolPageLayout
      title="PDF Accessibility Checker"
      subtitle="Run a local heuristic accessibility audit for common PDF issues"
      toolName="PDF Accessibility Checker"
      toolDescription="Run a browser-based heuristic audit for common PDF accessibility issues such as missing titles, absent tags, likely reading-order problems, image alt-text gaps, and pages that need manual contrast review."
      currentTool="pdf-accessibility-checker"
      steps={[
        "Upload your PDF document by dragging it into the dropzone or clicking to select it.",
        "Click 'Start Analysis' to run the local heuristic audit.",
        "Review the score, passed checks, flagged issues, and manual follow-up recommendations.",
        "Download the accessibility report for documentation or to guide remediation work."
      ]}
      faqs={[
        {
          question: "What accessibility standards does this tool check?",
          answer: "The tool reviews several WCAG-related signals such as document titles, tagging, likely heading structure, image alt-text markers, reading-order hints, and form fields. It is a heuristic browser-side audit, not a substitute for a full manual accessibility review."
        },
        {
          question: "What does the accessibility score mean?",
          answer: "The accessibility score (0-100) indicates how well your PDF meets accessibility standards. Scores 80+ are good, 60-79 need improvement, and below 60 require significant accessibility enhancements."
        },
        {
          question: "Can I fix accessibility issues with this tool?",
          answer: "This tool identifies accessibility issues and provides recommendations, but you'll need to use other PDF editing tools to implement the fixes. The tool helps you understand what needs to be improved."
        },
        {
          question: "What types of accessibility issues are most critical?",
          answer: "Critical issues include missing document titles, untagged PDFs, missing image alt text, and unlabeled form fields. These prevent screen readers from properly interpreting your content."
        },
        {
          question: "Is the accessibility analysis secure?",
          answer: "Yes, all analysis happens locally in your browser. Your PDF files are never uploaded to our servers, ensuring complete privacy and security for your sensitive documents."
        }
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upload PDF Document</CardTitle>
              <CardDescription>
                Upload a PDF file to scan for common accessibility issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
                {isDragActive ? (
                  <p>Drop the PDF file here...</p>
                ) : (
                  <div>
                    <p className="mb-1">Drag & drop a PDF file here, or click to select</p>
                    <p className="text-sm text-muted-foreground">
                      Maximum file size: 50MB
                    </p>
                  </div>
                )}
              </div>

              {file && (
                <div className="mt-4 p-3 border">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Options</CardTitle>
              <CardDescription>
                Configure accessibility analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Checks Included:</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Document structure and tags</div>
                  <div>• Image alternative text</div>
                  <div>• Manual contrast review flags</div>
                  <div>• Reading order heuristics</div>
                  <div>• Form accessibility</div>
                  <div>• WCAG-related issue spotting</div>
                </div>
              </div>

              <Button
                onClick={analyzeAccessibility}
                disabled={!file || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</span>
                ) : (
                  <><Shield className="h-4 w-4 mr-2" aria-hidden="true" />Start Analysis</>
                )}
              </Button>

              {file && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setResults(null);
                    setAnalysisStatus('idle');
                  }}
                  className="w-full"
                >
                  Clear File
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {isAnalyzing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Analyzing Accessibility...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                {progress.toFixed(1)}% complete - Checking accessibility standards
              </p>
            </CardContent>
          </Card>
        )}

        {analysisStatus === 'completed' && results && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    Analysis Complete
                  </CardTitle>
                  <Button onClick={downloadReport} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                    Download Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(results.score)}`}>
                      {results.score}/100
                    </div>
                    <div className="text-sm text-muted-foreground">Accessibility Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {results.checks.filter(c => c.passed).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Checks Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-destructive">
                      {results.issues.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Issues Found</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="checks">Detailed Checks</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Accessibility Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Document Information</h4>
                        <div className="space-y-1 text-sm">
                          <div>File: {results.fileName}</div>
                          <div>Pages: {results.totalPages}</div>
                          <div>Checks Performed: {results.checks.length}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Compliance Status</h4>
                        <div className="space-y-2">
                          {results.score >= 80 && (
                            <Badge className="bg-muted text-foreground">
                              Good Accessibility
                            </Badge>
                          )}
                          {results.score >= 60 && results.score < 80 && (
                            <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                              Needs Improvement
                            </Badge>
                          )}
                          {results.score < 60 && (
                            <Badge className="bg-destructive/10 text-destructive">
                              Poor Accessibility
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="checks" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.checks.map((check, index) => {
                    const checkInfo = accessibilityChecks.find(c => c.id === check.id);
                    const Icon = checkInfo?.icon || CheckCircle;

                    return (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 ${check.passed ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-destructive/10'
                              }`}>
                              {check.passed ? (
                                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="h-4 w-4" aria-hidden="true" />
                                <h4 className="font-medium text-sm">{check.name}</h4>
                                {!check.passed && getSeverityBadge(check.severity)}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {check.message}
                              </p>
                              {check.recommendation && (
                                <p className="text-xs text-foreground dark:text-foreground bg-background dark:bg-background p-2">
                                  {check.recommendation}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="issues" className="space-y-4">
                {results.issues.length > 0 ? (
                  <div className="space-y-3">
                    {results.issues.map((issue, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" aria-hidden="true" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getSeverityBadge(issue.severity)}
                                <span className="text-sm text-muted-foreground">
                                  {issue.category}
                                </span>
                              </div>
                              <p className="font-medium text-sm mb-2">{issue.message}</p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Recommendation:</strong> {issue.recommendation}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" aria-hidden="true" />
                      <h3 className="font-medium mb-2">No Issues Found</h3>
                      <p className="text-sm text-muted-foreground">
                        Your PDF passed all accessibility checks!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-3">
                  {results.recommendations.map((rec, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 ${rec.priority === 'high' ? 'bg-destructive/10' :
                              rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-muted'
                            }`}>
                            <CheckCircle className={`h-4 w-4 ${rec.priority === 'high' ? 'text-destructive' :
                                rec.priority === 'medium' ? 'text-yellow-600' : 'text-emerald-600 dark:text-emerald-400'
                              }`} aria-hidden="true" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-sm">{rec.title}</h4>
                              <Badge variant={
                                rec.priority === 'high' ? 'destructive' :
                                  rec.priority === 'medium' ? 'secondary' : 'outline'
                              }>
                                {rec.priority} priority
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {rec.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {analysisStatus === 'error' && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span>An error occurred during analysis. Please try again.</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Shield className="h-4 w-4" aria-hidden="true" />
              <span>All accessibility analysis happens locally in your browser. Your files never leave your device.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
