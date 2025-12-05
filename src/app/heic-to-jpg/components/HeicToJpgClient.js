"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB guard per image

export default function HeicToJpgClient() {
  const [files, setFiles] = useState([]);
  const [outputFormat, setOutputFormat] = useState("image/jpeg");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.previewUrl) {
          try { safeRevokeObjectURL(file.previewUrl); } catch { /* ignore */ }
        }
        if (file.resultUrl) {
          try { safeRevokeObjectURL(file.resultUrl); } catch { /* ignore */ }
        }
      });
    };
  }, [files, outputFormat]);

  const handleFiles = useCallback((incomingFiles) => {
    setError("");
    if (!incomingFiles?.length) {
      setFiles([]);
      return;
    }

    const prepared = incomingFiles.map((file) => {
      const previewUrl = safeCreateObjectURL(file);
      return {
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        previewUrl,
        resultUrl: null,
        resultName: "",
        status: "pending",
        error: "",
      };
    });

    setFiles((prev) => {
      prev.forEach((f) => {
        if (f.previewUrl) {
          try { safeRevokeObjectURL(f.previewUrl); } catch { /* ignore */ }
        }
        if (f.resultUrl) {
          try { safeRevokeObjectURL(f.resultUrl); } catch { /* ignore */ }
        }
      });
      return prepared;
    });
  }, []);

  const convertAll = useCallback(async () => {
    if (!files.length) {
      setError("Please upload at least one HEIC file.");
      return;
    }

    setIsProcessing(true);
    setProcessingMessage("Preparing conversion...");
    setCurrentProgress(0);
    setError("");

    const updated = [...files];
    const heic2any = (await import("heic2any")).default;

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      if (!item || item.status === "done") continue;

      setProcessingMessage(`Converting ${item.file.name} (${i + 1}/${updated.length})...`);
      setCurrentProgress(Math.round((i / updated.length) * 100));

      try {
        item.status = "processing";
        const toType = outputFormat === "image/png" ? "image/png" : "image/jpeg";
        const opts = { blob: item.file, toType };
        if (toType === "image/jpeg") {
          opts.quality = 0.9;
        }
        const convertedBlob = await heic2any(opts);

        if (item.resultUrl) {
          try { safeRevokeObjectURL(item.resultUrl); } catch { /* ignore */ }
        }

        const resultUrl = safeCreateObjectURL(convertedBlob);
        const extension = toType === "image/png" ? "png" : "jpg";
        const safeName = `${sanitizeFileName(item.file.name.replace(/\.[^.]+$/, "")) || "converted"}.${extension}`;
        item.resultUrl = resultUrl;
        item.resultName = safeName;
        item.status = "done";
        item.error = "";
      } catch (conversionError) {
        console.error("Failed to convert HEIC", conversionError);
        item.status = "error";
        item.error = conversionError?.message || "Conversion failed";
      }
    }

    setFiles(updated.map((item) => ({ ...item })));
    setProcessingMessage("Conversion complete!");
    setCurrentProgress(100);
    setTimeout(() => setCurrentProgress(0), 1200);
    setIsProcessing(false);
  }, [files, outputFormat]);

  const removeFile = (id) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry) {
        if (entry.previewUrl) {
          try { safeRevokeObjectURL(entry.previewUrl); } catch { /* ignore */ }
        }
        if (entry.resultUrl) {
          try { safeRevokeObjectURL(entry.resultUrl); } catch { /* ignore */ }
        }
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const toolName = "HEIC to JPG Converter";
  const toolDescription = "Convert Apple HEIC/HEIF photos to universally compatible JPGs without leaving your browser. Drag multiple images, monitor progress, and save the results instantly.";
  const steps = [
    "Upload one or more HEIC images (drag & drop or click the uploader).",
    "Start the conversion. Everything runs locally using heic2any.",
    "Download each JPG or keep editing before saving.",
  ];
  const faqs = [
    {
      question: "Do you upload my photos?",
      answer: "No. The conversion happens inside your browser tab. Your images never leave your device.",
    },
    {
      question: "Is there a size limit?",
      answer: "We recommend keeping individual images under 100MB to avoid exhausting browser memory.",
    },
    {
      question: "Can I keep the transparency?",
      answer: "JPG does not support alpha channels, so transparent areas will be filled with white. We'll add PNG export soon for that use case.",
    },
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Convert HEIC photos to JPGs instantly. No uploads, no quality surprises."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "HEIC to JPG", href: "/heic-to-jpg" },
      ]}
      currentTool="heic-to-jpg"
    >
      <div className="space-y-6">
        <FileDropzone
          accept=".heic,.heif,image/heic,image/heif"
          multiple
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload HEIC files"
          description="Drag & drop or click to select HEIC/HEIF photos (max 100MB each)"
          maxSize={MAX_FILE_SIZE}
          isLoading={isProcessing}
        />
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Output format</label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="rounded-none border px-2 py-1 text-sm"
          >
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
          </select>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Conversion error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(isProcessing || currentProgress > 0) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-foreground dark:text-foreground">
              <span>{processingMessage || "Processing..."}</span>
              <span>{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between flex-wrap gap-3">
              <p className="text-sm text-foreground dark:text-foreground">{files.length} file(s) ready.</p>
              <div className="flex gap-2">
                <Button onClick={convertAll} disabled={isProcessing}>
                  {isProcessing ? "Converting..." : "Convert Selected"}
                </Button>
                <Button variant="ghost" onClick={() => setFiles([])} disabled={isProcessing}>
                  Clear list
                </Button>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {files.map((item) => (
                <div key={item.id} className="border border-border dark:border-border rounded-none p-4 space-y-3 bg-background dark:bg-background/40">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground dark:text-foreground break-all">{item.file.name}</p>
                      <p className="text-xs text-foreground">{(item.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(item.id)} disabled={isProcessing}>
                      Remove
                    </Button>
                  </div>
                  {item.previewUrl && (
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-full h-48 object-cover rounded-none border border-border dark:border-border"
                    />
                  )}
                  <div className="text-sm">
                    {item.status === "pending" && <span className="text-foreground">Pending conversion</span>}
                    {item.status === "processing" && <span className="text-blue-500">Converting...</span>}
                    {item.status === "done" && (
                      <span className="text-green-600">Ready</span>
                    )}
                    {item.status === "error" && (
                      <span className="text-red-600">{item.error}</span>
                    )}
                  </div>
                  {item.resultUrl && (
                    <Button asChild variant="success" size="sm">
                      <a href={item.resultUrl} download={item.resultName}>
                        Download JPG
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
