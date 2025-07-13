"use client";

import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Download, FileText, BarChart3, TrendingUp } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import ToolPageContent from "@/components/ui/ToolPageContent";

export default function ReportGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState({
    // Report Header
    title: '',
    subtitle: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    organization: '',
    reportType: 'business',
    
    // Executive Summary
    executiveSummary: '',
    
    // Sections
    sections: [
      {
        title: '',
        content: '',
        type: 'text'
      }
    ],
    
    // Data Tables
    tables: [
      {
        title: '',
        headers: [''],
        rows: [['']],
        showTable: false
      }
    ],
    
    // Key Metrics
    metrics: [
      {
        label: '',
        value: '',
        unit: '',
        change: '',
        trend: 'up'
      }
    ],
    
    // Recommendations
    recommendations: [''],
    
    // Conclusion
    conclusion: '',
    
    // Styling
    template: 'professional',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6'
  });

  const reportTypes = {
    business: 'Business Report',
    financial: 'Financial Report',
    project: 'Project Report',
    research: 'Research Report',
    annual: 'Annual Report',
    quarterly: 'Quarterly Report'
  };

  const updateReportData = (field, value) => {
    setReportData(prev => ({ ...prev, [field]: value }));
  };

  const addSection = () => {
    setReportData(prev => ({
      ...prev,
      sections: [...prev.sections, { title: '', content: '', type: 'text' }]
    }));
  };

  const removeSection = (index) => {
    if (reportData.sections.length > 1) {
      setReportData(prev => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index)
      }));
    }
  };

  const updateSection = (index, field, value) => {
    setReportData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const addMetric = () => {
    setReportData(prev => ({
      ...prev,
      metrics: [...prev.metrics, { label: '', value: '', unit: '', change: '', trend: 'up' }]
    }));
  };

  const removeMetric = (index) => {
    if (reportData.metrics.length > 1) {
      setReportData(prev => ({
        ...prev,
        metrics: prev.metrics.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMetric = (index, field, value) => {
    setReportData(prev => ({
      ...prev,
      metrics: prev.metrics.map((metric, i) => 
        i === index ? { ...metric, [field]: value } : metric
      )
    }));
  };

  const addRecommendation = () => {
    setReportData(prev => ({
      ...prev,
      recommendations: [...prev.recommendations, '']
    }));
  };

  const removeRecommendation = (index) => {
    if (reportData.recommendations.length > 1) {
      setReportData(prev => ({
        ...prev,
        recommendations: prev.recommendations.filter((_, i) => i !== index)
      }));
    }
  };

  const updateRecommendation = (index, value) => {
    setReportData(prev => ({
      ...prev,
      recommendations: prev.recommendations.map((rec, i) => 
        i === index ? value : rec
      )
    }));
  };

  const generateReportPDF = async () => {
    if (!reportData.title || !reportData.author) {
      alert('Please fill in report title and author');
      return;
    }

    setIsGenerating(true);
    trackEvent('report_generation_started', { type: reportData.reportType });

    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      
      const { width, height } = page.getSize();
      let yPosition = height - 50;

      // Convert hex colors to RGB
      const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return rgb(r, g, b);
      };

      const primaryColor = hexToRgb(reportData.primaryColor);
      const secondaryColor = hexToRgb(reportData.secondaryColor);

      // Helper function to check if new page is needed
      const checkNewPage = (requiredSpace = 100) => {
        if (yPosition < requiredSpace) {
          page = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - 50;
          return true;
        }
        return false;
      };

      // Helper function to draw text with word wrap
      const drawWrappedText = (text, x, y, maxWidth, fontSize, textFont, color = rgb(0, 0, 0)) => {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';
        
        words.forEach(word => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const testWidth = testLine.length * fontSize * 0.6; // Approximate width
          
          if (testWidth < maxWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        });
        
        if (currentLine) lines.push(currentLine);
        
        let currentY = y;
        lines.forEach(line => {
          checkNewPage();
          page.drawText(line, {
            x: x,
            y: currentY,
            size: fontSize,
            font: textFont,
            color: color
          });
          currentY -= fontSize + 4;
        });
        
        return currentY;
      };

      // Title Page
      page.drawRectangle({
        x: 0,
        y: height - 150,
        width: width,
        height: 150,
        color: primaryColor
      });

      // Report Title
      const titleSize = Math.min(24, 400 / reportData.title.length);
      page.drawText(reportData.title.toUpperCase(), {
        x: 50,
        y: height - 80,
        size: titleSize,
        font: boldFont,
        color: rgb(1, 1, 1)
      });

      // Subtitle
      if (reportData.subtitle) {
        page.drawText(reportData.subtitle, {
          x: 50,
          y: height - 110,
          size: 16,
          font: italicFont,
          color: rgb(0.9, 0.9, 0.9)
        });
      }

      // Report Type
      page.drawText(reportTypes[reportData.reportType], {
        x: 50,
        y: height - 130,
        size: 12,
        font,
        color: rgb(0.8, 0.8, 0.8)
      });

      yPosition = height - 180;

      // Report Information
      page.drawText(`Author: ${reportData.author}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0.4, 0.4, 0.4)
      });

      yPosition -= 20;

      page.drawText(`Date: ${new Date(reportData.date).toLocaleDateString()}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0.4, 0.4, 0.4)
      });

      if (reportData.organization) {
        yPosition -= 20;
        page.drawText(`Organization: ${reportData.organization}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font,
          color: rgb(0.4, 0.4, 0.4)
        });
      }

      // New page for content
      page = pdfDoc.addPage([595.28, 841.89]);
      yPosition = height - 50;

      // Executive Summary
      if (reportData.executiveSummary) {
        page.drawText('EXECUTIVE SUMMARY', {
          x: 50,
          y: yPosition,
          size: 16,
          font: boldFont,
          color: primaryColor
        });

        page.drawLine({
          start: { x: 50, y: yPosition - 5 },
          end: { x: width - 50, y: yPosition - 5 },
          thickness: 2,
          color: secondaryColor
        });

        yPosition -= 30;
        yPosition = drawWrappedText(reportData.executiveSummary, 50, yPosition, width - 100, 11, font);
        yPosition -= 30;
      }

      // Key Metrics Section
      const validMetrics = reportData.metrics.filter(metric => metric.label && metric.value);
      if (validMetrics.length > 0) {
        checkNewPage(100);
        
        page.drawText('KEY METRICS', {
          x: 50,
          y: yPosition,
          size: 16,
          font: boldFont,
          color: primaryColor
        });

        page.drawLine({
          start: { x: 50, y: yPosition - 5 },
          end: { x: width - 50, y: yPosition - 5 },
          thickness: 2,
          color: secondaryColor
        });

        yPosition -= 40;

        validMetrics.forEach((metric, index) => {
          const xPos = 50 + (index % 2) * 250;
          if (index % 2 === 0 && index > 0) yPosition -= 80;

          // Metric box
          page.drawRectangle({
            x: xPos,
            y: yPosition - 60,
            width: 200,
            height: 60,
            borderColor: secondaryColor,
            borderWidth: 1
          });

          page.drawText(metric.label, {
            x: xPos + 10,
            y: yPosition - 20,
            size: 10,
            font,
            color: rgb(0.4, 0.4, 0.4)
          });

          page.drawText(`${metric.value} ${metric.unit || ''}`, {
            x: xPos + 10,
            y: yPosition - 35,
            size: 14,
            font: boldFont,
            color: rgb(0, 0, 0)
          });

          if (metric.change) {
            const changeColor = metric.trend === 'up' ? rgb(0, 0.6, 0) : rgb(0.8, 0, 0);
            page.drawText(`${metric.change}`, {
              x: xPos + 10,
              y: yPosition - 50,
              size: 9,
              font,
              color: changeColor
            });
          }
        });

        yPosition -= 100;
      }

      // Sections
      reportData.sections.forEach((section, _index) => {
        if (section.title && section.content) {
          checkNewPage(80);

          page.drawText(section.title.toUpperCase(), {
            x: 50,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: primaryColor
          });

          page.drawLine({
            start: { x: 50, y: yPosition - 5 },
            end: { x: width - 50, y: yPosition - 5 },
            thickness: 1,
            color: secondaryColor
          });

          yPosition -= 25;
          yPosition = drawWrappedText(section.content, 50, yPosition, width - 100, 11, font);
          yPosition -= 25;
        }
      });

      // Recommendations
      const validRecommendations = reportData.recommendations.filter(rec => rec.trim());
      if (validRecommendations.length > 0) {
        checkNewPage(100);

        page.drawText('RECOMMENDATIONS', {
          x: 50,
          y: yPosition,
          size: 16,
          font: boldFont,
          color: primaryColor
        });

        page.drawLine({
          start: { x: 50, y: yPosition - 5 },
          end: { x: width - 50, y: yPosition - 5 },
          thickness: 2,
          color: secondaryColor
        });

        yPosition -= 30;

        validRecommendations.forEach((recommendation, index) => {
          checkNewPage(30);
          page.drawText(`${index + 1}.`, {
            x: 50,
            y: yPosition,
            size: 11,
            font: boldFont,
            color: rgb(0, 0, 0)
          });

          yPosition = drawWrappedText(recommendation, 70, yPosition, width - 120, 11, font);
          yPosition -= 10;
        });

        yPosition -= 20;
      }

      // Conclusion
      if (reportData.conclusion) {
        checkNewPage(80);

        page.drawText('CONCLUSION', {
          x: 50,
          y: yPosition,
          size: 16,
          font: boldFont,
          color: primaryColor
        });

        page.drawLine({
          start: { x: 50, y: yPosition - 5 },
          end: { x: width - 50, y: yPosition - 5 },
          thickness: 2,
          color: secondaryColor
        });

        yPosition -= 25;
        yPosition = drawWrappedText(reportData.conclusion, 50, yPosition, width - 100, 11, font);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Report-${reportData.title.replace(/\s+/g, '-')}-${reportData.date}.pdf`;
      link.click();

      URL.revokeObjectURL(url);

      trackEvent('report_generated_successfully', {
        type: reportData.reportType,
        sections: reportData.sections.filter(s => s.title && s.content).length,
        metrics: validMetrics.length,
        recommendations: validRecommendations.length
      });

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
      trackEvent('report_generation_failed', { error: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const toolConfig = {
    title: "Report Generator",
    description: "Create professional business reports with sections, metrics, charts, and recommendations.",
    icon: React.createElement(FileText, { className: "w-8 h-8 text-indigo-500" }),
    features: [
      "Multiple report templates",
      "Key metrics dashboard",
      "Customizable sections",
      "Professional formatting",
      "Executive summary support",
      "Recommendations tracking"
    ],
    relatedTools: ["/portfolio-creator", "/invoice-generator", "/certificate-generator"]
  };

  return (
    <ToolPageContent toolConfig={toolConfig}>
      <div className="space-y-6">
        {/* Report Header */}
        <Card>
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
              />
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
              />
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
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={reportData.executiveSummary}
              onChange={(e) => updateReportData('executiveSummary', e.target.value)}
              placeholder="Brief overview of the report's key findings, conclusions, and recommendations..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Key Metrics
              </div>
              <Button onClick={addMetric} size="sm" variant="outline">
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
                    />
                  </div>
                  <div>
                    <Label>Value</Label>
                    <Input
                      value={metric.value}
                      onChange={(e) => updateMetric(index, 'value', e.target.value)}
                      placeholder="1.2M"
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input
                      value={metric.unit}
                      onChange={(e) => updateMetric(index, 'unit', e.target.value)}
                      placeholder="USD"
                    />
                  </div>
                  <div>
                    <Label>Change</Label>
                    <Input
                      value={metric.change}
                      onChange={(e) => updateMetric(index, 'change', e.target.value)}
                      placeholder="+15%"
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Report Sections
              <Button onClick={addSection} size="sm" variant="outline">
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
                        />
                      </div>
                      {reportData.sections.length > 1 && (
                        <div className="flex items-end">
                          <Button
                            onClick={() => removeSection(index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 mt-6"
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
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recommendations
              <Button onClick={addRecommendation} size="sm" variant="outline">
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
                    />
                  </div>
                  {reportData.recommendations.length > 1 && (
                    <div className="flex items-end">
                      <Button
                        onClick={() => removeRecommendation(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 mt-6"
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
        <Card>
          <CardHeader>
            <CardTitle>Conclusion</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={reportData.conclusion}
              onChange={(e) => updateReportData('conclusion', e.target.value)}
              placeholder="Summary of findings and final thoughts..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Styling Options */}
        <Card>
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
            </div>
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <Input
                id="primaryColor"
                type="color"
                value={reportData.primaryColor}
                onChange={(e) => updateReportData('primaryColor', e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <Input
                id="secondaryColor"
                type="color"
                value={reportData.secondaryColor}
                onChange={(e) => updateReportData('secondaryColor', e.target.value)}
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={generateReportPDF}
            disabled={isGenerating || !reportData.title || !reportData.author}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Report...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Report PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </ToolPageContent>
  );
}