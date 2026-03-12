"use client";

import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { toast } from "sonner";
import FileDropzone from "@/components/ui/FileDropzone";
import { loadFfmpegClient } from "@/lib/ffmpegClient";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";

const ACCEPT = "video/mp4,video/webm,video/ogg,video/x-matroska";
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB client cap

export default function VideoCompressClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [crf, setCrf] = useState(28);
  const [preset, setPreset] = useState("fast");

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { };
      }
    };
  }, [downloadUrl]);

  const handleFiles = (files) => {
    setError("");
    if (!files || files.length === 0) { setFile(null); return; }
    const selected = files[0];
    if (selected.size > MAX_VIDEO_SIZE) {
      setError("File too large. Keep compressions under 500MB for browser processing.");
      return;
    }
    setFile(selected);
  };

  const compress = async () => {
    if (!file) { setError("Please upload a video file first."); return; }

    setIsProcessing(true);
    setProgress(3);
    setError("");

    try {
      const { ffmpeg, fetchFile } = await loadFfmpegClient();

      ffmpeg.setProgress(({ ratio }) => setProgress(Math.round(ratio * 100)));

      const inName = "in_video";
      const outName = "out_video.mp4";

      try { ffmpeg.FS("unlink", inName); } catch { }
      try { ffmpeg.FS("unlink", outName); } catch { }

      ffmpeg.FS("writeFile", inName, await fetchFile(file));

      // Re-encode to h264 with CRF and preset
      // Use libx264 if available; fallback to default
      // Try common ffmpeg flags for browser build
      await ffmpeg.run(
        "-i", inName,
        "-c:v", "libx264",
        "-preset", preset,
        "-crf", String(crf),
        "-c:a", "copy",
        outName
      );

      const data = ffmpeg.FS("readFile", outName);
      const blob = new Blob([data.buffer], { type: "video/mp4" });
      const url = safeCreateObjectURL(blob);

      setDownloadUrl(url);
      setProgress(100);
    } catch (err) {
      toast.error(err?.message || "Video compression failed");
      setError(err?.message || "Compression failed. Try a different preset or smaller input.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const toolName = "Video Compressor";
  const toolDescription = "Reduce video size using a client-side FFmpeg re-encode with adjustable CRF and encoding preset."

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={["Upload video", "Choose CRF/preset", "Compress & Download"]}
      faqs={[{ question: "Is this offline?", answer: "Yes — everything is processed in your browser using ffmpeg.wasm." }]}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Video Compressor', href: '/video-compress' }]}
      currentTool="video-compress"
    >
      <div className="space-y-6">
        <FileDropzone accept={ACCEPT} multiple={false} onFiles={handleFiles} error={error} setError={setError} label="Upload video" description="MP4/WebM/MKV etc (max 500MB)" maxSize={MAX_VIDEO_SIZE} />

        {error && <Alert variant="destructive">{error}</Alert>}

        <div className="flex items-center gap-3">
          <label>CRF (lower = better quality, larger file)</label>
          <input type="range" min="18" max="35" value={crf} onChange={(e) => setCrf(Number(e.target.value))} />
          <span className="w-8">{crf}</span>
        </div>

        <div className="flex items-center gap-3">
          <label>Preset</label>
          <select value={preset} onChange={(e) => setPreset(e.target.value)}>
            <option value="ultrafast">ultrafast</option>
            <option value="superfast">superfast</option>
            <option value="veryfast">veryfast</option>
            <option value="faster">faster</option>
            <option value="fast">fast</option>
            <option value="medium">medium</option>
            <option value="slow">slow</option>
          </select>
        </div>

        <div className="flex gap-3">
          <Button onClick={compress} disabled={!file || isProcessing}>{isProcessing ? 'Compressing...' : 'Compress Video'}</Button>
          <Button variant="ghost" onClick={() => { setFile(null); setDownloadUrl(null); setError(""); }}>Clear</Button>
        </div>

        {(isProcessing || progress > 0) && (
          <div>
            <div className="text-sm">{progress}%</div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {downloadUrl && (
          <div className="p-4 bg-muted rounded-none">
            <p className="font-semibold">Compressed file ready</p>
            <a className="text-primary-foreground bg-primary px-3 py-1 rounded-none underline" href={downloadUrl} download>Download</a>
          </div>
        )}

      </div>
    </ToolPageLayout>
  );
}
