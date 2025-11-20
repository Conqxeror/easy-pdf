"use client";

import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { loadFfmpegClient } from "@/lib/ffmpegClient";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";

const ACCEPT = "video/mp4,video/webm,video/ogg,video/x-matroska";
const MAX_SIZE = 400 * 1024 * 1024; // 400MB cap

export default function WebmToMp4Client() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadName, setDownloadName] = useState("");
  const [target, setTarget] = useState("mp4");

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { /* ignore */ }
      }
    };
  }, [downloadUrl]);

  const handleFiles = (files) => {
    setError("");
    if (!files || files.length === 0) { setFile(null); return; }
    const selected = files[0];
    if (selected.size > MAX_SIZE) {
      setError("File too large. Keep uploads under 400MB for client conversion.");
      return;
    }
    setFile(selected);
  };

  const convert = async () => {
    if (!file) { setError("Please upload a video file first."); return; }
    setIsProcessing(true);
    setProgress(3);
    setError("");

    try {
      const { ffmpeg, fetchFile } = await loadFfmpegClient();

      ffmpeg.setProgress(({ ratio }) => setProgress(Math.min(99, Math.round(ratio * 100))));

      const inName = "input_vid";
      const outName = target === "mp4" ? "output.mp4" : "output.webm";

      try { ffmpeg.FS("unlink", inName); } catch { }
      try { ffmpeg.FS("unlink", outName); } catch { }

      ffmpeg.FS("writeFile", inName, await fetchFile(file));

      if (target === "mp4") {
        await ffmpeg.run(
          "-i", inName,
          "-c:v", "libx264",
          "-preset", "fast",
          "-crf", "23",
          "-c:a", "aac",
          "-b:a", "128k",
          outName
        );
      } else {
        await ffmpeg.run(
          "-i", inName,
          "-c:v", "libvpx",
          "-b:v", "1M",
          "-c:a", "libvorbis",
          outName
        );
      }

      const data = ffmpeg.FS("readFile", outName);
      const blobType = target === "mp4" ? "video/mp4" : "video/webm";
      const blob = new Blob([data.buffer], { type: blobType });

      const sanitizedBase = sanitizeFileName(file.name.replace(/\.[^/.]+$/, "")) || "converted-video";
      const finalName = `${sanitizedBase}.${target}`;
      setDownloadName(finalName);
      const url = safeCreateObjectURL(blob);

      setDownloadUrl(url);
      setProgress(100);

      try { ffmpeg.FS("unlink", inName); } catch { }
      try { ffmpeg.FS("unlink", outName); } catch { }
    } catch (err) {
      console.error("Video format conversion failed", err);
      setError(err?.message || "Conversion failed. Try a different input or smaller file.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  const toolName = "WebM ↔ MP4 Converter";
  const desc = "Convert videos between WebM and MP4 formats in the browser using ffmpeg.wasm.";

  return (
    <ToolPageLayout title={toolName} subtitle={desc} toolName={toolName} toolDescription={desc} steps={["Upload a video", "Pick the target format", "Convert & download"]} faqs={[{ question: "Is this offline?", answer: "Yes — everything runs in your browser with ffmpeg.wasm." }]} breadcrumbs={[{ label: "Home", href: "/" }, { label: toolName, href: "/webm-to-mp4" }]} currentTool="webm-to-mp4">
      <div className="space-y-6">
        <FileDropzone accept={ACCEPT} multiple={false} onFiles={handleFiles} error={error} setError={setError} label="Upload video" description="MP4/WebM/MKV up to 400MB" maxSize={MAX_SIZE} />

        {file && (
          <div className="p-3 border rounded-none bg-background dark:bg-background/40">
            <p className="font-semibold">{file.name}</p>
            <p className="text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        )}

        {error && <Alert variant="destructive">{error}</Alert>}

        <div className="flex items-center gap-3">
          <label className="text-sm">Target format</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="mp4">MP4 (H.264 + AAC)</option>
            <option value="webm">WebM (VP8/VP9 + Vorbis/Opus)</option>
          </select>
        </div>

        <div className="flex gap-3">
          <Button onClick={convert} disabled={!file || isProcessing}>{isProcessing ? 'Converting...' : 'Convert'}</Button>
          <Button variant="ghost" onClick={() => { setFile(null); setDownloadUrl(null); setError(""); }}>Clear</Button>
        </div>

        {(isProcessing || progress > 0) && (
          <div>
            <div className="text-sm">{progress}%</div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {downloadUrl && (
          <div className="p-3 bg-green-50 rounded-none">
            <p className="font-semibold">Converted file ready</p>
            <a href={downloadUrl} download={downloadName || true} className="text-blue-600 underline">Download</a>
          </div>
        )}

      </div>
    </ToolPageLayout>
  );
}
