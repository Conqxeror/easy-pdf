"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Lock, Unlock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

let cryptoJsLoaderPromise;

const loadCryptoJs = async () => {
  if (!cryptoJsLoaderPromise) {
    cryptoJsLoaderPromise = import("crypto-js").then((module) => module.default);
  }

  return cryptoJsLoaderPromise;
};

export default function AesEncryptClient() {
  const [mode, setMode] = useState("encrypt");
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const process = async () => {
    setError("");
    if (!input || !password) {
      setError("Please enter both text and a password.");
      return;
    }

    try {
      const CryptoJS = await loadCryptoJs();

      if (mode === "encrypt") {
        const encrypted = CryptoJS.AES.encrypt(input, password).toString();
        setOutput(encrypted);
      } else {
        const bytes = CryptoJS.AES.decrypt(input, password);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) {
          setError("Invalid password or corrupted data.");
          setOutput("");
        } else {
          setOutput(decrypted);
        }
      }
    } catch {
      setError("Processing failed. Please check your input.");
      toast.error("Processing failed. Please check your input.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolPageLayout
      title="AES Encryption Tool"
      subtitle="Encrypt and decrypt text using AES-256."
      toolName="AES Encryption"
      toolDescription="Securely encrypt your text messages using Advanced Encryption Standard (AES). Decrypt them back with the correct password. All processing happens in your browser."
      currentTool="aes-encrypt"
      steps={[
        "Choose 'Encrypt' or 'Decrypt' mode.",
        "Enter your text and a secret password.",
        "Click the button to process the text.",
        "Copy the result."
      ]}
      faqs={[
        {
          question: "Is it secure?",
          answer: "Yes, we use the standard AES algorithm via crypto-js. Your data never leaves your browser."
        },
        {
          question: "Can I recover my password?",
          answer: "No. If you lose the password used for encryption, the data cannot be recovered."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "AES Encryption", href: "/aes-encrypt" }
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Tabs value={mode} onValueChange={(v) => { setMode(v); setOutput(""); setError(""); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
            <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label>{mode === "encrypt" ? "Text to Encrypt" : "Encrypted Text"}</Label>
              <Textarea
                placeholder={mode === "encrypt" ? "Enter secret message..." : "Paste encrypted string..."}
                className="min-h-[150px]"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button onClick={() => void process()} className="w-full" size="lg">
              {mode === "encrypt" ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
              {mode === "encrypt" ? "Encrypt Text" : "Decrypt Text"}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {output && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>Result</Label>
                <div className="relative">
                  <Textarea
                    readOnly
                    className="min-h-[150px] bg-muted pr-12"
                    value={output}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </ToolPageLayout>
  );
}
