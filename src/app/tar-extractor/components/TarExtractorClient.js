"use client";

import React, { useState, useRef } from "react";
import { decompressSync } from "fflate";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import { toast } from "sonner";

const ACCEPT = ".tar,.tar.gz,.tgz,.gz";
const MAX_SIZE = 250 * 1024 * 1024; // 250MB

function readString(buffer, start, length) {
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(buffer.slice(start, start + length)).replace(/\u0000.*$/s, "").trim();
}

function parseTar(uint8array) {
  const files = [];
  const blockSize = 512;
  let offset = 0;
  while (offset < uint8array.length) {
    const name = readString(uint8array, offset, 100);
    if (!name) break; // empty header

    const sizeField = readString(uint8array, offset + 124, 12);
    const size = parseInt(sizeField.trim() || "0", 8);
    const headerBlocks = 1;
    const dataStart = offset + blockSize * headerBlocks;
    const dataEnd = dataStart + size;
    const data = uint8array.slice(dataStart, dataEnd);

    files.push({ name, size, raw: data });

    const dataBlocks = Math.ceil(size / blockSize);
    offset = dataStart + dataBlocks * blockSize;
  }

  return files;
}

export default function TarExtractorClient() {
  const [file, setFile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const cache = useRef(new Map());

  const handleFiles = (files) => {
    setError("");
    if (!files?.length) { setFile(null); setEntries([]); return; }
    setFile(files[0]);
    setEntries([]);
  };

  const extract = async () => {
    if (!file) { setError("Please upload a TAR / GZ archive"); return; }
    if (file.size > MAX_SIZE) { setError("Archive too large for in-browser extraction."); return; }

    setError("");
    setProgress(5);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      let tarData = uint8;

      // check for gzip header: 1f 8b
      if (uint8[0] === 0x1f && uint8[1] === 0x8b) {
        setProgress(15);
        // decompress gzip
        tarData = decompressSync(uint8); // fflate decompress
      }

      setProgress(40);
      const parsed = parseTar(tarData);
      setProgress(90);

      const prepared = await Promise.all(parsed.map(async (entry) => {
        const blob = new Blob([entry.raw]);
        const url = safeCreateObjectURL(blob);
        cache.current.set(entry.name, url);
        return {
          path: entry.name,
          name: entry.name.split('/').pop(),
          size: entry.size,
          url,
        };
      }));

      setEntries(prepared);
      setProgress(100);
      setTimeout(() => setProgress(0), 1200);
    } catch (err) {
      toast.error(err?.message || "TAR extraction failed");
      setError("Failed to unpack archive. Make sure the file is a valid tar or tar.gz archive.");
      setEntries([]);
      setProgress(0);
    }
  };

  const cleanup = () => {
    cache.current.forEach((u) => { try { safeRevokeObjectURL(u); } catch { } });
    cache.current.clear();
  };

  const download = (entry) => {
    const url = cache.current.get(entry.path);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = sanitizeFileName(entry.name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolPageLayout
      title="TAR / GZIP Extractor"
      subtitle="Open .tar and .tar.gz archives in your browser and download files individually."
      toolName="TAR / GZIP Extractor"
      toolDescription="Extract tar and gzip archives client-side using a lightweight parser. Great for local previews and single-file downloads."
      steps={["Upload a .tar or .tar.gz file", "Click Extract", "Download individual files"]}
      faqs={[{ question: 'Do you upload my archive?', answer: 'No — extraction happens entirely in your browser.' }]}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'TAR/GZIP Extractor', href: '/tar-extractor' }]}
      currentTool="tar-extractor"
    >
      <div className="space-y-6">
        <FileDropzone accept={ACCEPT} multiple={false} onFiles={handleFiles} error={error} setError={setError} label="Upload an archive" description="Supported: .tar, .tar.gz, .tgz, .gz" maxSize={MAX_SIZE} />

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Extraction error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(progress > 0) && (
          <div>
            <div className="text-sm text-foreground">{progress}%</div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={extract} disabled={!file}>Extract Archive</Button>
          <Button variant="ghost" onClick={() => { setFile(null); setEntries([]); cleanup(); setError(""); }}>Clear</Button>
        </div>

        {entries.length > 0 && (
          <div className="grid gap-3">
            {entries.map((e) => (
              <div className="flex items-center justify-between border p-2 rounded-none" key={e.path}>
                <div>
                  <div className="font-medium">{e.path}</div>
                  <div className="text-xs text-foreground">{e.size} bytes</div>
                </div>
                <div>
                  <Button size="sm" onClick={() => download(e)}>Download</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
