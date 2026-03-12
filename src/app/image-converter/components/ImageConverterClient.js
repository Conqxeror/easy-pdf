"use client";

import React, { useState, useCallback, useRef } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";

const ACCEPTED = "image/jpeg, image/png, image/webp, image/gif, image/bmp";

export default function ImageConverterClient() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(0.92);
  const downloadUrlsRef = useRef(new Map());

  const handleFiles = useCallback((incoming) => {
    setError("");
    if (!incoming || incoming.length === 0) { setFiles([]); return; }
    const prepared = incoming.map((f) => ({
      file: f,
      preview: safeCreateObjectURL(f),
      url: null,
      name: sanitizeFileName(f.name)
    }));
    // revoke old
    downloadUrlsRef.current.forEach(url => { try { safeRevokeObjectURL(url); } catch { } });
    downloadUrlsRef.current.clear();
    setFiles(prepared);
  }, []);

  const convert = async () => {
    if (!files.length) {
      setError("Please upload an image first.");
      return;
    }

    setIsProcessing(true);
    setError("");

    const updatedFiles = files.map(f => ({ ...f }));

    for (let i = 0; i < updatedFiles.length; i++) {
      const item = updatedFiles[i];
      try {
        const img = new Image();
        img.src = item.preview || safeCreateObjectURL(item.file);
        await new Promise((res) => { img.onload = res; img.onerror = res; });

        const canvas = document.createElement('canvas');
        // optional resizing logic
        // keep original size for now
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const mime = outputFormat || 'image/jpeg';
        const blob = await new Promise((res) => {
          canvas.toBlob(res, mime, mime === 'image/jpeg' || mime === 'image/webp' ? quality : undefined);
        });
        const url = safeCreateObjectURL(blob);
        downloadUrlsRef.current.set(item.name, url);
        item.url = url;
        item.outBlob = blob;
      } catch {
        setError('Failed to convert one or more images.');
      }
    }

    setFiles(updatedFiles);
    setIsProcessing(false);
  };

  const downloadImage = (item) => {
    const url = item.url || downloadUrlsRef.current.get(item.name);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.name}.${(outputFormat || 'image/jpeg').split('/')[1]}`;
    a.click();
  };

  const toolName = "Image Converter";
  const toolDescription = "Convert images between JPG, PNG, and WebP formats. Resize and adjust quality, all in your browser.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={["Upload an image", "Choose output format", "Convert and download"]}
      faqs={[{ question: 'Does conversion happen locally?', answer: 'Yes — no files are uploaded.' }]}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Image Converter', href: '/image-converter' }]}
      currentTool="image-converter"
    >
      <div className="space-y-6">
        <FileDropzone accept={ACCEPTED} multiple onFiles={handleFiles} error={error} setError={setError} label="Upload images" description="Supported: JPG, PNG, WEBP, GIF, BMP" />

        {error && <Alert variant="destructive">{error}</Alert>}

        <div className="flex gap-2 items-center">
          <Label>Output</Label>
          <Select onValueChange={(v) => setOutputFormat(v)}>
            <SelectTrigger className="w-40">
              <SelectValue>{outputFormat}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image/jpeg">JPG</SelectItem>
              <SelectItem value="image/png">PNG</SelectItem>
              <SelectItem value="image/webp">WEBP</SelectItem>
            </SelectContent>
          </Select>

          {outputFormat === 'image/jpeg' || outputFormat === 'image/webp' ? (
            <div className="flex items-center gap-2">
              <Label>Quality</Label>
              <input type="range" value={quality} min="0.1" max="1" step="0.05" onChange={e => setQuality(Number(e.target.value))} />
            </div>
          ) : null}
        </div>

        <div className="flex gap-3">
          <Button onClick={convert} disabled={!files.length || isProcessing}>{isProcessing ? 'Converting...' : 'Convert'}</Button>
        </div>

        {files.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {files.map(f => (
              <div key={f.name} className="border rounded-none p-3">
                <div className="flex items-center justify-between">
                  <div><strong>{f.name}</strong></div>
                  <div>
                    <Button onClick={() => { try { safeRevokeObjectURL(f.preview) } catch { } setFiles(files.filter(x => x.name !== f.name)) }} size="sm" variant="ghost">Remove</Button>
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.preview} alt={f.name} className="w-full h-40 object-cover rounded-none mt-2" />
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => downloadImage(f)} disabled={!f.url} size="sm">Download</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
