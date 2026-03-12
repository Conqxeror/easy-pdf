"use client";

import React, { useState } from "react";
import { loadPdfLib } from "@/lib/pdfjsWorker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, Download, User, Building } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";
import { toast } from "sonner";

export default function CertificateGeneratorClient() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
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
      setError('Please fill in recipient name, course or program name, and organization name.');
      return;
    }

    setError("");
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

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      let url = null;
      try {
        url = safeCreateObjectURL(blob);

        const link = document.createElement('a');
        link.href = url || '';
        link.download = `Certificate-${certificateData.recipientName.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        setTimeout(() => {
          try { safeRevokeObjectURL(url); } catch { }
        }, 500);
      }

      trackEvent('certificate_generated', { template: certificateData.template });
    } catch {
      toast.error('Failed to generate the certificate PDF. Please try again.');
      setError('Failed to generate the certificate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toolName = "Certificate Generator";
  const toolDescription = "Create professional certificates instantly. Choose from multiple templates, customize colors, and download high-quality PDF certificates for free.";
  const steps = [
    "Select a certificate template that matches your needs.",
    "Fill in the recipient's details, course information, and organization name.",
    "Customize the colors and styling to match your brand.",
    "Preview the details and click 'Generate Certificate' to download your PDF."
  ];
  const faqs = [
    {
      question: "Is this certificate generator free?",
      answer: "Yes, our certificate generator is completely free to use. You can create as many certificates as you need without any cost."
    },
    {
      question: "Can I add my own logo?",
      answer: "This version focuses on text-based certificate layouts with color customization. If you need logo placement, you can add it after download in a PDF editor."
    },
    {
      question: "Are the certificates printable?",
      answer: "Yes, the certificates are generated in high-quality A4 landscape format, perfect for printing."
    }
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Certificate Generator", href: "/certificate-generator" },
      ]}
      currentTool="certificate-generator"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {error && (
          <div className="lg:col-span-3">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Template Style</Label>
                <Select
                  value={certificateData.template}
                  onValueChange={(val) => updateCertificateData('template', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completion">Completion</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="participation">Participation</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="appreciation">Appreciation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Recipient Name *</Label>
                <div className="relative">
                  <User className="absolute left-2 top-2.5 h-4 w-4 text-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="John Doe"
                    value={certificateData.recipientName}
                    onChange={(e) => updateCertificateData('recipientName', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Course / Achievement *</Label>
                <div className="relative">
                  <Award className="absolute left-2 top-2.5 h-4 w-4 text-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Advanced Web Development"
                    value={certificateData.courseName}
                    onChange={(e) => updateCertificateData('courseName', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Organization Name *</Label>
                <div className="relative">
                  <Building className="absolute left-2 top-2.5 h-4 w-4 text-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Tech Academy Inc."
                    value={certificateData.organizationName}
                    onChange={(e) => updateCertificateData('organizationName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={certificateData.issueDate}
                    onChange={(e) => updateCertificateData('issueDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Certificate ID</Label>
                  <Input
                    value={certificateData.certificateId}
                    onChange={(e) => updateCertificateData('certificateId', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signatory & Styling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Signatory Name</Label>
                <Input
                  placeholder="Jane Smith"
                  value={certificateData.signatoryName}
                  onChange={(e) => updateCertificateData('signatoryName', e.target.value)}
                />
              </div>
              <div>
                <Label>Signatory Title</Label>
                <Input
                  placeholder="Director"
                  value={certificateData.signatoryTitle}
                  onChange={(e) => updateCertificateData('signatoryTitle', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="color"
                      className="w-12 h-8 p-1"
                      value={certificateData.primaryColor}
                      onChange={(e) => updateCertificateData('primaryColor', e.target.value)}
                    />
                    <span className="text-xs text-foreground">{certificateData.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="color"
                      className="w-12 h-8 p-1"
                      value={certificateData.secondaryColor}
                      onChange={(e) => updateCertificateData('secondaryColor', e.target.value)}
                    />
                    <span className="text-xs text-foreground">{certificateData.secondaryColor}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={generateCertificatePDF}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Generate Certificate
              </>
            )}
          </Button>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-8 border-double p-8 h-[600px] relative bg-background text-center flex flex-col justify-between"
                style={{ borderColor: certificateData.primaryColor }}
              >
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4" style={{ borderColor: certificateData.secondaryColor }}></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4" style={{ borderColor: certificateData.secondaryColor }}></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4" style={{ borderColor: certificateData.secondaryColor }}></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4" style={{ borderColor: certificateData.secondaryColor }}></div>

                <div className="mt-8">
                  <h1 className="text-4xl font-bold mb-4" style={{ color: certificateData.primaryColor }}>
                    {templates[certificateData.template].title}
                  </h1>
                  <p className="text-xl italic text-foreground mb-8">
                    {templates[certificateData.template].subtitle}
                  </p>
                  <h2 className="text-3xl font-bold mb-6 border-b-2 inline-block px-8 pb-2" style={{ borderColor: certificateData.secondaryColor }}>
                    {certificateData.recipientName || "[Recipient Name]"}
                  </h2>
                  <p className="text-lg text-foreground mb-4">
                    {templates[certificateData.template].mainText}
                  </p>
                  <h3 className="text-2xl font-bold mb-6" style={{ color: certificateData.primaryColor }}>
                    &quot;{certificateData.courseName || "[Course Name]"}&quot;
                  </h3>
                  {templates[certificateData.template].footerText && (
                    <p className="text-foreground italic">
                      {templates[certificateData.template].footerText}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-end mt-12 px-12">
                  <div className="text-left">
                    <p className="text-foreground mb-1">Date: {new Date(certificateData.issueDate).toLocaleDateString()}</p>
                    <p className="text-xs text-foreground">ID: {certificateData.certificateId}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-48 border-b border-border mb-2"></div>
                    <p className="font-bold">{certificateData.signatoryName || "[Signatory Name]"}</p>
                    <p className="text-sm text-foreground">{certificateData.signatoryTitle || "[Title]"}</p>
                    <p className="text-sm font-semibold mt-1" style={{ color: certificateData.primaryColor }}>
                      {certificateData.organizationName || "[Organization]"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolPageLayout>
  );
}
