"use client";

import React, { useState, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import mammoth from "mammoth";
import { copyToClipboard, sanitizeFileName } from "@/lib/enhancedUX";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB guard for inline extraction

export default function DocxToTextClient() {
  const [text, setText] = useState("");
  const [fileCount, setFileCount] = useState(0);
  const [error, setError] = useState("");

  const handleFiles = useCallback(async (files) => {
    setError("");
    if (!files || files.length === 0) {
      setText("");
      setFileCount(0);
      return;
    }

    const file = files[0];
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large to extract text reliably. Please use a smaller file.");
      return;
    }

    try {
      setText("");
      setFileCount(1);
      const arrayBuffer = await file.arrayBuffer();
      const { value: rawText } = await mammoth.extractRawText({ arrayBuffer });
      setText(rawText || "");
    } catch (err) {
      console.error("DOCX => Text failed", err);
      setError("Failed to extract text from DOCX. Please ensure the file is not corrupted.");
    }
  }, []);

  const handleCopy = async () => {
    try {
      await copyToClipboard(text, "Text copied to clipboard");
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadText = () => {
    const safeName = sanitizeFileName("extracted_text") + ".txt";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = safeName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => { try { URL.revokeObjectURL(link.href); } catch { } }, 500);
  };

  const toolName = "DOCX to Text";
  const toolDescription = "Extract plain text from DOCX files using Mammoth. Preservation of layout is limited; suitable for quick text retrieval and copying.";
  const steps = [
    "Upload a DOCX file using drag & drop or the file picker.",
    "Extract the raw text and preview it in the editor.",
    "Copy to clipboard or download as .txt.",
  ];
  const faqs = [
    { question: "Will formatting be preserved?", answer: "No — this tool extracts raw text only. For richer formatting, use DOCX to PDF or DOCX to HTML conversions." },
    { question: "Is my document uploaded?", answer: "No — all extraction happens inside your browser." },
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "DOCX to Text", href: "/docx-to-text" }]}
      currentTool="docx-to-text"
    >
      <div className="space-y-6">
        <FileDropzone
          accept=".doc,.docx"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload DOCX"
          description="Drag & drop a DOCX file or click to select (max 25MB)"
          maxSize={MAX_FILE_SIZE}
        />

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Extraction error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {fileCount > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Extracted Text</h3>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCopy}>Copy</Button>
                <Button size="sm" onClick={downloadText}>Download .txt</Button>
              </div>
            </div>
            <Textarea value={text} onChange={(evt) => setText(evt.target.value)} rows={18} className="font-mono text-sm" />
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
