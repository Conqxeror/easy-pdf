"use client";

import React, { useState, useCallback } from "react";
import CryptoJS from "crypto-js";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, FileText, Type } from "lucide-react";
import { toast } from "sonner";
import FileDropzone from "@/components/ui/FileDropzone";

export default function HashGeneratorClient() {
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState("text");
  const [hashes, setHashes] = useState({
    md5: "",
    sha1: "",
    sha256: "",
    sha512: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  // Use Sonner toast directly; a custom hook (`use-toast`) was removed/renamed.

  const calculateTextHashes = useCallback((text) => {
    if (!text) {
      setHashes({ md5: "", sha1: "", sha256: "", sha512: "" });
      return;
    }
    setHashes({
      md5: CryptoJS.MD5(text).toString(),
      sha1: CryptoJS.SHA1(text).toString(),
      sha256: CryptoJS.SHA256(text).toString(),
      sha512: CryptoJS.SHA512(text).toString(),
    });
  }, []);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setTextInput(val);
    calculateTextHashes(val);
  };

  const handleFile = (files) => {
    if (files && files.length > 0) {
      setFile(files[0]);
      calculateFileHash(files[0]);
    }
  };

  const calculateFileHash = (fileToHash) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const binary = e.target.result;
      const wordArray = CryptoJS.lib.WordArray.create(binary);

      setHashes({
        md5: CryptoJS.MD5(wordArray).toString(),
        sha1: CryptoJS.SHA1(wordArray).toString(),
        sha256: CryptoJS.SHA256(wordArray).toString(),
        sha512: CryptoJS.SHA512(wordArray).toString(),
      });
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setIsProcessing(false);
      toast({ title: "Error", description: "Failed to read file", variant: "destructive" });
    };
    reader.readAsArrayBuffer(fileToHash);
  };

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} hash copied to clipboard.`,
    });
  };

  const toolName = "Hash Generator";
  const toolDescription = "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes for text or files instantly. Verify file integrity and secure your data.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Securely generate cryptographic hashes for any text or file."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={[
        "Choose 'Text' or 'File' mode.",
        "Enter your text or upload a file.",
        "Instantly view generated hashes (MD5, SHA-1, SHA-256, SHA-512).",
        "Click to copy any hash to your clipboard."
      ]}
      faqs={[
        {
          question: "Is it secure?",
          answer: "Yes. All hashing is done locally in your browser using JavaScript. Your data never leaves your device."
        },
        {
          question: "What algorithms are supported?",
          answer: "We support MD5, SHA-1, SHA-256, and SHA-512."
        },
        {
          question: "Can I hash large files?",
          answer: "Browser-based hashing works best for small to medium files. Very large files might cause the browser to freeze."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Hash Generator", href: "/hash-generator" },
      ]}
      currentTool="hash-generator"
    >
      <div className="space-y-8">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setHashes({ md5: "", sha1: "", sha256: "", sha512: "" }); setTextInput(""); setFile(null); }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="w-4 h-4" /> Text
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">Enter Text</Label>
              <Textarea
                id="text-input"
                placeholder="Type something to hash..."
                value={textInput}
                onChange={handleTextChange}
                className="min-h-[120px] font-mono"
              />
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <FileDropzone
              onFiles={handleFile}
              label="Upload File to Hash"
              description="Drag & drop any file here"
              isLoading={isProcessing}
              maxFiles={1}
            />
            {file && (
              <div className="text-sm text-center text-foreground">
                Selected: <span className="font-medium text-foreground dark:text-foreground">{file.name}</span>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="grid gap-4">
          {["MD5", "SHA1", "SHA256", "SHA512"].map((algo) => (
            <div key={algo} className="space-y-2">
              <Label className="text-xs font-bold text-foreground uppercase tracking-wider">{algo}</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={hashes[algo.toLowerCase()] || ""}
                  className="font-mono text-sm bg-background dark:bg-background/50"
                  placeholder={`${algo} hash will appear here...`}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(hashes[algo.toLowerCase()], algo)}
                  disabled={!hashes[algo.toLowerCase()]}
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolPageLayout>
  );
}
