"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Html5Qrcode } from "html5-qrcode";
import { Copy, Check, Camera, StopCircle } from "lucide-react";
import FileDropzone from "@/components/ui/FileDropzone";

export default function QRScannerClient() {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  const readerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (readerRef.current && isScanning) {
        readerRef.current.stop().catch(() => {});
      }
    };
  }, [isScanning]);

  const startCamera = async () => {
    setError("");
    setScanResult(null);

    if (isScanning) {
      await stopCamera();
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode("reader");
      readerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          setScanResult(decodedText);
          html5QrCode.stop().then(() => {
            setIsScanning(false);
            readerRef.current = null;
          });
        },
        () => {
          // ignore errors for now
        }
      );
      setIsScanning(true);
    } catch {
      setError("Failed to start camera. Please ensure you have granted permission.");
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (readerRef.current) {
      try {
        await readerRef.current.stop();
        setIsScanning(false);
        readerRef.current = null;
      } catch {
        // camera stop may fail silently
      }
    }
  };

  const handleFile = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setError("");
    setScanResult(null);
    if (isScanning) await stopCamera();

    try {
      // We need a temporary instance for file scanning
      // But Html5Qrcode needs a DOM element.
      // We can use the same "reader" element or a hidden one.
      // Let's use a separate hidden one to avoid conflicts if camera is initializing.
      const html5QrCode = new Html5Qrcode("reader-file");
      const result = await html5QrCode.scanFile(file, true);
      setScanResult(result);
      html5QrCode.clear();
    } catch {
      setError("Could not find a QR code in this image.");
    }
  };

  const copyToClipboard = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ToolPageLayout
      title="QR Code Scanner"
      subtitle="Scan QR codes from your camera or upload an image."
      toolName="QR Code Scanner"
      toolDescription="Scan QR codes directly in your browser using your camera or by uploading an image file. Fast, secure, and works offline."
      currentTool="qr-scanner"
      steps={[
        "Choose 'Scan with Camera' or 'Upload Image'.",
        "Allow camera access if prompted, or select an image file.",
        "View the scanned content instantly."
      ]}
      faqs={[
        {
          question: "Is my camera stream sent to a server?",
          answer: "No. All scanning happens locally in your browser. Your video stream never leaves your device."
        },
        {
          question: "What formats are supported?",
          answer: "We support standard QR codes and many other 1D and 2D barcode formats."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "QR Scanner", href: "/qr-scanner" }
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className={`cursor-pointer transition-colors ${isScanning ? 'border-destructive bg-destructive/10' : 'hover:border-primary'}`} onClick={startCamera}>
            <CardContent className="flex flex-col items-center justify-center p-6 gap-4 h-full">
              {isScanning ? <StopCircle className="w-12 h-12 text-destructive" /> : <Camera className="w-12 h-12 text-primary-foreground" />}
              <span className="font-semibold">{isScanning ? "Stop Camera" : "Scan with Camera"}</span>
            </CardContent>
          </Card>

          <div className="h-full">
            <FileDropzone
              accept=".png,.jpg,.jpeg,.gif,.bmp,.webp"
              multiple={false}
              onFiles={handleFile}
              label="Upload Image"
              description="Drag & drop or click to scan an image file"
              className="h-full min-h-[150px]"
            />
          </div>
        </div>

        {/* Hidden div for file scanning */}
        <div id="reader-file" className="hidden"></div>

        {/* Camera Viewport */}
        <div className={`relative overflow-hidden rounded-none bg-background ${isScanning ? 'block' : 'hidden'}`}>
          <div id="reader" className="w-full"></div>
        </div>

        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        {scanResult && (
          <Card className="animate-in fade-in slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle>Scanned Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-none break-all font-mono text-sm">
                {scanResult}
              </div>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Text"}
                </Button>
                {scanResult.startsWith("http") && (
                  <Button asChild className="gap-2">
                    <a href={scanResult} target="_blank" rel="noopener noreferrer">
                      Open Link
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolPageLayout>
  );
}
