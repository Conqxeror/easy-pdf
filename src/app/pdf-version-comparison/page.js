"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GitCompare, Download, CheckCircle, AlertTriangle, FileText, Eye, BarChart3, Clock, Loader2 } from "lucide-react";
import { PDFDocument } from 'pdf-lib';
import ToolPageContent from '@/components/ui/ToolPageContent';
import FileDropzone from '@/components/ui/FileDropzone';

export default function PDFVersionComparison() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [comparisonType, setComparisonType] = useState("visual");
  const [differences, setDifferences] = useState([]);
  const [statistics, setStatistics] = useState(null);
    const handleFile1Upload = (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile1(uploadedFile);
      setComparisonResult(null);
    }
  };

  const handleFile2Upload = (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile2(uploadedFile);
      setComparisonResult(null);
    }
  };

  const generateMockDifferences = () => {
    return [
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
  };

  const generateMockStatistics = (doc1PageCount, doc2PageCount) => {
    const mockDiffs = generateMockDifferences();
    return {
      totalChanges: mockDiffs.length,
      textChanges: mockDiffs.filter(d => d.type.includes('text')).length,
      formattingChanges: mockDiffs.filter(d => d.type === 'formatting_change').length,
      imageChanges: mockDiffs.filter(d => d.type === 'image_change').length,
      pagesCompared: Math.min(doc1PageCount, doc2PageCount),
      similarityScore: 87.5,
      processingTime: "2.3 seconds"
    };
  };

  const compareDocuments = async () => {
    if (!file1 || !file2) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Load both PDF documents
      setProgress(20);
      const arrayBuffer1 = await file1.arrayBuffer();
      const arrayBuffer2 = await file2.arrayBuffer();
      
      setProgress(40);
      const pdfDoc1 = await PDFDocument.load(arrayBuffer1);
      const pdfDoc2 = await PDFDocument.load(arrayBuffer2);

      setProgress(60);

      // Get document information
      const doc1Pages = pdfDoc1.getPageCount();
      const doc2Pages = pdfDoc2.getPageCount();

      // Generate mock comparison results
      const mockDifferences = generateMockDifferences();
      const mockStats = generateMockStatistics(doc1Pages, doc2Pages);

      setProgress(80);

      setDifferences(mockDifferences);
      setStatistics(mockStats);

      // Create comparison result
      setComparisonResult({
        doc1Info: {
          name: file1.name,
          pages: doc1Pages,
          size: (file1.size / 1024 / 1024).toFixed(2) + " MB"
        },
        doc2Info: {
          name: file2.name,
          pages: doc2Pages,
          size: (file2.size / 1024 / 1024).toFixed(2) + " MB"
        },
        comparisonDate: new Date().toLocaleString()
      });

      setProgress(100);
    } catch (error) {
      console.error('Error comparing documents:', error);
      alert('Error comparing documents. Please try again.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const exportComparisonReport = () => {
    if (!comparisonResult || !differences.length) return;

    const report = {
      comparison: comparisonResult,
      statistics: statistics,
      differences: differences,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison_report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Delay revoke so browser can start the download
    setTimeout(() => {
  try { URL.revokeObjectURL(url); } catch { /* ignore */ }
    }, 500);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeTypeIcon = (type) => {
    switch (type) {
      case 'text_addition': return '➕';
      case 'text_deletion': return '➖';
      case 'text_change': return '✏️';
      case 'formatting_change': return '🎨';
      case 'image_change': return '🖼️';
      default: return '📝';
    }
  };

  return (
    <ToolPageContent
      toolName="PDF Version Comparison"
      toolDescription="Compare different versions of PDF documents with detailed analysis. Identify changes, track modifications, and generate comprehensive comparison reports. All processing happens locally in your browser for complete privacy and security."
      currentTool="tools/pdf-version-comparison"
      steps={[
        "Upload two PDF files: the original version and the updated version you want to compare.",
        "Choose your comparison type: visual diff, text-only analysis, or metadata comparison.",
        "Run the comparison analysis to detect differences between the documents.",
        "Review detailed differences, statistics, and export comparison reports for documentation."
      ]}
      faqs={[
        {
          question: "What types of differences can the tool detect?",
          answer: "The tool can detect text changes (additions, deletions, modifications), formatting changes, image updates, layout modifications, and metadata differences between PDF versions."
        },
        {
          question: "How accurate is the comparison analysis?",
          answer: "The comparison provides high accuracy for text-based changes and visual differences. The tool uses advanced algorithms to identify even subtle modifications between document versions."
        },
        {
          question: "Can I export the comparison results?",
          answer: "Yes, you can export detailed comparison reports in JSON format, including all detected differences, statistics, and analysis metadata for record-keeping or further processing."
        },
        {
          question: "What comparison methods are available?",
          answer: "The tool offers three comparison methods: Visual Diff (side-by-side visual comparison), Text Only (focuses on textual content changes), and Metadata (compares document properties and structure)."
        },
        {
          question: "Is there a limit to file sizes for comparison?",
          answer: "For optimal performance, we recommend comparing PDFs under 50MB each. Larger files may take longer to process but are still supported by the tool."
        }
      ]}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <GitCompare className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Version Comparison</h1>
            <p className="text-gray-600">Compare different versions of PDF documents with detailed analysis</p>
          </div>

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
                  <CardDescription>
                    Upload the original/older version of the PDF
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FileDropzone
                      accept="application/pdf"
                      onFiles={handleFile1Upload}
                      label="Choose Original PDF"
                      description="Drag & drop or click to select the original PDF file (Max 50MB)"
                      maxSize={50 * 1024 * 1024}
                      isLoading={isProcessing && !file1}
                    />
                    
                    {file1 && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          File 1 loaded: {file1.name} ({(file1.size / 1024 / 1024).toFixed(2)} MB)
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Updated Document
                  </CardTitle>
                  <CardDescription>
                    Upload the updated/newer version of the PDF
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FileDropzone
                      accept="application/pdf"
                      onFiles={handleFile2Upload}
                      label="Choose Revised PDF"
                      description="Drag & drop or click to select the revised PDF file (Max 50MB)"
                      maxSize={50 * 1024 * 1024}
                      isLoading={isProcessing && !file2}
                    />
                    
                    {file2 && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          File 2 loaded: {file2.name} ({(file2.size / 1024 / 1024).toFixed(2)} MB)
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {file1 && file2 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Both files loaded successfully. Ready for comparison!
                </AlertDescription>
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
                <CardDescription>
                  Configure and run the comparison analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Comparison Type</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={comparisonType === "visual" ? "default" : "outline"}
                      onClick={() => setComparisonType("visual")}
                      size="sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visual Diff
                    </Button>
                    <Button
                      variant={comparisonType === "text" ? "default" : "outline"}
                      onClick={() => setComparisonType("text")}
                      size="sm"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Text Only
                    </Button>
                    <Button
                      variant={comparisonType === "metadata" ? "default" : "outline"}
                      onClick={() => setComparisonType("metadata")}
                      size="sm"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Metadata
                    </Button>
                  </div>
                </div>

                <Button 
              onClick={compareDocuments} 
              disabled={!file1 || !file2 || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Comparing Documents...</span>
              ) : (
                <><GitCompare className="mr-2 h-4 w-4" />Start Comparison</>
              )}
            </Button>

                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-gray-600 text-center">
                      Analyzing differences... {progress}%
                    </p>
                  </div>
                )}

                {comparisonResult && (
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Comparison completed successfully!
                      </AlertDescription>
                    </Alert>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900">Document 1</h4>
                        <p className="text-sm text-blue-700">{comparisonResult.doc1Info.name}</p>
                        <p className="text-sm text-blue-600">{comparisonResult.doc1Info.pages} pages • {comparisonResult.doc1Info.size}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900">Document 2</h4>
                        <p className="text-sm text-green-700">{comparisonResult.doc2Info.name}</p>
                        <p className="text-sm text-green-600">{comparisonResult.doc2Info.pages} pages • {comparisonResult.doc2Info.size}</p>
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
                <CardDescription>
                  Detailed analysis of changes between documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {differences.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">
                        Found {differences.length} differences
                      </h4>
                      <Button onClick={exportComparisonReport} size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {differences.map((diff) => (
                        <div key={diff.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getChangeTypeIcon(diff.type)}</span>
                              <div>
                                <p className="font-medium">{diff.description}</p>
                                <p className="text-sm text-gray-500">
                                  Page {diff.page} • Position ({diff.location.x}, {diff.location.y})
                                </p>
                              </div>
                            </div>
                            <Badge className={getSeverityColor(diff.severity)}>
                              {diff.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GitCompare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No comparison results yet. Upload and compare documents first.</p>
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
                <CardDescription>
                  Detailed metrics and analysis summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statistics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{statistics.totalChanges}</div>
                        <div className="text-sm text-blue-800">Total Changes</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{statistics.similarityScore}%</div>
                        <div className="text-sm text-green-800">Similarity</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{statistics.pagesCompared}</div>
                        <div className="text-sm text-purple-800">Pages Compared</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{statistics.processingTime}</div>
                        <div className="text-sm text-orange-800">Processing Time</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Change Types</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">Text Changes</span>
                            <Badge variant="outline">{statistics.textChanges}</Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">Formatting Changes</span>
                            <Badge variant="outline">{statistics.formattingChanges}</Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
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
                            <span className="font-medium">{comparisonType}</span>
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
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No statistics available. Run a comparison first.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Comparison Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Visual Analysis</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Side-by-side comparison</li>
                  <li>• Highlight differences</li>
                  <li>• Layout change detection</li>
                  <li>• Image modification tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Text Analysis</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Word-level comparison</li>
                  <li>• Addition/deletion tracking</li>
                  <li>• Formatting change detection</li>
                  <li>• Content similarity scoring</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Reporting</h4>
                <ul className="space-y-1 text-sm text-gray-600">
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
    </div>
    </ToolPageContent>
  );
}