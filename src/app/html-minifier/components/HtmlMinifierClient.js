"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Check, FileCode } from "lucide-react";

export default function HtmlMinifierClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);

  const minifyHtml = () => {
    if (!input.trim()) return;

    let minified = input
      .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
      .replace(/\s+/g, " ") // Collapse whitespace
      .replace(/>\s+</g, "><") // Remove whitespace between tags
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
      title="HTML Minifier"
      subtitle="Compress HTML code by removing whitespace and comments."
      toolName="HTML Minifier"
      toolDescription="Minify your HTML code to reduce file size and improve page load speed. Removes unnecessary whitespace, comments, and newlines."
      currentTool="html-minifier"
      steps={[
        "Paste your HTML code into the input box.",
        "Click 'Minify HTML' to process the code.",
        "Copy the minified code from the output box."
      ]}
      faqs={[
        {
          question: "Why minify HTML?",
          answer: "Minification reduces the size of your HTML files, leading to faster download times and improved website performance."
        },
        {
          question: "Is it safe?",
          answer: "Yes, this tool only removes comments and unnecessary whitespace. It does not change the structure or logic of your HTML."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "HTML Minifier", href: "/html-minifier" }
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Label>Input HTML</Label>
          <Textarea
            placeholder="Paste your HTML here..."
            className="h-[400px] font-mono text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Minified Output</Label>
            {stats && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
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
        <Button onClick={minifyHtml} size="lg" disabled={!input.trim()}>
          <FileCode className="w-4 h-4 mr-2" />
          Minify HTML
        </Button>
        <Button onClick={copyToClipboard} size="lg" variant="outline" disabled={!output}>
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copied!" : "Copy Output"}
        </Button>
      </div>
    </ToolPageLayout>
  );
}
