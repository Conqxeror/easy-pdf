"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";

const MAX_TOTAL_SIZE = 200 * 1024 * 1024; // 200MB cap for zip creation

export default function ZipCreatorClient() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleFiles = (incoming) => {
    setError("");
    if (!incoming || incoming.length === 0) { setFiles([]); return; }
    setFiles(Array.from(incoming));
  };

  const createZip = async () => {
    setError("");
    if (!files.length) { setError("Please select files to compress."); return; }

    const totalSize = files.reduce((a, b) => a + (b?.size || 0), 0);
    if (totalSize > MAX_TOTAL_SIZE) { setError("Total size exceeds the 200MB limit for in-browser zipping."); return; }

    setIsProcessing(true);
    setProgress(0);

    try {
      const zip = new JSZip();
      let added = 0;
      for (const file of files) {
        zip.file(file.name, file);
        added += 1;
        setProgress(Math.round((added / files.length) * 80));
        await new Promise((r) => setTimeout(r, 10)); // avoid blocking UI
      }

      setProgress(90);
      const content = await zip.generateAsync({ type: "blob" }, (metadata) => {
        setProgress(90 + Math.round(metadata.percent / 10));
      });

      const url = safeCreateObjectURL(content);
      setDownloadUrl(url);

      const defaultName = sanitizeFileName("archive") || "archive";
      const fileName = `${defaultName}.zip`;
      setTimeout(() => setProgress(100), 300);

      // auto start download
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        try { safeRevokeObjectURL(url); } catch { };
      }, 5000);
    } catch (err) {
      console.error("Zip creation failed", err);
      setError("Failed to create ZIP archive. Please try again.");
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const toolName = "ZIP Creator";
  const toolDescription = "Create ZIP archives in the browser. Drag files and folders, compress them locally, and save a single bundle.";

  return (
    <ToolPageLayout title={toolName} subtitle={toolDescription} toolName={toolName} toolDescription={toolDescription} steps={["Drag or pick files", "Create ZIP", "Download"]} faqs={[{ question: 'Is my data uploaded?', answer: 'No, zipping happens in your browser.' }]} breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'ZIP Creator', href: '/zip-creator' }]} currentTool="zip-creator">
      <div className="space-y-6">
        <FileDropzone accept="*/*" multiple onFiles={handleFiles} error={error} setError={setError} label="Pick files" description="Drag & drop or click to add files to the zip (2GB cap might cause failures)" maxSize={MAX_TOTAL_SIZE} />

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Zip error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isProcessing && (
          <div>
            <div className="text-sm text-foreground">Compressing files — {progress}%</div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={createZip} disabled={!files.length || isProcessing}>{isProcessing ? 'Creating...' : 'Create ZIP'}</Button>
          <Button variant="ghost" onClick={() => { setFiles([]); setDownloadUrl(null); setError(""); }} disabled={isProcessing}>Clear</Button>
        </div>

        {downloadUrl && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-none">
            <p className="font-semibold">Archive ready</p>
            <a href={downloadUrl} className="text-blue-600 underline" download>Download ZIP</a>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
