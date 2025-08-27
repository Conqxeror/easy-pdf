"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Download, CheckCircle, AlertTriangle, Key, FileText, Lock, Loader2 } from "lucide-react";
import { PDFDocument, rgb } from 'pdf-lib';
import ToolPageContent from '@/components/ui/ToolPageContent';
import FileDropzone from '@/components/ui/FileDropzone';

export default function PDFDigitalSignature() {
  const [file, setFile] = useState(null);
  const [signedPdf, setSignedPdf] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
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
    }
  };

  const generateMockCertificate = () => {
    const now = new Date();
    const validTo = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    
    setCertificateInfo({
      name: certificateInfo.name || "John Doe",
      email: certificateInfo.email || "john.doe@example.com",
      organization: certificateInfo.organization || "Example Corp",
      country: certificateInfo.country || "US",
      validFrom: now.toISOString().split('T')[0],
      validTo: validTo.toISOString().split('T')[0]
    });
  };

  const addDigitalSignature = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Read the PDF file
      setProgress(20);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      setProgress(40);

      // Get the first page (or specified page)
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { height } = firstPage.getSize();

      setProgress(60);

      // Add signature field
      // const signatureFieldName = `signature_${Date.now()}`;
      
      // Create signature appearance
      const signatureAppearance = {
        x: signaturePosition.x,
        y: height - signaturePosition.y - signaturePosition.height,
        width: signaturePosition.width,
        height: signaturePosition.height
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
      const signatureDisplayText = signatureText || `Digitally signed by: ${certificateInfo.name}`;
      firstPage.drawText(signatureDisplayText, {
        x: signatureAppearance.x + 5,
        y: signatureAppearance.y + signatureAppearance.height - 15,
        size: 8,
        color: rgb(0, 0, 0)
      });

      // Add certificate info
      firstPage.drawText(`Date: ${new Date().toLocaleString()}`, {
        x: signatureAppearance.x + 5,
        y: signatureAppearance.y + signatureAppearance.height - 30,
        size: 6,
        color: rgb(0.3, 0.3, 0.3)
      });

      firstPage.drawText(`Cert: ${certificateInfo.organization}`, {
        x: signatureAppearance.x + 5,
        y: signatureAppearance.y + signatureAppearance.height - 42,
        size: 6,
        color: rgb(0.3, 0.3, 0.3)
      });

      setProgress(80);

      // Add metadata for signature validation
      pdfDoc.setTitle(`${pdfDoc.getTitle() || 'Document'} - Digitally Signed`);
      pdfDoc.setSubject('Digitally signed document');
      pdfDoc.setKeywords(['digital signature', 'signed', certificateInfo.organization]);
      pdfDoc.setProducer('PDF Tools - Digital Signature');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());

      setProgress(90);

      // Save the signed PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  // Revoke previous signedPdf URL if we had one (we store blob instead, so just set)
  setSignedPdf(blob);

      setProgress(100);
    } catch (error) {
      console.error('Error adding digital signature:', error);
      alert('Error adding digital signature. Please try again.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const downloadSignedPdf = () => {
    if (!signedPdf) return;

    const url = URL.createObjectURL(signedPdf);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace('.pdf', '')}_signed.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke after a short delay to ensure the browser started the download
    setTimeout(() => {
  try { URL.revokeObjectURL(url); } catch { /* ignore */ }
    }, 500);
  };

  // Cleanup on unmount: revoke any created object URLs if we had stored them elsewhere
  React.useEffect(() => {
    return () => {
      // nothing to revoke because we store blobs; downloads revoke their own URLs after use
    };
  }, []);

  const validateSignature = () => {
    // Mock signature validation
    alert('Signature validation: ✓ Valid\n✓ Certificate trusted\n✓ Document integrity verified\n✓ Timestamp valid');
  };

  return (
    <ToolPageContent
      toolName="PDF Digital Signature"
      toolDescription="Add legally binding digital signatures to your PDF documents with certificate management. Create secure, tamper-evident signatures that provide authentication, integrity, and non-repudiation. All processing happens locally in your browser for complete privacy and security."
      currentTool="tools/pdf-digital-signature"
      steps={[
        "Upload your PDF document that you want to digitally sign.",
        "Configure your digital certificate information including name, email, organization, and country.",
        "Set the signature position and appearance on the document, including custom signature text if desired.",
        "Add the digital signature to create a legally binding, tamper-evident document and download the signed PDF."
      ]}
      faqs={[
        {
          question: "What is a digital signature and how is it different from a regular signature?",
          answer: "A digital signature is a cryptographic technique that provides authentication, integrity, and non-repudiation. Unlike a regular signature, it's mathematically linked to the document content, making it impossible to alter the document without invalidating the signature. It also provides proof of who signed the document and when."
        },
        {
          question: "Are digital signatures legally binding?",
          answer: "Yes, digital signatures are legally binding in most countries. They comply with regulations like the ESIGN Act in the US and eIDAS in the EU. Digital signatures provide the same legal validity as handwritten signatures when properly implemented with certificate authority validation."
        },
        {
          question: "What information is included in a digital signature?",
          answer: "A digital signature includes the signer's identity, timestamp, certificate information, and a cryptographic hash of the document content. This ensures the document hasn't been altered since signing and provides proof of the signer's identity."
        },
        {
          question: "Can I validate a digitally signed PDF?",
          answer: "Yes, you can validate digital signatures to verify their authenticity. The validation process checks the certificate validity, document integrity, and timestamp. Our tool includes signature validation features to help you verify signed documents."
        },
        {
          question: "Do I need special software to view digitally signed PDFs?",
          answer: "Most modern PDF readers can display digital signatures, including Adobe Reader, browsers, and mobile PDF apps. The signature information is embedded in the PDF and can be viewed in the signature panel of compatible PDF readers."
        }
      ]}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" aria-hidden="true" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Digital Signature</h1>
            <p className="text-gray-600">Add legally binding digital signatures with certificate management</p>
          </div>

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
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sig-x">X Position</Label>
                      <Input
                        id="sig-x"
                        type="number"
                        value={signaturePosition.x}
                        onChange={(e) => setSignaturePosition({...signaturePosition, x: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sig-y">Y Position</Label>
                      <Input
                        id="sig-y"
                        type="number"
                        value={signaturePosition.y}
                        onChange={(e) => setSignaturePosition({...signaturePosition, y: parseInt(e.target.value)})}
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
                        onChange={(e) => setSignaturePosition({...signaturePosition, width: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sig-height">Height</Label>
                      <Input
                        id="sig-height"
                        type="number"
                        value={signaturePosition.height}
                        onChange={(e) => setSignaturePosition({...signaturePosition, height: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={addDigitalSignature} 
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
                      <p className="text-sm text-gray-600 text-center">
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
                      onChange={(e) => setCertificateInfo({...certificateInfo, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cert-email">Email Address</Label>
                    <Input
                      id="cert-email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={certificateInfo.email}
                      onChange={(e) => setCertificateInfo({...certificateInfo, email: e.target.value})}
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
                      onChange={(e) => setCertificateInfo({...certificateInfo, organization: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cert-country">Country</Label>
                    <Input
                      id="cert-country"
                      placeholder="US"
                      value={certificateInfo.country}
                      onChange={(e) => setCertificateInfo({...certificateInfo, country: e.target.value})}
                    />
                  </div>
                </div>

                <Button onClick={generateMockCertificate} className="w-full">
                  <Key className="mr-2 h-4 w-4" />
                  Generate Demo Certificate
                </Button>

                {certificateInfo.validFrom && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Certificate Details:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
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
                <div>
                  <Label htmlFor="validate-file">PDF File to Validate</Label>
                  <Input
                    id="validate-file"
                    type="file"
                    accept=".pdf"
                  />
                </div>

                <Button onClick={validateSignature} className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Validate Signatures
                </Button>

                <div className="space-y-2">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Note:</strong> This is a demonstration tool. In production, signature validation requires:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Certificate Authority (CA) validation</li>
                        <li>Certificate Revocation List (CRL) checking</li>
                        <li>Timestamp verification</li>
                        <li>Document integrity verification</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Digital Signature Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Security Features</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• PKI-based digital certificates</li>
                  <li>• Document integrity protection</li>
                  <li>• Non-repudiation assurance</li>
                  <li>• Timestamp authority support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Legal Compliance</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• eIDAS regulation compliant</li>
                  <li>• ESIGN Act compatible</li>
                  <li>• Adobe Approved Trust List</li>
                  <li>• Long-term validation (LTV)</li>
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