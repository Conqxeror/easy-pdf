"use client";

import React, { useState, useRef, useEffect } from "react";
import { loadPdfLib } from "@/lib/pdfjsWorker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { QrCode, Download, Link, Mail, Phone, Wifi, MapPin } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from '@/lib/enhancedUX';

export default function QRCodeGeneratorClient() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeData, setQRCodeData] = useState({
    type: 'text',
    content: '',
    size: 200,
    margin: 10,
    errorCorrection: 'M',
    format: 'PNG',

    // URL specific
    url: '',

    // Email specific
    email: '',
    subject: '',
    body: '',

    // Phone specific
    phone: '',

    // WiFi specific
    ssid: '',
    password: '',
    security: 'WPA',
    hidden: false,

    // Location specific
    latitude: '',
    longitude: '',

    // vCard specific
    firstName: '',
    lastName: '',
    organization: '',
    title: '',
    phoneNumber: '',
    emailAddress: '',
    website: '',
    address: ''
  });

  const [qrCodeImage, setQRCodeImage] = useState(null);
  const canvasRef = useRef(null);

  // Cleanup function for object URLs
  useEffect(() => {
    return () => {
      if (qrCodeImage) {
        try {
          safeRevokeObjectURL(qrCodeImage);
        } catch { }
      }
    };
  }, [qrCodeImage]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    trackEvent('qr_code_generation_started', { type: qrCodeData.type });

    try {
      let qrContent = '';

      switch (qrCodeData.type) {
        case 'text':
          qrContent = qrCodeData.content;
          break;
        case 'url':
          qrContent = qrCodeData.url.startsWith('http') ? qrCodeData.url : `https://${qrCodeData.url}`;
          break;
        case 'email':
          qrContent = `mailto:${qrCodeData.email}?subject=${encodeURIComponent(qrCodeData.subject)}&body=${encodeURIComponent(qrCodeData.body)}`;
          break;
        case 'phone':
          qrContent = `tel:${qrCodeData.phone}`;
          break;
        case 'wifi':
          qrContent = `WIFI:T:${qrCodeData.security};S:${qrCodeData.ssid};P:${qrCodeData.password};H:${qrCodeData.hidden ? 'true' : 'false'};;`;
          break;
        case 'location':
          qrContent = `geo:${qrCodeData.latitude},${qrCodeData.longitude}`;
          break;
        case 'vcard':
          qrContent = `BEGIN:VCARD
VERSION:3.0
FN:${qrCodeData.firstName} ${qrCodeData.lastName}
ORG:${qrCodeData.organization}
TITLE:${qrCodeData.title}
TEL:${qrCodeData.phoneNumber}
EMAIL:${qrCodeData.emailAddress}
URL:${qrCodeData.website}
ADR:;;${qrCodeData.address};;;;;
END:VCARD`;
          break;
        default:
          qrContent = qrCodeData.content;
      }

      if (!qrContent.trim()) {
        alert('Please enter content for the QR code');
        setIsGenerating(false);
        return;
      }

      // Generate QR code using a QR code library (we'll use qrcode.js)
      const QRCode = (await import('qrcode')).default;

      const canvas = canvasRef.current;
      await QRCode.toCanvas(canvas, qrContent, {
        width: qrCodeData.size,
        margin: qrCodeData.margin / 10,
        errorCorrectionLevel: qrCodeData.errorCorrection,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Convert canvas to image (data URL). Do not revoke data URLs.
      const imageDataUrl = canvas.toDataURL('image/png');
      setQRCodeImage(imageDataUrl);

      trackEvent('qr_code_generated_successfully', {
        type: qrCodeData.type,
        size: qrCodeData.size,
        format: qrCodeData.format
      });

    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code. Please try again.');
      trackEvent('qr_code_generation_failed', { error: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = async () => {
    if (!qrCodeImage) return;

    let url = null;
    try {
      // Convert the data URL to a Blob then create an object URL for download
      const blob = await (await fetch(qrCodeImage)).blob();
      url = safeCreateObjectURL(blob);
      const a = document.createElement('a');
      a.href = url || '';
      const safeName = sanitizeFileName(String(qrCodeData.type || 'qr'));
      a.download = `${safeName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => { try { safeRevokeObjectURL(url); } catch { } }, 500);
    }

    trackEvent('qr_code_downloaded', { type: qrCodeData.type, format: 'PNG' });
  };

  const downloadQRCodePDF = async () => {
    if (!qrCodeImage) return;

    let url = null;
    try {
      const { PDFDocument, rgb } = await loadPdfLib();
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

      // Convert image to PDF
      const imageBytes = await fetch(qrCodeImage).then(res => res.arrayBuffer());
      const image = await pdfDoc.embedPng(imageBytes);

      const { width, height } = page.getSize();
      const imageSize = Math.min(width - 100, height - 100, 400);

      page.drawImage(image, {
        x: (width - imageSize) / 2,
        y: (height - imageSize) / 2,
        width: imageSize,
        height: imageSize
      });

      // Add title
      page.drawText('QR Code', {
        x: 50,
        y: height - 50,
        size: 20,
        color: rgb(0, 0, 0)
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      url = safeCreateObjectURL(blob);
      const link = document.createElement('a');
      link.href = url || '';
      const safeName = sanitizeFileName(`qr-code-${String(qrCodeData.type || 'qr')}-${Date.now()}`);
      link.download = `${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      trackEvent('qr_code_downloaded', { type: qrCodeData.type, format: 'PDF' });
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Error creating PDF. Please try again.');
    } finally {
      setTimeout(() => { try { safeRevokeObjectURL(url); } catch { } }, 500);
    }
  };

  const updateQRData = (field, value) => {
    setQRCodeData(prev => ({ ...prev, [field]: value }));
  };

  const renderContentForm = () => {
    switch (qrCodeData.type) {
      case 'text':
        return (
          <div>
            <Label htmlFor="content">Text Content</Label>
            <Textarea
              id="content"
              value={qrCodeData.content}
              onChange={(e) => updateQRData('content', e.target.value)}
              placeholder="Enter your text here..."
              rows={4}
            />
          </div>
        );

      case 'url':
        return (
          <div>
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              value={qrCodeData.url}
              onChange={(e) => updateQRData('url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={qrCodeData.email}
                onChange={(e) => updateQRData('email', e.target.value)}
                placeholder="support@example.com"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input
                id="subject"
                value={qrCodeData.subject}
                onChange={(e) => updateQRData('subject', e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label htmlFor="body">Message (Optional)</Label>
              <Textarea
                id="body"
                value={qrCodeData.body}
                onChange={(e) => updateQRData('body', e.target.value)}
                placeholder="Email message"
                rows={3}
              />
            </div>
          </div>
        );

      case 'phone':
        return (
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={qrCodeData.phone}
              onChange={(e) => updateQRData('phone', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ssid">Network Name (SSID)</Label>
              <Input
                id="ssid"
                value={qrCodeData.ssid}
                onChange={(e) => updateQRData('ssid', e.target.value)}
                placeholder="WiFi Network Name"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={qrCodeData.password}
                onChange={(e) => updateQRData('password', e.target.value)}
                placeholder="WiFi Password"
              />
            </div>
            <div>
              <Label htmlFor="security">Security Type</Label>
              <Select value={qrCodeData.security} onValueChange={(value) => updateQRData('security', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">No Password</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={qrCodeData.latitude}
                onChange={(e) => updateQRData('latitude', e.target.value)}
                placeholder="28.6139"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={qrCodeData.longitude}
                onChange={(e) => updateQRData('longitude', e.target.value)}
                placeholder="77.2090"
              />
            </div>
          </div>
        );

      case 'vcard':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={qrCodeData.firstName}
                  onChange={(e) => updateQRData('firstName', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={qrCodeData.lastName}
                  onChange={(e) => updateQRData('lastName', e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={qrCodeData.organization}
                  onChange={(e) => updateQRData('organization', e.target.value)}
                  placeholder="Company Name"
                />
              </div>
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={qrCodeData.title}
                  onChange={(e) => updateQRData('title', e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNumber">Phone</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={qrCodeData.phoneNumber}
                  onChange={(e) => updateQRData('phoneNumber', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="emailAddress">Email</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={qrCodeData.emailAddress}
                  onChange={(e) => updateQRData('emailAddress', e.target.value)}
                  placeholder="support@example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={qrCodeData.website}
                onChange={(e) => updateQRData('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={qrCodeData.address}
                onChange={(e) => updateQRData('address', e.target.value)}
                placeholder="Street address, City, State, Country"
                rows={2}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const toolName = "QR Code Generator";
  const toolDescription = "Generate QR codes for URLs, text, WiFi, contact cards, and more. Export as PNG or PDF.";
  const steps = [
    "Choose the type of QR code you want to create (text, URL, email, WiFi, etc.).",
    "Enter the required content or details in the form.",
    "Customize size, margin, and error correction as needed.",
    "Click 'Generate QR Code' to see a preview.",
    "Download your QR code as PNG or PDF."
  ];
  const faqs = [
    { question: "Is the QR code generator free?", answer: "Yes, you can create and download unlimited QR codes for free." },
    { question: "Can I create QR codes for WiFi, email, or contacts?", answer: "Yes, our tool supports many QR code types including WiFi, email, vCard, phone, and more." },
    { question: "Are my QR code contents stored?", answer: "No, all generation is done in your browser. Your content is never uploaded or saved." },
    { question: "Can I customize the QR code's appearance?", answer: "You can adjust size, margin, and error correction level. Advanced styling coming soon." },
    { question: "Is there a limit to the number of QR codes I can generate?", answer: "No limits—generate as many as you need!" }
  ];

  return (
    <ToolPageLayout
      title="QR Code Generator"
      subtitle="Generate QR codes for URLs, text, WiFi, contact cards, and more. Export as PNG or PDF."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="qr-generator"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'QR Generator', href: '/qr-generator' }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* QR Code Type */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={qrCodeData.type} onValueChange={(value) => updateQRData('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      Plain Text
                    </div>
                  </SelectItem>
                  <SelectItem value="url">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      Website URL
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </div>
                  </SelectItem>
                  <SelectItem value="wifi">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      WiFi Network
                    </div>
                  </SelectItem>
                  <SelectItem value="location">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </div>
                  </SelectItem>
                  <SelectItem value="vcard">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      Contact Card (vCard)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Content Form */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              {renderContentForm()}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Size: {qrCodeData.size}px</Label>
                <Slider
                  value={[qrCodeData.size]}
                  onValueChange={(value) => updateQRData('size', value[0])}
                  min={100}
                  max={500}
                  step={10}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Margin: {qrCodeData.margin}</Label>
                <Slider
                  value={[qrCodeData.margin]}
                  onValueChange={(value) => updateQRData('margin', value[0])}
                  min={0}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="errorCorrection">Error Correction</Label>
                <Select value={qrCodeData.errorCorrection} onValueChange={(value) => updateQRData('errorCorrection', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={generateQRCode}
            disabled={isGenerating}
            size="lg"
            className="w-full bg-background hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </>
            )}
          </Button>
        </div>

        {/* Preview and Download Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <canvas
                  ref={canvasRef}
                  style={{ display: qrCodeImage ? 'none' : 'block' }}
                  className="border border-border"
                />
                {qrCodeImage && (
                  <div className="relative w-full max-w-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeImage}
                      alt="Generated QR Code"
                      className="border border-border w-full h-auto"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
                {!qrCodeImage && (
                  <div className="w-64 h-64 border-2 border-dashed border-border flex items-center justify-center">
                    <div className="text-center text-foreground">
                      <QrCode className="w-12 h-12 mx-auto mb-2" />
                      <p>QR code will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {qrCodeImage && (
            <Card>
              <CardHeader>
                <CardTitle>Download</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={downloadQRCode}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
                <Button
                  onClick={downloadQRCodePDF}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
