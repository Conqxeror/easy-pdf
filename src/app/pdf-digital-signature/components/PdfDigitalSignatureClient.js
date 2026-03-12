"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Download, CheckCircle, Key, FileText, Lock, Loader2 } from "lucide-react";
import { getPdfLib } from '@/lib/pdfLibLoader';
import ToolPageLayout from '@/components/ui/ToolPageLayout';
import FileDropzone from '@/components/ui/FileDropzone';
import { toast } from 'sonner';
import { safeCreateObjectURL, safeRevokeObjectURL } from '@/lib/enhancedUX';

const SIGNATURE_MARKER = 'easy-pdf-visible-signature';

const formatDateForField = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().split('T')[0];
};

export default function PDFDigitalSignatureClient() {
  const [file, setFile] = useState(null);
  const [signedPdf, setSignedPdf] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationFile, setValidationFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [certificateInfo, setCertificateInfo] = useState({
    name: "",
    email: "",
    organization: "",
    country: "",
    validFrom: "",
    validTo: ""
  });
  const [signaturePosition, setSignaturePosition] = useState({
    x: 100,
    y: 100,
    width: 200,
    height: 50
  });
  const [signatureText, setSignatureText] = useState("");

  const handleFileUpload = (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
      setSignedPdf(null);
      setError('');
    }
  };

  const populateSampleCertificate = () => {
    const now = new Date();
    const validTo = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

    setCertificateInfo({
      name: certificateInfo.name || "John Doe",
      email: certificateInfo.email || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "kadriwalimohammad@gmail.com",
      organization: certificateInfo.organization || "Example Corp",
      country: certificateInfo.country || "US",
      validFrom: now.toISOString().split('T')[0],
      validTo: validTo.toISOString().split('T')[0]
    });
  };

  const handleValidationFileUpload = (acceptedFiles) => {
    const uploadedFile = acceptedFiles?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setValidationFile(uploadedFile);
      setValidationResult(null);
      setError('');
    }
  };

  const hasCertificateDetails = Boolean(
    certificateInfo.name.trim() &&
    certificateInfo.email.trim() &&
    certificateInfo.organization.trim() &&
    certificateInfo.country.trim()
  );

  const addDigitalSignature = async () => {
    if (!file) {
      setError('Please upload a PDF first.');
      return;
    }

    if (!hasCertificateDetails) {
      setError('Complete the certificate details before adding a signature stamp.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError('');

    try {
      // Read the PDF file
      setProgress(20);
      const { PDFDocument, rgb } = await getPdfLib();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      setProgress(40);

      // Get the first page (or specified page)
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      setProgress(60);

      // Create signature appearance
      const signatureAppearance = {
        x: Math.max(16, Math.min(signaturePosition.x, Math.max(16, width - signaturePosition.width - 16))),
        y: Math.max(16, height - signaturePosition.y - signaturePosition.height),
        width: Math.max(160, Math.min(signaturePosition.width, width - 32)),
        height: Math.max(50, Math.min(signaturePosition.height, height - 32))
      };

      // Add visual signature
      firstPage.drawRectangle({
        x: signatureAppearance.x,
        y: signatureAppearance.y,
        width: signatureAppearance.width,
        height: signatureAppearance.height,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
        color: rgb(0.95, 0.95, 1)
      });

      // Add signature text
      const signatureDisplayText = signatureText || `Signed by ${certificateInfo.name}`;
      firstPage.drawText(signatureDisplayText, {
        x: signatureAppearance.x + 5,
        y: signatureAppearance.y + signatureAppearance.height - 15,
        size: 8,
        color: rgb(0, 0, 0)
      });

      // Add certificate info
      const signedAt = new Date();
      firstPage.drawText(`Date: ${signedAt.toLocaleString()}`, {
        x: signatureAppearance.x + 5,
        y: signatureAppearance.y + signatureAppearance.height - 30,
        size: 6,
        color: rgb(0.3, 0.3, 0.3)
      });

      firstPage.drawText(`Org: ${certificateInfo.organization} • ${certificateInfo.country}`, {
        x: signatureAppearance.x + 5,
        y: signatureAppearance.y + signatureAppearance.height - 42,
        size: 6,
        color: rgb(0.3, 0.3, 0.3)
      });

      firstPage.drawText(`Contact: ${certificateInfo.email}`, {
        x: signatureAppearance.x + 5,
        y: signatureAppearance.y + 6,
        size: 6,
        color: rgb(0.3, 0.3, 0.3)
      });

      setProgress(80);

      // Add metadata for easy-pdf validation. This is a visible signature stamp, not a CA-backed cryptographic signature.
      pdfDoc.setTitle(`${pdfDoc.getTitle() || 'Document'} - Signed Copy`);
      pdfDoc.setAuthor(certificateInfo.name);
      pdfDoc.setSubject(`Visible signature stamp by ${certificateInfo.name}`);
      pdfDoc.setKeywords([
        SIGNATURE_MARKER,
        'visible signature',
        certificateInfo.organization,
        certificateInfo.country,
        formatDateForField(certificateInfo.validTo) || 'no-expiry'
      ].filter(Boolean));
      pdfDoc.setProducer('easy-pdf visible signature tool');
      pdfDoc.setCreator(`easy-pdf signer • ${certificateInfo.email}`);
      pdfDoc.setModificationDate(signedAt);

      setProgress(90);

      // Save the signed PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setSignedPdf(blob);

      setProgress(100);
    } catch (error) {
      toast.error(error?.message || 'Error adding signature stamp. Please try again.');
      setError(error?.message || 'Error adding signature stamp. Please try again.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const downloadSignedPdf = () => {
    if (!signedPdf) return;
    let url = null;
    try { url = safeCreateObjectURL(signedPdf); } catch { url = null; }
    try {
      const a = document.createElement('a');
      a.href = url;
      const safeBase = file && file.name ? String(file.name).replace(/\.pdf$/i, '').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '') : 'document';
      a.download = `${safeBase}_signed.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      toast.error('Error initiating signed PDF download.');
    } finally {
      // Revoke after a short delay to ensure the browser started the download, skip data: URLs
      setTimeout(() => {
        try { if (url) safeRevokeObjectURL(url); } catch { /* ignore */ }
      }, 500);
    }
  };

  // Cleanup on unmount: revoke any created object URLs if we had stored them elsewhere
  React.useEffect(() => {
    return () => {
      // nothing to revoke because we store blobs; downloads revoke their own URLs after use
    };
  }, []);

  const validateSignature = async () => {
    if (!validationFile) {
      setError('Upload a PDF to validate first.');
      return;
    }

    setIsProcessing(true);
    setProgress(15);
    setValidationResult(null);
    setError('');

    try {
      const { PDFDocument } = await getPdfLib();
      const arrayBuffer = await validationFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      setProgress(70);

      const producer = pdfDoc.getProducer() || '';
      const keywords = pdfDoc.getKeywords() || [];
      const normalizedKeywords = Array.isArray(keywords) ? keywords : [keywords];
      const hasEasyPdfMarker = normalizedKeywords.some((keyword) => String(keyword).toLowerCase().includes(SIGNATURE_MARKER));
      const isEasyPdfSigned = hasEasyPdfMarker || producer.toLowerCase().includes('easy-pdf visible signature tool');

      setValidationResult({
        fileName: validationFile.name,
        isEasyPdfSigned,
        signer: pdfDoc.getAuthor() || 'Unknown',
        subject: pdfDoc.getSubject() || 'No signature subject found',
        producer: producer || 'Unknown producer',
        keywords: normalizedKeywords.filter(Boolean),
        modifiedAt: pdfDoc.getModificationDate()?.toLocaleString?.() || 'Not available',
      });

      setProgress(100);
    } catch (validationError) {
      toast.error(validationError?.message || 'Error validating signature.');
      setError(validationError?.message || 'Could not inspect this PDF.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 900);
    }
  };

  return (
    <ToolPageLayout
      title="PDF Digital Signature"
      subtitle="Add a visible signer stamp and embedded audit metadata to your PDF documents"
      toolName="PDF Digital Signature"
      toolDescription="Create a visible signature block with signer metadata directly in your browser. This produces an auditable signed copy for workflows that need an on-page signer stamp, but it does not replace CA-backed cryptographic PDF signatures."
      currentTool="pdf-digital-signature"
      steps={[
        "Upload the PDF document you want to stamp.",
        "Fill in the signer details that should be embedded in the PDF metadata.",
        "Adjust the signature box position and optional visible text.",
        "Generate the signed copy and download it, or inspect an easy-pdf signed file in the validation tab."
      ]}
      faqs={[
        {
          question: "Does this create a cryptographic PKI signature?",
          answer: "No. This tool creates a visible signature stamp plus embedded signer metadata for local workflows. It is useful for internal review trails, but it is not a certificate-authority-backed cryptographic signature."
        },
        {
          question: "When should I use this tool?",
          answer: "Use it when you need a clear on-document signer block, a timestamp, and signer metadata embedded locally in the PDF. For regulated e-signature workflows, use a dedicated CA-backed signing platform."
        },
        {
          question: "What information is included in the signed copy?",
          answer: "The tool writes the signer name, email, organization, country, and signing timestamp into the visible signature block and the PDF metadata so it can be audited later."
        },
        {
          question: "What does validation check?",
          answer: "The validation tab checks whether the PDF contains the metadata markers written by this tool and shows the embedded signer details. It does not perform CA trust or revocation checks."
        },
        {
          question: "Do I need special software to view the result?",
          answer: "No. The signed copy is a normal PDF with a visible signature block, so it opens in standard PDF readers and browsers."
        }
      ]}
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="sign" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sign">Sign Document</TabsTrigger>
            <TabsTrigger value="certificate">Certificate</TabsTrigger>
            <TabsTrigger value="validate">Validate</TabsTrigger>
          </TabsList>

          <TabsContent value="sign" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                  Upload PDF Document
                </CardTitle>
                <CardDescription>
                  Select a PDF document to add digital signature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FileDropzone
                    accept="application/pdf"
                    onFiles={handleFileUpload}
                    label="Choose PDF"
                    description="Drag & drop or click to select a PDF file (Max 50MB)"
                    maxSize={50 * 1024 * 1024}
                    isLoading={isProcessing && !file}
                  />

                  {file && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                      <AlertDescription>
                        File loaded: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {file && (
              <Card>
                <CardHeader>
                  <CardTitle>Signature Configuration</CardTitle>
                  <CardDescription>Configure signature appearance and position</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="signature-text">Signature Text</Label>
                    <Input
                      id="signature-text"
                      placeholder="Enter signature text or leave blank for default"
                      value={signatureText}
                      onChange={(e) => setSignatureText(e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sig-x">X Position</Label>
                      <Input
                        id="sig-x"
                        type="number"
                        value={signaturePosition.x}
                        onChange={(e) => setSignaturePosition({ ...signaturePosition, x: parseInt(e.target.value) })}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sig-y">Y Position</Label>
                      <Input
                        id="sig-y"
                        type="number"
                        value={signaturePosition.y}
                        onChange={(e) => setSignaturePosition({ ...signaturePosition, y: parseInt(e.target.value) })}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sig-width">Width</Label>
                      <Input
                        id="sig-width"
                        type="number"
                        value={signaturePosition.width}
                        onChange={(e) => setSignaturePosition({ ...signaturePosition, width: parseInt(e.target.value) })}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sig-height">Height</Label>
                      <Input
                        id="sig-height"
                        type="number"
                        value={signaturePosition.height}
                        onChange={(e) => setSignaturePosition({ ...signaturePosition, height: parseInt(e.target.value) })}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => void addDigitalSignature()}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Signature...</span>
                    ) : (
                      <><Lock className="mr-2 h-4 w-4" aria-hidden="true" />Add Digital Signature</>
                    )}
                  </Button>

                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-sm text-foreground text-center">
                        Processing signature... {progress}%
                      </p>
                    </div>
                  )}

                  {signedPdf && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                      <AlertDescription className="flex items-center justify-between">
                        <span>Digital signature added successfully!</span>
                        <Button onClick={downloadSignedPdf} size="sm">
                          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                          Download
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="certificate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Digital Certificate Information
                </CardTitle>
                <CardDescription>
                  Configure certificate details for digital signatures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cert-name">Full Name</Label>
                    <Input
                      id="cert-name"
                      placeholder="John Doe"
                      value={certificateInfo.name}
                      onChange={(e) => setCertificateInfo({ ...certificateInfo, name: e.target.value })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cert-email">Email Address</Label>
                    <Input
                      id="cert-email"
                      type="email"
                      placeholder="support@example.com"
                      value={certificateInfo.email}
                      onChange={(e) => setCertificateInfo({ ...certificateInfo, email: e.target.value })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cert-org">Organization</Label>
                    <Input
                      id="cert-org"
                      placeholder="Example Corporation"
                      value={certificateInfo.organization}
                      onChange={(e) => setCertificateInfo({ ...certificateInfo, organization: e.target.value })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cert-country">Country</Label>
                    <Input
                      id="cert-country"
                      placeholder="US"
                      value={certificateInfo.country}
                      onChange={(e) => setCertificateInfo({ ...certificateInfo, country: e.target.value })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                  <Button onClick={populateSampleCertificate} className="w-full">
                  <Key className="mr-2 h-4 w-4" />
                    Fill Sample Certificate
                </Button>

                {certificateInfo.validFrom && (
                  <div className="mt-4 p-4 bg-background border border-border">
                    <h4 className="font-semibold mb-2 text-foreground">Certificate Details:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-foreground">
                      <div><strong>Name:</strong> {certificateInfo.name}</div>
                      <div><strong>Email:</strong> {certificateInfo.email}</div>
                      <div><strong>Organization:</strong> {certificateInfo.organization}</div>
                      <div><strong>Country:</strong> {certificateInfo.country}</div>
                      <div><strong>Valid From:</strong> {certificateInfo.validFrom}</div>
                      <div><strong>Valid To:</strong> {certificateInfo.validTo}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Signature Validation
                </CardTitle>
                <CardDescription>
                  Validate digital signatures in PDF documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileDropzone
                  accept="application/pdf"
                  onFiles={handleValidationFileUpload}
                  label="Choose PDF to inspect"
                  description="Upload an easy-pdf signed copy to inspect embedded signer metadata"
                  maxSize={50 * 1024 * 1024}
                  isLoading={isProcessing && !validationFile}
                />

                {validationFile && (
                  <Alert>
                    <AlertDescription>
                      Ready to inspect: {validationFile.name}
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={() => void validateSignature()} className="w-full" disabled={isProcessing || !validationFile}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Inspect Signature Metadata
                </Button>

                {validationResult && (
                  <div className="space-y-3 border border-border p-4 bg-background">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-semibold text-foreground">Validation Result</h4>
                      <span className={`text-sm font-medium ${validationResult.isEasyPdfSigned ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {validationResult.isEasyPdfSigned ? 'easy-pdf signature marker found' : 'No easy-pdf signature marker found'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-foreground">
                      <div><strong>Signer:</strong> {validationResult.signer}</div>
                      <div><strong>Modified:</strong> {validationResult.modifiedAt}</div>
                      <div className="md:col-span-2"><strong>Subject:</strong> {validationResult.subject}</div>
                      <div className="md:col-span-2"><strong>Producer:</strong> {validationResult.producer}</div>
                      <div className="md:col-span-2"><strong>Keywords:</strong> {validationResult.keywords.length ? validationResult.keywords.join(', ') : 'None'}</div>
                    </div>
                  </div>
                )}

                <Alert>
                  <AlertDescription>
                    <strong>Note:</strong> This validation checks for the metadata markers written by this tool. It does not verify certificate trust, revocation status, or cryptographic integrity.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-background border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5" />
              Digital Signature Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Security Features</h4>
                <ul className="space-y-1 text-sm text-foreground">
                  <li>• Visible signer stamp</li>
                  <li>• Embedded signer metadata</li>
                  <li>• Local-only PDF processing</li>
                  <li>• Metadata inspection workflow</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Workflow Guidance</h4>
                <ul className="space-y-1 text-sm text-foreground">
                  <li>• Best for internal sign-off copies</li>
                  <li>• Useful for document routing trails</li>
                  <li>• Not a CA-backed e-sign platform</li>
                  <li>• Review compliance requirements separately</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
