"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Check, FileCode } from "lucide-react";

export default function CssMinifierClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);

  const minifyCss = () => {
    if (!input.trim()) return;

    let minified = input
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comments
      .replace(/\s+/g, " ") // Collapse whitespace
      .replace(/\s*([{}:;,])\s*/g, "$1") // Remove whitespace around separators
      .replace(/;\}/g, "}") // Remove last semicolon
      .trim();

    setOutput(minified);

    const originalSize = new Blob([input]).size;
    const minifiedSize = new Blob([minified]).size;
    const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);

    setStats({
      original: formatBytes(originalSize),
      minified: formatBytes(minifiedSize),
      savings: `${savings}%`
    });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolPageLayout
      title="CSS Minifier"
      subtitle="Compress CSS code to reduce file size."
      toolName="CSS Minifier"
      toolDescription="Minify your CSS code to improve website loading speed. Removes comments, whitespace, and unnecessary characters."
      currentTool="css-minifier"
      steps={[
        "Paste your CSS code into the input box.",
        "Click 'Minify CSS' to process the code.",
        "Copy the minified code from the output box."
      ]}
      faqs={[
        {
          question: "Does this affect my styles?",
          answer: "No, minification only removes unnecessary characters like whitespace and comments. The browser interprets the code exactly the same way."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "CSS Minifier", href: "/css-minifier" }
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Label>Input CSS</Label>
          <Textarea
            placeholder="Paste your CSS here..."
            className="h-[400px] font-mono text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Minified Output</Label>
            {stats && (
              <span className="text-xs text-green-600 font-medium">
                Saved {stats.savings} ({stats.original} → {stats.minified})
              </span>
            )}
          </div>
          <Textarea
            readOnly
            className="h-[400px] font-mono text-sm bg-muted"
            value={output}
          />
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Button onClick={minifyCss} size="lg" disabled={!input.trim()}>
          <FileCode className="w-4 h-4 mr-2" />
          Minify CSS
        </Button>
        <Button onClick={copyToClipboard} size="lg" variant="outline" disabled={!output}>
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copied!" : "Copy Output"}
        </Button>
      </div>
    </ToolPageLayout>
  );
}
