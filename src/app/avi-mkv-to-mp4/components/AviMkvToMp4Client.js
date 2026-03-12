"use client";

import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { loadFfmpegClient } from "@/lib/ffmpegClient";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";
import { toast } from "sonner";

const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB guard

export default function AviMkvToMp4Client() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);

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
      setError("File too large. Please use files under 500MB for client-side conversion.");
      return;
    }
    setFile(selected);
  };

  const convertToMp4 = async () => {
    if (!file) { setError("Please upload a video file first."); return; }

    setIsProcessing(true);
    setProgress(5);
    setError("");

    try {
      const { ffmpeg, fetchFile } = await loadFfmpegClient();

      ffmpeg.setProgress(({ ratio }) => {
        setProgress(Math.min(100, Math.round(ratio * 100)));
      });

      // filenames inside FS
      const inName = "input_video";
      const out = "output.mp4";

      // Clean up any previous files
      try { ffmpeg.FS("unlink", inName); } catch { };
      try { ffmpeg.FS("unlink", out); } catch { };

      // Write input file
      ffmpeg.FS("writeFile", inName, await fetchFile(file));

      // Convert using FFmpeg with common encoding settings for MP4
      await ffmpeg.run(
        "-i", inName,
        "-c:v", "libx264",  // Use H.264 codec which is widely supported
        "-preset", "medium",  // Good balance between speed and compression
        "-crf", "23",  // Quality setting (lower = better quality)
        "-c:a", "aac",  // Use AAC for audio (required for MP4)
        "-b:a", "128k",  // Audio bitrate
        "-movflags", "+faststart",  // Enable streaming
        out
      );

      const data = ffmpeg.FS("readFile", out);
      const blob = new Blob([data.buffer], { type: "video/mp4" });

      const url = safeCreateObjectURL(blob);
      setDownloadUrl(url);

      // Clean up
      try { ffmpeg.FS("unlink", inName); } catch { };
      try { ffmpeg.FS("unlink", out); } catch { };

      setProgress(100);
    } catch (err) {
      const msg = err?.message || "Conversion failed. Try a shorter clip or different video format.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const toolName = "AVI/MKV to MP4 Converter";
  const toolDescription = "Convert AVI and MKV videos to MP4 format in the browser using FFmpeg.wasm. Your video never leaves your device during conversion.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={["Upload AVI or MKV video", "Convert to MP4", "Download the converted file"]}
      faqs={[
        {
          question: "Is my video uploaded to a server?",
          answer: "No — FFmpeg.wasm runs inside your browser so your video never leaves your device."
        },
        {
          question: "What video formats are supported?",
          answer: "This tool accepts AVI and MKV video files and converts them to MP4 format."
        },
        {
          question: "Are there any size limits?",
          answer: "Files up to 500MB are supported. Larger files may cause memory issues in the browser."
        }
      ]}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'AVI/MKV to MP4', href: '/avi-mkv-to-mp4' }]}
      currentTool="avi-mkv-to-mp4"
    >
      <div className="space-y-6">
        <FileDropzone
          accept=".avi,.mkv,video/x-msvideo,video/avi,video/msvideo,video/x-avi,video/x-matroska"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload AVI or MKV video"
          description="AVI or MKV files (max 500MB)"
          maxSize={MAX_VIDEO_SIZE}
        />

        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}

        <div className="flex gap-3">
          <Button onClick={convertToMp4} disabled={!file || isProcessing}>
            {isProcessing ? 'Converting...' : 'Convert to MP4'}
          </Button>
          <Button variant="ghost" onClick={() => { setFile(null); setDownloadUrl(null); setError(""); }}>
            Clear
          </Button>
        </div>

        {(isProcessing || progress > 0) && (
          <div>
            <div className="text-sm">{progress}%</div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {downloadUrl && (
          <div className="p-4 bg-muted rounded-none border border-border">
            <p className="font-semibold text-foreground">MP4 conversion complete!</p>
            <a
              className="inline-block mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-none hover:bg-primary/90 transition-colors"
              href={downloadUrl}
              download={`${file?.name.replace(/\.[^/.]+$/, "") || "converted"}.mp4`}
            >
              Download MP4
            </a>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
