"use client";

import React, { useState } from "react";
import { loadPdfLib } from "@/lib/pdfjsWorker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, Download, User, Building } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import ToolPageLayout from "@/components/ui/ToolPageLayout";

export default function CertificateGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateData, setCertificateData] = useState({
    template: 'completion',
    recipientName: '',
    courseName: '',
    organizationName: '',
    issueDate: new Date().toISOString().split('T')[0],
    certificateId: `CERT-${Date.now()}`,
    signatoryName: '',
    signatoryTitle: '',
    description: '',
    duration: '',
    grade: '',
    
    // Styling options
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    fontStyle: 'formal',
    borderStyle: 'classic'
  });

  const templates = {
    completion: {
      title: "Certificate of Completion",
      subtitle: "This is to certify that",
      mainText: "has successfully completed the course",
      footerText: "and has demonstrated the required knowledge and skills"
    },
    achievement: {
      title: "Certificate of Achievement",
      subtitle: "This is to certify that",
      mainText: "has achieved excellence in",
      footerText: "and is recognized for outstanding performance"
    },
    participation: {
      title: "Certificate of Participation",
      subtitle: "This is to certify that",
      mainText: "has actively participated in",
      footerText: "and has contributed meaningfully to the program"
    },
    training: {
      title: "Training Certificate",
      subtitle: "This is to certify that",
      mainText: "has successfully completed the training program",
      footerText: "and has met all the required competency standards"
    },
    appreciation: {
      title: "Certificate of Appreciation",
      subtitle: "This is presented to",
      mainText: "in recognition of valuable contribution to",
      footerText: "and dedication to excellence"
    }
  };

  const updateCertificateData = (field, value) => {
    setCertificateData(prev => ({ ...prev, [field]: value }));
  };

  const generateCertificatePDF = async () => {
    if (!certificateData.recipientName || !certificateData.courseName || !certificateData.organizationName) {
      alert('Please fill in recipient name, course/program name, and organization name');
      return;
    }

    setIsGenerating(true);
    trackEvent('certificate_generation_started', { template: certificateData.template });

    try {
      const { PDFDocument, rgb, StandardFonts } = await loadPdfLib();
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      
      const { width, height } = page.getSize();
      const template = templates[certificateData.template];

      // Convert hex colors to RGB
      const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return rgb(r, g, b);
      };

      const primaryColor = hexToRgb(certificateData.primaryColor);
      const secondaryColor = hexToRgb(certificateData.secondaryColor);

      // Draw border
      const borderWidth = 20;
      page.drawRectangle({
        x: borderWidth,
        y: borderWidth,
        width: width - 2 * borderWidth,
        height: height - 2 * borderWidth,
        borderColor: primaryColor,
        borderWidth: 3
      });

      // Inner decorative border
      page.drawRectangle({
        x: borderWidth + 10,
        y: borderWidth + 10,
        width: width - 2 * (borderWidth + 10),
        height: height - 2 * (borderWidth + 10),
        borderColor: secondaryColor,
        borderWidth: 1
      });

      let yPosition = height - 80;

      // Title
      page.drawText(template.title, {
        x: width / 2 - (template.title.length * 12),
        y: yPosition,
        size: 36,
        font: boldFont,
        color: primaryColor
      });

      yPosition -= 60;

      // Subtitle
      page.drawText(template.subtitle, {
        x: width / 2 - (template.subtitle.length * 5),
        y: yPosition,
        size: 16,
        font: italicFont,
        color: rgb(0.4, 0.4, 0.4)
      });

      yPosition -= 50;

      // Recipient name
      const nameSize = Math.min(32, 400 / certificateData.recipientName.length);
      page.drawText(certificateData.recipientName, {
        x: width / 2 - (certificateData.recipientName.length * nameSize * 0.3),
        y: yPosition,
        size: nameSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      yPosition -= 50;

      // Main text and course name
      const mainTextLine1 = template.mainText;
      page.drawText(mainTextLine1, {
        x: width / 2 - (mainTextLine1.length * 6),
        y: yPosition,
        size: 18,
        font,
        color: rgb(0.2, 0.2, 0.2)
      });

      yPosition -= 35;

      // Course/Program name
      const courseSize = Math.min(24, 500 / certificateData.courseName.length);
      page.drawText(`"${certificateData.courseName}"`, {
        x: width / 2 - (certificateData.courseName.length * courseSize * 0.3),
        y: yPosition,
        size: courseSize,
        font: boldFont,
        color: primaryColor
      });

      yPosition -= 40;

      // Footer text
      if (template.footerText) {
        page.drawText(template.footerText, {
          x: width / 2 - (template.footerText.length * 5),
          y: yPosition,
          size: 14,
          font: italicFont,
          color: rgb(0.3, 0.3, 0.3)
        });
        yPosition -= 30;
      }

      // Additional details
      if (certificateData.duration) {
        page.drawText(`Duration: ${certificateData.duration}`, {
          x: width / 2 - 100,
          y: yPosition,
          size: 12,
          font,
          color: rgb(0.4, 0.4, 0.4)
        });
        yPosition -= 20;
      }

      if (certificateData.grade) {
        page.drawText(`Grade: ${certificateData.grade}`, {
          x: width / 2 - 50,
          y: yPosition,
          size: 12,
          font,
          color: rgb(0.4, 0.4, 0.4)
        });
        yPosition -= 20;
      }

      if (certificateData.description) {
        const descLines = certificateData.description.match(/.{1,80}/g) || [certificateData.description];
        descLines.forEach(line => {
          page.drawText(line, {
            x: width / 2 - (line.length * 4),
            y: yPosition,
            size: 11,
            font,
            color: rgb(0.5, 0.5, 0.5)
          });
          yPosition -= 15;
        });
      }

      // Date and organization
      yPosition = 120;
      page.drawText(`Date: ${new Date(certificateData.issueDate).toLocaleDateString()}`, {
        x: 80,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0.4, 0.4, 0.4)
      });

      page.drawText(`Certificate ID: ${certificateData.certificateId}`, {
        x: 80,
        y: yPosition - 20,
        size: 10,
        font,
        color: rgb(0.6, 0.6, 0.6)
      });

      // Signatory
      if (certificateData.signatoryName) {
        page.drawText(certificateData.signatoryName, {
          x: width - 250,
          y: yPosition + 20,
          size: 14,
          font: boldFont,
          color: rgb(0, 0, 0)
        });

        if (certificateData.signatoryTitle) {
          page.drawText(certificateData.signatoryTitle, {
            x: width - 250,
            y: yPosition,
            size: 11,
            font,
            color: rgb(0.4, 0.4, 0.4)
          });
        }

        page.drawText(certificateData.organizationName, {
          x: width - 250,
          y: yPosition - 20,
          size: 12,
          font,
          color: rgb(0.3, 0.3, 0.3)
        });

        // Signature line
        page.drawLine({
          start: { x: width - 250, y: yPosition + 40 },
          end: { x: width - 80, y: yPosition + 40 },
          thickness: 1,
          color: rgb(0.6, 0.6, 0.6)
        });
      }

      // Decorative elements
      const cornerSize = 30;
      // Top-left corner
      page.drawRectangle({
        x: borderWidth + 20,
        y: height - borderWidth - 50,
        width: cornerSize,
        height: cornerSize,
        color: primaryColor,
        opacity: 0.1
      });

      // Top-right corner
      page.drawRectangle({
        x: width - borderWidth - 50,
        y: height - borderWidth - 50,
        width: cornerSize,
        height: cornerSize,
        color: secondaryColor,
        opacity: 0.1
      });

      // Bottom-left corner
      page.drawRectangle({
        x: borderWidth + 20,
        y: borderWidth + 20,
        width: cornerSize,
        height: cornerSize,
        color: secondaryColor,
        opacity: 0.1
      });

      // Bottom-right corner
      page.drawRectangle({
        x: width - borderWidth - 50,
        y: borderWidth + 20,
        width: cornerSize,
        height: cornerSize,
        color: primaryColor,
        opacity: 0.1
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      let url = null;
      try {
        try { if (typeof URL !== 'undefined') url = URL.createObjectURL(blob); } catch { url = null; }
        const link = document.createElement('a');
        link.href = url || '';
        const safeName = (certificateData.recipientName || 'Certificate')
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9\-_.]/g, '');
        link.download = `Certificate-${safeName}-${certificateData.certificateId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        console.error('Certificate download failed:', err);
        alert('Failed to download certificate. Please try again.');
      } finally {
        setTimeout(() => {
          try { if (url && typeof URL !== 'undefined' && !String(url).startsWith('data:')) URL.revokeObjectURL(url); } catch { }
        }, 500);
      }

      trackEvent('certificate_generated_successfully', {
        template: certificateData.template,
        recipient: certificateData.recipientName,
        organization: certificateData.organizationName
      });

    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Error generating certificate. Please try again.');
      trackEvent('certificate_generation_failed', { error: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ToolPageLayout
      title="PDF Certificate Generator"
      subtitle="Create professional certificates with customizable templates"
      toolName="PDF Certificate Generator"
      toolDescription="Generate professional PDF certificates for courses, training, achievements, and more. Customize templates, add recipient information, and download as PDF."
      currentTool="certificate-generator"
      steps={[
        "Select a certificate template from our professional collection.",
        "Enter recipient details including name, course, date, and any additional information.",
        "Customize the certificate with your organization's logo, signature, and colors.",
        "Preview the certificate and make any final adjustments.",
        "Generate and download the certificate as a high-quality PDF."
      ]}
      faqs={[
        {
          question: "Can I add my organization's logo to the certificate?",
          answer: "Yes, you can upload your organization's logo which will be placed in the designated area of the certificate template."
        },
        {
          question: "What file formats can I use for logos and signatures?",
          answer: "You can use PNG, JPG, or SVG files for logos and signatures. For best results, use high-resolution images."
        },
        {
          question: "Can I customize the colors of the certificate?",
          answer: "Yes, you can customize the primary and accent colors to match your brand or organization's color scheme."
        },
        {
          question: "Are the certificates printable?",
          answer: "Yes, all certificates are generated as high-quality PDF files that are perfect for printing on standard paper or cardstock."
        },
        {
          question: "Can I generate multiple certificates at once?",
          answer: "Currently, you can generate one certificate at a time. For bulk certificate generation, consider using our Report Generator tool."
        }
      ]}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Certificate Generator', href: '/certificate-generator' }
      ]}
    >
      <div className="space-y-6">
        {/* Template Selection */}
        <Card className="bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Award className="w-5 h-5" />
              Certificate Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={certificateData.template} onValueChange={(value) => updateCertificateData('template', value)}>
              <SelectTrigger className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
                <SelectItem value="completion">Certificate of Completion</SelectItem>
                <SelectItem value="achievement">Certificate of Achievement</SelectItem>
                <SelectItem value="participation">Certificate of Participation</SelectItem>
                <SelectItem value="training">Training Certificate</SelectItem>
                <SelectItem value="appreciation">Certificate of Appreciation</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {templates[certificateData.template]?.title} - {templates[certificateData.template]?.mainText}
            </p>
          </CardContent>
        </Card>

        {/* Recipient Information */}
        <Card className="bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <User className="w-5 h-5" />
              Recipient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipientName" className="text-gray-900 dark:text-gray-100">Recipient Name *</Label>
              <Input
                id="recipientName"
                value={certificateData.recipientName}
                onChange={(e) => updateCertificateData('recipientName', e.target.value)}
                placeholder="John Doe"
                required
                className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="certificateId" className="text-gray-900 dark:text-gray-100">Certificate ID</Label>
              <Input
                id="certificateId"
                value={certificateData.certificateId}
                onChange={(e) => updateCertificateData('certificateId', e.target.value)}
                placeholder="CERT-001"
                className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Course/Program Information */}
        <Card className="bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Course/Program Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="courseName" className="text-gray-900 dark:text-gray-100">Course/Program Name *</Label>
              <Input
                id="courseName"
                value={certificateData.courseName}
                onChange={(e) => updateCertificateData('courseName', e.target.value)}
                placeholder="Advanced Web Development"
                required
                className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration" className="text-gray-900 dark:text-gray-100">Duration (Optional)</Label>
                <Input
                  id="duration"
                  value={certificateData.duration}
                  onChange={(e) => updateCertificateData('duration', e.target.value)}
                  placeholder="40 hours"
                  className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="grade" className="text-gray-900 dark:text-gray-100">Grade/Score (Optional)</Label>
                <Input
                  id="grade"
                  value={certificateData.grade}
                  onChange={(e) => updateCertificateData('grade', e.target.value)}
                  placeholder="A+ / 95%"
                  className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="issueDate" className="text-gray-900 dark:text-gray-100">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={certificateData.issueDate}
                  onChange={(e) => updateCertificateData('issueDate', e.target.value)}
                  className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="text-gray-900 dark:text-gray-100">Description (Optional)</Label>
              <Textarea
                id="description"
                value={certificateData.description}
                onChange={(e) => updateCertificateData('description', e.target.value)}
                placeholder="Additional details about the course or achievement"
                rows={3}
                className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Organization Information */}
        <Card className="bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Building className="w-5 h-5" />
              Organization Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organizationName" className="text-gray-900 dark:text-gray-100">Organization Name *</Label>
              <Input
                id="organizationName"
                value={certificateData.organizationName}
                onChange={(e) => updateCertificateData('organizationName', e.target.value)}
                placeholder="Tech Academy"
                required
                className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="signatoryName" className="text-gray-900 dark:text-gray-100">Signatory Name</Label>
              <Input
                id="signatoryName"
                value={certificateData.signatoryName}
                onChange={(e) => updateCertificateData('signatoryName', e.target.value)}
                placeholder="Dr. Jane Smith"
                className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="signatoryTitle" className="text-gray-900 dark:text-gray-100">Signatory Title</Label>
              <Input
                id="signatoryTitle"
                value={certificateData.signatoryTitle}
                onChange={(e) => updateCertificateData('signatoryTitle', e.target.value)}
                placeholder="Director of Education"
                className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Styling Options */}
        <Card className="bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Styling Options</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor" className="text-gray-900 dark:text-gray-100">Primary Color</Label>
              <Input
                id="primaryColor"
                type="color"
                value={certificateData.primaryColor}
                onChange={(e) => updateCertificateData('primaryColor', e.target.value)}
                className="h-10 bg-white dark:bg-gray-950"
              />
            </div>
            <div>
              <Label htmlFor="secondaryColor" className="text-gray-900 dark:text-gray-100">Secondary Color</Label>
              <Input
                id="secondaryColor"
                type="color"
                value={certificateData.secondaryColor}
                onChange={(e) => updateCertificateData('secondaryColor', e.target.value)}
                className="h-10 bg-white dark:bg-gray-950"
              />
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={generateCertificatePDF}
            disabled={isGenerating || !certificateData.recipientName || !certificateData.courseName || !certificateData.organizationName}
            size="lg"
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Certificate...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Certificate PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </ToolPageLayout>
  );
}
