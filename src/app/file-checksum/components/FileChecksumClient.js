"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, Check, FileCheck } from "lucide-react";
import CryptoJS from "crypto-js";

export default function FileChecksumClient() {
  const [hashes, setKeys] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState("");

  const handleFiles = async (files) => {
    if (!files?.length) return;
    const selected = files[0];
    setKeys(null);
    setIsProcessing(true);

    try {
      const arrayBuffer = await selected.arrayBuffer();
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);

      // Calculate hashes
      // Note: For very large files, this might freeze the UI. 
      // Ideally we should use a Web Worker or chunked processing.
      // For this demo, we'll assume reasonable file sizes (< 100MB).

      setTimeout(() => {
        const md5 = CryptoJS.MD5(wordArray).toString();
        const sha1 = CryptoJS.SHA1(wordArray).toString();
        const sha256 = CryptoJS.SHA256(wordArray).toString();

        setKeys({ md5, sha1, sha256 });
        setIsProcessing(false);
      }, 100); // Small delay to allow UI update

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <ToolPageLayout
      title="File Checksum Generator"
      subtitle="Calculate MD5, SHA-1, and SHA-256 hashes for any file."
      toolName="File Checksum"
      toolDescription="Generate cryptographic hash values (checksums) for your files to verify their integrity. Supports MD5, SHA-1, and SHA-256 algorithms. 100% client-side."
      currentTool="file-checksum"
      steps={[
        "Upload a file by dragging it into the dropzone.",
        "Wait for the browser to calculate the hashes.",
        "Copy the MD5, SHA-1, or SHA-256 checksums."
      ]}
      faqs={[
        {
          question: "What is a checksum?",
          answer: "A checksum is a unique string of characters generated from a file's contents. It acts like a digital fingerprint to verify that a file hasn't been modified."
        },
        {
          question: "Is my file uploaded?",
          answer: "No. The hash calculation happens entirely in your browser."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "File Checksum", href: "/file-checksum" }
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <FileDropzone
          accept="*"
          multiple={false}
          onFiles={handleFiles}
          label="Upload File"
          description="Drag & drop any file to calculate checksums"
          isLoading={isProcessing}
        />

        {hashes && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Generated Hashes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>MD5</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={hashes.md5} className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(hashes.md5, "md5")}>
                      {copied === "md5" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>SHA-1</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={hashes.sha1} className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(hashes.sha1, "sha1")}>
                      {copied === "sha1" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>SHA-256</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={hashes.sha256} className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(hashes.sha256, "sha256")}>
                      {copied === "sha256" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
