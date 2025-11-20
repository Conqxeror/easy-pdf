"use client";

import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { loadFfmpegClient } from "@/lib/ffmpegClient";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";

const ACCEPT = "video/*"; // Accept video files only for removing audio
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB guard

export default function RemoveAudioClient() {
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
    if (selected.size > MAX_FILE_SIZE) {
      setError("File too large. Please use files under 500MB for client-side processing.");
      return;
    }
    setFile(selected);
  };

  const removeAudio = async () => {
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
      const out = "output_no_audio.mp4"; // Always output as MP4 without audio

      // Clean up any previous files
      try { ffmpeg.FS("unlink", inName); } catch { };
      try { ffmpeg.FS("unlink", out); } catch { };

      // Write input file
      ffmpeg.FS("writeFile", inName, await fetchFile(file));

      // Remove audio using FFmpeg: copy video stream without audio
      await ffmpeg.run(
        "-i", inName,
        "-c:v", "copy",  // Copy video stream without re-encoding
        "-an",           // Remove audio stream
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
      console.error("Remove audio failed", err);
      setError(err?.message || "Failed to remove audio. The file may be corrupted or in an unsupported format.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const toolName = "Remove Audio";
  const toolDescription = "Remove the audio track from video files using FFmpeg.wasm. Create silent video files directly in your browser without uploading to a server.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={["Upload video file", "Remove audio track", "Download the silent video"]}
      faqs={[
        {
          question: "Is my file uploaded to a server?",
          answer: "No — FFmpeg.wasm runs inside your browser so your file never leaves your device."
        },
        {
          question: "What file formats are supported?",
          answer: "This tool accepts most video formats (MP4, AVI, MKV, MOV, etc.) as input."
        },
        {
          question: "Will the video quality be affected?",
          answer: "The video quality is preserved as the video stream is copied without re-encoding. Only the audio stream is removed."
        }
      ]}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Remove Audio', href: '/remove-audio' }]}
      currentTool="remove-audio"
    >
      <div className="space-y-6">
        <FileDropzone
          accept={ACCEPT}
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload video file"
          description="Video files (max 500MB)"
          maxSize={MAX_FILE_SIZE}
        />

        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}

        <div className="flex gap-3">
          <Button onClick={removeAudio} disabled={!file || isProcessing}>
            {isProcessing ? 'Removing audio...' : 'Remove Audio'}
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
          <div className="p-4 bg-green-50 rounded-none border border-green-200">
            <p className="font-semibold text-green-800">Audio removal complete!</p>
            <a
              className="text-blue-600 underline inline-block mt-2 px-4 py-2 bg-blue-100 rounded-none hover:bg-blue-200 transition-colors"
              href={downloadUrl}
              download={`${file?.name.replace(/\.[^/.]+$/, "") || "video_no_audio"}.mp4`}
            >
              Download Video (No Audio)
            </a>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
