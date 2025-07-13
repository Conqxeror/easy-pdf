"use client";

import React, { useState  } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, Download, User, Building } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import ToolPageContent from "@/components/ui/ToolPageContent";

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
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate-${certificateData.recipientName.replace(/\s+/g, '-')}-${certificateData.certificateId}.pdf`;
      link.click();

      URL.revokeObjectURL(url);

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

  const toolConfig = {
    title: "Certificate Generator",
    description: "Create professional certificates for courses, training, achievements, and more with customizable templates.",
    icon: <Award className="w-8 h-8 text-yellow-500" />,
    features: [
      "Multiple certificate templates",
      "Customizable colors and styles",
      "Professional layouts",
      "Automatic certificate IDs",
      "Digital signatures support",
      "High-quality PDF output"
    ],
    relatedTools: ["/sign", "/watermark", "/form-filler"]
  };

  return (
    <ToolPageContent toolConfig={toolConfig}>
      <div className="space-y-6">
        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Certificate Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={certificateData.template} onValueChange={(value) => updateCertificateData('template', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completion">Certificate of Completion</SelectItem>
                <SelectItem value="achievement">Certificate of Achievement</SelectItem>
                <SelectItem value="participation">Certificate of Participation</SelectItem>
                <SelectItem value="training">Training Certificate</SelectItem>
                <SelectItem value="appreciation">Certificate of Appreciation</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-2">
              {templates[certificateData.template]?.title} - {templates[certificateData.template]?.mainText}
            </p>
          </CardContent>
        </Card>

        {/* Recipient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Recipient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipientName">Recipient Name *</Label>
              <Input
                id="recipientName"
                value={certificateData.recipientName}
                onChange={(e) => updateCertificateData('recipientName', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="certificateId">Certificate ID</Label>
              <Input
                id="certificateId"
                value={certificateData.certificateId}
                onChange={(e) => updateCertificateData('certificateId', e.target.value)}
                placeholder="CERT-001"
              />
            </div>
          </CardContent>
        </Card>

        {/* Course/Program Information */}
        <Card>
          <CardHeader>
            <CardTitle>Course/Program Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="courseName">Course/Program Name *</Label>
              <Input
                id="courseName"
                value={certificateData.courseName}
                onChange={(e) => updateCertificateData('courseName', e.target.value)}
                placeholder="Advanced Web Development"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration">Duration (Optional)</Label>
                <Input
                  id="duration"
                  value={certificateData.duration}
                  onChange={(e) => updateCertificateData('duration', e.target.value)}
                  placeholder="40 hours"
                />
              </div>
              <div>
                <Label htmlFor="grade">Grade/Score (Optional)</Label>
                <Input
                  id="grade"
                  value={certificateData.grade}
                  onChange={(e) => updateCertificateData('grade', e.target.value)}
                  placeholder="A+ / 95%"
                />
              </div>
              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={certificateData.issueDate}
                  onChange={(e) => updateCertificateData('issueDate', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={certificateData.description}
                onChange={(e) => updateCertificateData('description', e.target.value)}
                placeholder="Additional details about the course or achievement"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Organization Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Organization Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input
                id="organizationName"
                value={certificateData.organizationName}
                onChange={(e) => updateCertificateData('organizationName', e.target.value)}
                placeholder="Tech Academy"
                required
              />
            </div>
            <div>
              <Label htmlFor="signatoryName">Signatory Name</Label>
              <Input
                id="signatoryName"
                value={certificateData.signatoryName}
                onChange={(e) => updateCertificateData('signatoryName', e.target.value)}
                placeholder="Dr. Jane Smith"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="signatoryTitle">Signatory Title</Label>
              <Input
                id="signatoryTitle"
                value={certificateData.signatoryTitle}
                onChange={(e) => updateCertificateData('signatoryTitle', e.target.value)}
                placeholder="Director of Education"
              />
            </div>
          </CardContent>
        </Card>

        {/* Styling Options */}
        <Card>
          <CardHeader>
            <CardTitle>Styling Options</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <Input
                id="primaryColor"
                type="color"
                value={certificateData.primaryColor}
                onChange={(e) => updateCertificateData('primaryColor', e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <Input
                id="secondaryColor"
                type="color"
                value={certificateData.secondaryColor}
                onChange={(e) => updateCertificateData('secondaryColor', e.target.value)}
                className="h-10"
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
    </ToolPageContent>
  );
}