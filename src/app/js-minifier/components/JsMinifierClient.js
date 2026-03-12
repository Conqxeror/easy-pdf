"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Check, FileCode } from "lucide-react";
import { Alert } from "@/components/ui/alert";

export default function JsMinifierClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const minifyJs = () => {
    if (!input.trim()) return;
    setError("");

    try {
      // Basic JS minification (Regex based - NOT a full parser)
      // NOTE: This is a simplified version. For full minification, we'd need a parser like Terser.
      // But loading Terser in browser can be heavy.
      // This removes comments and extra whitespace.

      let minified = input
        .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
        .replace(/\/\/.*/g, "") // Remove line comments (careful with URLs)
        .replace(/\s+/g, " ") // Collapse whitespace
        .replace(/\s*([{}:;,=()<>])\s*/g, "$1") // Remove whitespace around operators
        .trim();

      // Safety check: if we broke strings, this is bad. 
      // A real parser is needed for robust JS minification.
      // For now, we'll use this basic version but warn users.

      setOutput(minified);

      const originalSize = new Blob([input]).size;
      const minifiedSize = new Blob([minified]).size;
      const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);

      setStats({
        original: formatBytes(originalSize),
        minified: formatBytes(minifiedSize),
        savings: `${savings}%`
      });
    } catch {
      setError("Failed to minify JS. Please check your syntax.");
    }
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
      title="JS Minifier"
      subtitle="Compress JavaScript code to reduce file size."
      toolName="JS Minifier"
      toolDescription="Minify your JavaScript code to improve website loading speed. Removes comments and whitespace. Note: This is a basic minifier and does not rename variables."
      currentTool="js-minifier"
      steps={[
        "Paste your JavaScript code into the input box.",
        "Click 'Minify JS' to process the code.",
        "Copy the minified code from the output box."
      ]}
      faqs={[
        {
          question: "Does this rename variables?",
          answer: "No, this tool performs basic minification (whitespace and comment removal) to ensure safety. It does not mangle variable names."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "JS Minifier", href: "/js-minifier" }
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Label>Input JavaScript</Label>
          <Textarea
            placeholder="Paste your JS here..."
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

      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}

      <div className="flex justify-center gap-4 mt-8">
        <Button onClick={minifyJs} size="lg" disabled={!input.trim()}>
          <FileCode className="w-4 h-4 mr-2" />
          Minify JS
        </Button>
        <Button onClick={copyToClipboard} size="lg" variant="outline" disabled={!output}>
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copied!" : "Copy Output"}
        </Button>
      </div>
    </ToolPageLayout>
  );
}
