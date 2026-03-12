"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Key, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function RsaGeneratorClient() {
  const [keySize, setKeySize] = useState("2048");
  const [keys, setKeys] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedPrivate, setCopiedPrivate] = useState(false);

  const generateKeys = async () => {
    setIsGenerating(true);
    setKeys(null);

    try {
      // Use Web Crypto API
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: parseInt(keySize),
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      setKeys({
        public: formatPem(publicKey, "PUBLIC KEY"),
        private: formatPem(privateKey, "PRIVATE KEY"),
      });
    } catch {
      toast.error("Failed to generate key pair");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatPem = (buffer, type) => {
    const str = arrayBufferToBase64(buffer);
    const chunks = str.match(/.{1,64}/g).join("\n");
    return `-----BEGIN ${type}-----\n${chunks}\n-----END ${type}-----`;
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const copyToClipboard = (text, isPublic) => {
    navigator.clipboard.writeText(text);
    if (isPublic) {
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2000);
    } else {
      setCopiedPrivate(true);
      setTimeout(() => setCopiedPrivate(false), 2000);
    }
  };

  return (
    <ToolPageLayout
      title="RSA Key Generator"
      subtitle="Generate secure RSA public and private key pairs."
      toolName="RSA Generator"
      toolDescription="Generate RSA key pairs (2048 or 4096 bit) directly in your browser using the Web Crypto API. Keys are generated locally and never sent to any server."
      currentTool="rsa-generator"
      steps={[
        "Select the key size (2048 or 4096 bits).",
        "Click 'Generate Keys' to create a new pair.",
        "Copy or download your public and private keys."
      ]}
      faqs={[
        {
          question: "Is it safe?",
          answer: "Yes, keys are generated using your browser's native Web Crypto API. They are created locally on your device."
        },
        {
          question: "What format are the keys?",
          answer: "The keys are provided in PEM format (PKCS#8 for private, SPKI for public), compatible with OpenSSL and most libraries."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "RSA Generator", href: "/rsa-generator" }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-2 flex-1">
            <Label>Key Size</Label>
            <Select value={keySize} onValueChange={setKeySize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2048">2048 bits (Standard)</SelectItem>
                <SelectItem value="4096">4096 bits (High Security)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generateKeys} disabled={isGenerating} size="lg" className="min-w-[200px]">
            {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
            {isGenerating ? "Generating..." : "Generate Keys"}
          </Button>
        </div>

        {keys && (
          <div className="grid gap-8 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-emerald-600 dark:text-emerald-400 font-bold">Public Key</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(keys.public, true)}
                >
                  {copiedPublic ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Textarea
                readOnly
                value={keys.public}
                className="font-mono text-xs h-[300px] bg-muted"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-destructive font-bold">Private Key</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(keys.private, false)}
                >
                  {copiedPrivate ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Textarea
                readOnly
                value={keys.private}
                className="font-mono text-xs h-[300px] bg-red-50/50"
              />
              <p className="text-xs text-destructive font-medium mt-2">
                Warning: Never share your private key with anyone!
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
