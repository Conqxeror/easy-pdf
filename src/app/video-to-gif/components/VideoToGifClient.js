"use client";

import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { loadFfmpegClient } from "@/lib/ffmpegClient";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";

const ACCEPT = "video/mp4,video/webm,video/ogg,video/x-matroska";
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB guard

export default function VideoToGifClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  // const [ffmpegReady, setFfmpegReady] = useState(false);
  const [fps, setFps] = useState(10);
  const [scale, setScale] = useState(320);

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
      setError("File too large. Please use files under 200MB for client-side conversion.");
      return;
    }
    setFile(selected);
  };

  const convertToGif = async () => {
    if (!file) { setError("Please upload a video file first."); return; }

    setIsProcessing(true);
    setProgress(5);
    setError("");

    try {
      const { ffmpeg, fetchFile } = await loadFfmpegClient();
      // setFfmpegReady(true);

      ffmpeg.setProgress(({ ratio }) => {
        setProgress(Math.min(100, Math.round(ratio * 100)));
      });

      // filenames inside FS
      const inName = "input_video";
      const pal = "palette.png";
      const out = "output.gif";

      try { ffmpeg.FS("unlink", inName); } catch { };
      try { ffmpeg.FS("unlink", pal); } catch { };
      try { ffmpeg.FS("unlink", out); } catch { };

      ffmpeg.FS("writeFile", inName, await fetchFile(file));

      // Step 1: generate palette for better colors
      // fps and scale are user-configurable
      await ffmpeg.run(
        "-i", inName,
        "-vf", `fps=${fps},scale=${scale}:-1:flags=lanczos,palettegen`,
        pal
      );

      // Step 2: generate gif using palette
      await ffmpeg.run(
        "-i", inName,
        "-i", pal,
        "-lavfi", `fps=${fps},scale=${scale}:-1:flags=lanczos [x]; [x][1:v] paletteuse`,
        out
      );

      const data = ffmpeg.FS("readFile", out);
      const blob = new Blob([data.buffer], { type: "image/gif" });

      // const fileName = `${sanitizeFileName(file.name.replace(/\.[^.]+$/, "")) || "converted"}.gif`;
      const url = safeCreateObjectURL(blob);
      setDownloadUrl(url);

      try { ffmpeg.FS("unlink", inName); } catch { };
      try { ffmpeg.FS("unlink", pal); } catch { };
      try { ffmpeg.FS("unlink", out); } catch { };

      setProgress(100);
    } catch (err) {
      setError(err?.message || "Conversion failed. Try a shorter clip or lower FPS/scale.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const toolName = "Video → GIF";
  const toolDescription = "Convert .mp4/.webm (and similar) to animated GIFs in the browser. You can tune frames-per-second and width scale before conversion.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={["Upload video", "Tune FPS/size", "Convert & download"]}
      faqs={[{ question: "Is my video uploaded?", answer: "No — ffmpeg.wasm runs inside your browser so your video never leaves your device." }]}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Video → GIF', href: '/video-to-gif' }]}
      currentTool="video-to-gif"
    >
      <div className="space-y-6">
        <FileDropzone accept={ACCEPT} multiple={false} onFiles={handleFiles} error={error} setError={setError} label="Upload video" description="MP4, WebM, MKV etc (max 200MB)" maxSize={MAX_VIDEO_SIZE} />

        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}

        <div className="flex items-center gap-3">
          <label htmlFor="gif-fps" className="text-sm font-medium">FPS</label>
          <input id="gif-fps" type="number" min="1" max="30" value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-20 rounded-none border px-2" />
          <label htmlFor="gif-width" className="text-sm font-medium">Width</label>
          <input id="gif-width" type="number" min="64" max="1920" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-24 rounded-none border px-2" />
        </div>

        <div className="flex gap-3">
          <Button onClick={convertToGif} disabled={!file || isProcessing}>{isProcessing ? 'Converting...' : 'Convert to GIF'}</Button>
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
            <p className="font-semibold">GIF ready</p>
            <a className="text-primary-foreground bg-primary px-3 py-1 rounded-none underline" href={downloadUrl} download>Download GIF</a>
          </div>
        )}

      </div>
    </ToolPageLayout>
  );
}
