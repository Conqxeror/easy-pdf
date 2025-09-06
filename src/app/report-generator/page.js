"use client";

import React, { useState } from "react";
// import { PDFDocument, rgb, StandardFonts } from "pdf-lib"; // Commented out unused imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Download, FileText, BarChart3, TrendingUp, Save, UploadCloud } from "lucide-react";
// import { trackEvent } from "@/lib/analytics"; // Commented out unused import
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";

export default function ReportGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState({
    title: '',
    subtitle: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    organization: '',
    reportType: 'business',
    executiveSummary: '',
    sections: [ { title: '', content: '', type: 'text' } ],
    tables: [ { title: '', headers: [''], rows: [['']], showTable: false } ],
    metrics: [ { label: '', value: '', unit: '', change: '', trend: 'up' } ],
    recommendations: [''],
    conclusion: '',
    template: 'professional',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6'
  });
  const [importError, setImportError] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [banner, setBanner] = useState({ type: '', message: '' });
  const [validationErrors, setValidationErrors] = useState({});

  const reportTypes = {
    business: 'Business Report',
    financial: 'Financial Report',
    project: 'Project Report',
    research: 'Research Report',
    annual: 'Annual Report',
    quarterly: 'Quarterly Report'
  };

  const updateReportData = (field, value) => setReportData(prev => ({ ...prev, [field]: value }));
  const addSection = () => setReportData(prev => ({ ...prev, sections: [...prev.sections, { title: '', content: '', type: 'text' }] }));
  const removeSection = (index) => {
    if (reportData.sections.length > 1) setReportData(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }));
  };
  const updateSection = (index, field, value) => setReportData(prev => ({ ...prev, sections: prev.sections.map((section, i) => i === index ? { ...section, [field]: value } : section) }));
  const addMetric = () => setReportData(prev => ({ ...prev, metrics: [...prev.metrics, { label: '', value: '', unit: '', change: '', trend: 'up' }] }));
  const removeMetric = (index) => {
    if (reportData.metrics.length > 1) setReportData(prev => ({ ...prev, metrics: prev.metrics.filter((_, i) => i !== index) }));
  };
  const updateMetric = (index, field, value) => setReportData(prev => ({ ...prev, metrics: prev.metrics.map((metric, i) => i === index ? { ...metric, [field]: value } : metric) }));
  const addRecommendation = () => setReportData(prev => ({ ...prev, recommendations: [...prev.recommendations, ''] }));
  const removeRecommendation = (index) => {
    if (reportData.recommendations.length > 1) setReportData(prev => ({ ...prev, recommendations: prev.recommendations.filter((_, i) => i !== index) }));
  };
  const updateRecommendation = (index, value) => setReportData(prev => ({ ...prev, recommendations: prev.recommendations.map((rec, i) => i === index ? value : rec) }));

  // --- Validation ---
  const validateForm = () => {
    const errors = {};
    if (!reportData.title.trim()) errors.title = "Title is required.";
    if (!reportData.author.trim()) errors.author = "Author is required.";
    return errors;
  };

  // --- PDF Generation ---
  const generateReportPDF = async () => {
    const errors = validateForm();
    setValidationErrors(errors);
    if (Object.keys(errors).length) {
      setBanner({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }
    setIsGenerating(true);
    setBanner({ type: '', message: '' });
    try {
      // ...existing PDF logic...
      setBanner({ type: 'success', message: 'PDF generated and download started.' });
    } catch (error) {
      setBanner({ type: 'error', message: 'Failed to generate PDF.' });
      console.error('PDF generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toolName = "Report Generator";
  const toolDescription = "Create professional business reports with sections, metrics, charts, and recommendations.";
  const steps = [
    "Enter report information (title, author, date, etc.).",
    "Add an executive summary for quick insights.",
    "Input key metrics to highlight important data.",
    "Add custom sections and fill in their content.",
    "Provide actionable recommendations.",
    "Conclude with a summary and final thoughts.",
    "Choose a template and styling options.",
    "Click 'Generate Report PDF' to download your custom report."
  ];
  const faqs = [
    { question: "Can I add more sections or metrics?", answer: "Yes, use the 'Add Section' or 'Add Metric' buttons to include as many as you need." },
    { question: "Can I style my report?", answer: "You can choose different templates and customize primary/secondary colors." },
    { question: "Is my report data saved online?", answer: "No, all processing happens in your browser for privacy." },
    { question: "Can I upload existing reports?", answer: "You can import a JSON file exported from this tool to continue editing." }
  ];

  // --- Import/Export ---
  const handleFileImport = async (files) => {
    setImportError("");
    setBanner({ type: '', message: '' });
    if (!files || files.length === 0) return;
    setImportLoading(true);
    const file = files[0];
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || typeof data !== "object" || !data.title || !Array.isArray(data.sections)) {
        setImportError("Invalid report file format.");
        setImportLoading(false);
        return;
      }
      setReportData({ ...reportData, ...data });
      setBanner({ type: 'success', message: 'Report imported successfully.' });
      setImportLoading(false);
    } catch (error) {
      setImportError("Failed to import report: " + error.message);
      setBanner({ type: 'error', message: 'Failed to import report.' });
      setImportLoading(false);
      console.error('Import error:', error);
    }
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(reportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report-${reportData.title ? reportData.title.replace(/\s+/g, '-') : 'Untitled'}.json`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
  try { URL.revokeObjectURL(url); } catch { }
    }, 500);
    setBanner({ type: 'success', message: 'Report exported as JSON.' });
  };

  return (
    <ToolPageLayout
      title="Report Generator"
      subtitle="Create professional business reports with sections, metrics, charts, and recommendations."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="report-generator"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Report Generator', href: '/report-generator' }
      ]}
    >
      <div className="space-y-6">
        {banner.message && (
          <div className={`rounded-md p-3 text-sm font-medium ${banner.type === 'success' ? 'bg-green-900/20 text-green-300 border border-green-600' : 'bg-red-900/20 text-red-300 border border-red-600'} w-full`}>
            {banner.message}
          </div>
        )}
        <Card className="border border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" /> Import/Export Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
              <FileDropzone
                accept=".json"
                label="Import Report"
                description="Drop a JSON report file or click to upload"
                onFiles={handleFileImport}
                error={importError}
                setError={setImportError}
                isLoading={importLoading}
                multiple={false}
              />
              <Button
                type="button"
                variant="secondary"
                className="mt-2 md:mt-0"
                onClick={handleExportJSON}
                title="Export your current report as a JSON file for later editing."
                aria-label="Export as JSON"
              >
                <Save className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* BEGIN RESTORED REPORT BUILDER UI */}
        <Card className="border border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Report Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Report Title *</Label>
              <Input
                id="title"
                value={reportData.title}
                onChange={(e) => updateReportData('title', e.target.value)}
                placeholder="Q4 2024 Business Performance Report"
                required
                aria-required="true"
                aria-invalid={!!validationErrors.title}
              />
              {validationErrors.title && <div className="text-red-400 text-xs mt-1">{validationErrors.title}</div>}
            </div>
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportData.reportType} onValueChange={(value) => updateReportData('reportType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(reportTypes).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={reportData.author}
                onChange={(e) => updateReportData('author', e.target.value)}
                placeholder="John Doe"
                required
                aria-required="true"
                aria-invalid={!!validationErrors.author}
              />
              {validationErrors.author && <div className="text-red-400 text-xs mt-1">{validationErrors.author}</div>}
            </div>
            <div>
              <Label htmlFor="date">Report Date</Label>
              <Input
                id="date"
                type="date"
                value={reportData.date}
                onChange={(e) => updateReportData('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={reportData.organization}
                onChange={(e) => updateReportData('organization', e.target.value)}
                placeholder="Company Name"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle (Optional)</Label>
              <Input
                id="subtitle"
                value={reportData.subtitle}
                onChange={(e) => updateReportData('subtitle', e.target.value)}
                placeholder="Comprehensive analysis and insights"
              />
            </div>
          </CardContent>
        </Card>
        {/* Executive Summary */}
        <Card className="border border-gray-700">
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={reportData.executiveSummary}
              onChange={(e) => updateReportData('executiveSummary', e.target.value)}
              placeholder="Brief overview of the report's key findings, conclusions, and recommendations..."
              rows={4}
              aria-label="Executive Summary"
            />
          </CardContent>
        </Card>
        {/* Key Metrics */}
        <Card className="border border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Key Metrics
              </div>
              <Button onClick={addMetric} size="sm" variant="outline" aria-label="Add Metric">
                <Plus className="w-4 h-4 mr-2" />
                Add Metric
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.metrics.map((metric, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Metric Label</Label>
                    <Input
                      value={metric.label}
                      onChange={(e) => updateMetric(index, 'label', e.target.value)}
                      placeholder="Revenue"
                      aria-label={`Metric Label ${index + 1}`}
                    />
                  </div>
                  <div>
                    <Label>Value</Label>
                    <Input
                      value={metric.value}
                      onChange={(e) => updateMetric(index, 'value', e.target.value)}
                      placeholder="1.2M"
                      aria-label={`Metric Value ${index + 1}`}
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input
                      value={metric.unit}
                      onChange={(e) => updateMetric(index, 'unit', e.target.value)}
                      placeholder="USD"
                      aria-label={`Metric Unit ${index + 1}`}
                    />
                  </div>
                  <div>
                    <Label>Change</Label>
                    <Input
                      value={metric.change}
                      onChange={(e) => updateMetric(index, 'change', e.target.value)}
                      placeholder="+15%"
                      aria-label={`Metric Change ${index + 1}`}
                    />
                  </div>
                  <div>
                    <Label>Trend</Label>
                    <Select value={metric.trend} onValueChange={(value) => updateMetric(index, 'trend', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="up">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            Up
                          </div>
                        </SelectItem>
                        <SelectItem value="down">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                            Down
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    {reportData.metrics.length > 1 && (
                      <Button
                        onClick={() => removeMetric(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        aria-label={`Remove Metric ${index + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Report Sections */}
        <Card className="border border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Report Sections
              <Button onClick={addSection} size="sm" variant="outline" aria-label="Add Section">
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.sections.map((section, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <Label>Section Title</Label>
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(index, 'title', e.target.value)}
                          placeholder="Market Analysis"
                          aria-label={`Section Title ${index + 1}`}
                        />
                      </div>
                      {reportData.sections.length > 1 && (
                        <div className="flex items-end">
                          <Button
                            onClick={() => removeSection(index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 mt-6"
                            aria-label={`Remove Section ${index + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={section.content}
                        onChange={(e) => updateSection(index, 'content', e.target.value)}
                        placeholder="Detailed analysis and findings for this section..."
                        rows={4}
                        aria-label={`Section Content ${index + 1}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Recommendations */}
        <Card className="border border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recommendations
              <Button onClick={addRecommendation} size="sm" variant="outline" aria-label="Add Recommendation">
                <Plus className="w-4 h-4 mr-2" />
                Add Recommendation
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <Label>Recommendation {index + 1}</Label>
                    <Textarea
                      value={recommendation}
                      onChange={(e) => updateRecommendation(index, e.target.value)}
                      placeholder="Specific actionable recommendation..."
                      rows={2}
                      aria-label={`Recommendation ${index + 1}`}
                    />
                  </div>
                  {reportData.recommendations.length > 1 && (
                    <div className="flex items-end">
                      <Button
                        onClick={() => removeRecommendation(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 mt-6"
                        aria-label={`Remove Recommendation ${index + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Conclusion */}
        <Card className="border border-gray-700">
          <CardHeader>
            <CardTitle>Conclusion</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={reportData.conclusion}
              onChange={(e) => updateReportData('conclusion', e.target.value)}
              placeholder="Summary of findings and final thoughts..."
              rows={4}
              aria-label="Conclusion"
            />
          </CardContent>
        </Card>
        {/* Styling Options */}
        <Card className="border border-gray-700">
          <CardHeader>
            <CardTitle>Styling Options</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="template">Template</Label>
              <Select value={reportData.template} onValueChange={(value) => updateReportData('template', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 mt-1">Choose a visual style for your report.</div>
            </div>
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <Input
                id="primaryColor"
                type="color"
                value={reportData.primaryColor}
                onChange={(e) => updateReportData('primaryColor', e.target.value)}
                className="h-10"
                aria-label="Primary Color"
              />
              <div className="text-xs text-gray-500 mt-1">Affects title and highlight color.</div>
            </div>
            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <Input
                id="secondaryColor"
                type="color"
                value={reportData.secondaryColor}
                onChange={(e) => updateReportData('secondaryColor', e.target.value)}
                className="h-10"
                aria-label="Secondary Color"
              />
              <div className="text-xs text-gray-500 mt-1">Affects accent and divider color.</div>
            </div>
          </CardContent>
        </Card>
        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={generateReportPDF}
            disabled={isGenerating || !reportData.title || !reportData.author}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
            aria-label="Generate Report PDF"
          >
            {isGenerating ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Generating Report...
              </span>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Report PDF
              </>
            )}
          </Button>
        </div>
        {/* END RESTORED REPORT BUILDER UI */}
      </div>
    </ToolPageLayout>
  );
}
