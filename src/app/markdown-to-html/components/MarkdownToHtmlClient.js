"use client";

import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ACCEPT = ".md,.markdown,text/markdown";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB guard

export default function MarkdownToHtmlClient() {
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [markdownText, setMarkdownText] = useState("");
  const [htmlOutput, setHtmlOutput] = useState("");
  const [fileName, setFileName] = useState("markdown-document");

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { };
      }
    };
  }, [downloadUrl]);

  const handleFiles = (files) => {
    setError("");
    if (!files?.length) {
      setMarkdownText("");
      setHtmlOutput("");
      setDownloadUrl(null);
      return;
    }

    const selected = files[0];
    if (selected.size > MAX_FILE_SIZE) {
      setError("File too large. Please use markdown files under 10MB.");
      return;
    }

    if (!selected.name.toLowerCase().endsWith('.md') && !selected.name.toLowerCase().endsWith('.markdown')) {
      setError("Please upload a markdown file (.md or .markdown)");
      return;
    }

    setFileName(selected.name.replace(/\.[^.]+$/, "")); const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setMarkdownText(content);

      try {
        const processedHtml = convertMarkdownToSimpleHtml(content);
        setHtmlOutput(processedHtml);
        setError("");
      } catch {
        setError("Error processing markdown. Please check your syntax.");
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    };
    reader.readAsText(selected);
  };

  // Simple Markdown to HTML converter
  const convertMarkdownToSimpleHtml = (markdownText) => {
    let html = markdownText;

    // Headers (h1, h2, h3)
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Bold **text** and __text__
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic *text* and _text_
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images ![alt text](url)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // Unordered lists
    html = html.replace(/^\- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');

    // Ordered lists (simplified)
    html = html.replace(/^\d+\.\s(.*$)/gm, '<li>$1</li>');

    // Paragraphs - handle line breaks
    html = html.split('\n\n').map(paragraph => {
      let processed = paragraph.trim();
      processed = processed.replace(/\n/g, '<br>');
      return `<p>${processed}</p>`;
    }).join('');

    return html;
  };

  const handleMarkdownChange = (e) => {
    const text = e.target.value;
    setMarkdownText(text);

    if (text.trim()) {
      try {
        const processedHtml = convertMarkdownToSimpleHtml(text);
        setHtmlOutput(processedHtml);
        setError("");
      } catch {
        setError("Error processing markdown. Please check your syntax.");
      }
    } else {
      setHtmlOutput("");
      setError("");
    }
  };

  const handleConvert = async () => {
    if (!markdownText.trim()) {
      setError("Please enter some markdown text to convert.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const processedHtml = convertMarkdownToSimpleHtml(markdownText);
      setHtmlOutput(processedHtml);

      // Create HTML document for download
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sanitizeFileName(fileName)}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1em;
      margin-bottom: 0.5em;
    }
    p {
      margin-bottom: 1em;
    }
    ul, ol {
      margin-bottom: 1em;
      padding-left: 20px;
    }
    li {
      margin-bottom: 0.25em;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
    }
    pre {
      background-color: #f4f4f4;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  ${htmlOutput}
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
      const url = safeCreateObjectURL(blob);

      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { };
      }

      setDownloadUrl(url);
      setError("");

    } catch {
      setError("Error processing markdown. Please check your syntax.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyHtml = async () => {
    if (htmlOutput) {
      try {
        await navigator.clipboard.writeText(htmlOutput);
        setError("HTML copied to clipboard!");
        setTimeout(() => setError(""), 2000);
      } catch {
        setError("Could not copy to clipboard. Please select and copy manually.");
      }
    }
  };

  const toolName = "Markdown to HTML Converter";
  const toolDescription = "Convert Markdown text to HTML markup. Transform Markdown syntax to properly formatted HTML for use in websites, emails, or other applications.";
  const steps = [
    "Enter Markdown text in the editor or upload a .md file",
    "View the live HTML conversion",
    "Download the HTML file or copy the HTML code"
  ];
  const faqs = [
    {
      question: "Does this tool require server processing?",
      answer: "No. This tool converts Markdown to HTML directly in your browser using a client-side parser. Your content never leaves your device."
    },
    {
      question: "What Markdown syntax is supported?",
      answer: "This converter supports basic Markdown syntax including headers, paragraphs, bold, italic, lists, links, and code blocks. More advanced syntax like tables may require additional processing."
    },
    {
      question: "How do I upload a Markdown file?",
      answer: "Use the file drop zone to upload .md or .markdown files. The tool will automatically convert the content to HTML."
    }
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Markdown to HTML", href: "/markdown-to-html" },
      ]}
      currentTool="markdown-to-html"
    >
      <div className="space-y-6">
        <FileDropzone
          accept={ACCEPT}
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload markdown file"
          description="Markdown files (.md, .markdown)"
          maxSize={MAX_FILE_SIZE}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="markdownInput" className="block text-sm font-medium">Markdown Input</Label>
            <Textarea
              id="markdownInput"
              value={markdownText}
              onChange={handleMarkdownChange}
              placeholder="# Enter your markdown here

## Headers

**Bold text**

*Italic text*

- List item 1
- List item 2

[Link text](https://example.com)
"
              rows={15}
              className="w-full font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleConvert} disabled={isProcessing || !markdownText}>
                {isProcessing ? "Converting..." : "Convert to HTML"}
              </Button>
              <Button variant="outline" onClick={() => { setMarkdownText(""); setHtmlOutput(""); }}>
                Clear
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="htmlOutput" className="block text-sm font-medium">HTML Output</Label>
            <Textarea
              id="htmlOutput"
              value={htmlOutput}
              readOnly
              placeholder="HTML output will appear here..."
              rows={15}
              className="w-full font-mono text-sm bg-background dark:bg-background"
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleCopyHtml} disabled={!htmlOutput}>
                Copy HTML
              </Button>
              {downloadUrl && (
                <Button variant="success" asChild>
                  <a href={downloadUrl} download={`${fileName}.html`}>
                    Download HTML File
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
