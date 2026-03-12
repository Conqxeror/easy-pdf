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

const ACCEPT = ".m4a,audio/mp4,.mp3,audio/mpeg"; // Accept both M4A and MP3 files
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB guard

export default function M4aMp3ConverterClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [conversionDirection, setConversionDirection] = useState("m4a-to-mp3");
  const [bitrate, setBitrate] = useState("192"); // Default to 192kbps

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

    // Determine conversion direction based on file extension
    const fileExt = selected.name.toLowerCase().split('.').pop();
    if (fileExt === 'm4a') {
      setConversionDirection("m4a-to-mp3");
    } else if (fileExt === 'mp3') {
      setConversionDirection("mp3-to-m4a");
    }

    setFile(selected);
  };

  const convertAudio = async () => {
    if (!file) { setError("Please upload an audio file first."); return; }

    setIsProcessing(true);
    setProgress(5);
    setError("");

    try {
      const { ffmpeg, fetchFile } = await loadFfmpegClient();

      ffmpeg.setProgress(({ ratio }) => {
        setProgress(Math.min(100, Math.round(ratio * 100)));
      });

      // Set input/output file names based on conversion direction
      const inName = "input_audio";
      let outName;
      let outputMimeType;

      if (conversionDirection === "m4a-to-mp3") {
        outName = "output.mp3";
        outputMimeType = "audio/mpeg";
      } else {
        outName = "output.m4a";
        outputMimeType = "audio/mp4";
      }

      // Clean up any previous files
      try { ffmpeg.FS("unlink", inName); } catch { };
      try { ffmpeg.FS("unlink", outName); } catch { };

      // Write input file
      ffmpeg.FS("writeFile", inName, await fetchFile(file));

      // Perform the conversion
      if (conversionDirection === "m4a-to-mp3") {
        // Convert M4A to MP3
        await ffmpeg.run(
          "-i", inName,
          "-ab", `${bitrate}k`,     // Audio bitrate
          "-ac", "2",              // Channels (stereo)
          "-ar", "44100",          // Sample rate
          "-y",                    // Overwrite output files
          outName
        );
      } else {
        // Convert MP3 to M4A
        await ffmpeg.run(
          "-i", inName,
          "-c:a", "aac",           // Use AAC codec for M4A
          "-b:a", `${bitrate}k`,   // Audio bitrate
          "-ac", "2",              // Channels (stereo)
          "-ar", "44100",          // Sample rate
          "-y",                    // Overwrite output files
          outName
        );
      }

      const data = ffmpeg.FS("readFile", outName);
      const blob = new Blob([data.buffer], { type: outputMimeType });

      const url = safeCreateObjectURL(blob);
      setDownloadUrl(url);

      // Clean up
      try { ffmpeg.FS("unlink", inName); } catch { };
      try { ffmpeg.FS("unlink", outName); } catch { };

      setProgress(100);
    } catch (err) {
      toast.error(err?.message || "Audio conversion failed");
      setError(err?.message || "Audio conversion failed. Please try another file.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const toolName = "M4A/MP3 Converter";
  const toolDescription = "Convert between M4A and MP3 audio formats using FFmpeg.wasm. Convert audio directly in your browser without uploading files to a server.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={["Upload audio file (M4A or MP3)", "Select conversion direction and settings", "Convert and download"]}
      faqs={[
        {
          question: "Is my file uploaded to a server?",
          answer: "No — FFmpeg.wasm runs inside your browser so your file never leaves your device."
        },
        {
          question: "What's the difference between M4A and MP3?",
          answer: "Both are audio formats. M4A typically uses AAC encoding which can provide better sound quality at similar file sizes compared to MP3. M4A is commonly used by Apple devices."
        },
        {
          question: "What bitrates are supported?",
          answer: "Common bitrates are 128kbps (good quality), 192kbps (high quality), and 320kbps (near-CD quality). Higher bitrates result in better quality but larger files."
        }
      ]}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'M4A/MP3 Converter', href: '/m4a-mp3-converter' }]}
      currentTool="m4a-mp3-converter"
    >
      <div className="space-y-6">
        <FileDropzone
          accept={ACCEPT}
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload M4A or MP3 file"
          description="Audio files (max 500MB)"
          maxSize={MAX_FILE_SIZE}
        />

        {/* Conversion direction and settings */}
        <div className="p-4 bg-background dark:bg-background rounded-none space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Conversion Direction</label>
              <select
                value={conversionDirection}
                onChange={(e) => setConversionDirection(e.target.value)}
                className="w-full rounded-none border px-3 py-2 text-sm"
              >
                <option value="m4a-to-mp3">M4A to MP3</option>
                <option value="mp3-to-m4a">MP3 to M4A</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Audio Bitrate</label>
              <select
                value={bitrate}
                onChange={(e) => setBitrate(e.target.value)}
                className="w-full rounded-none border px-3 py-2 text-sm"
              >
                <option value="128">128 kbps (Good quality)</option>
                <option value="192">192 kbps (High quality)</option>
                <option value="256">256 kbps (Very high quality)</option>
                <option value="320">320 kbps (Near CD quality)</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}

        <div className="flex gap-3">
          <Button onClick={convertAudio} disabled={!file || isProcessing}>
            {isProcessing ? 'Converting...' : 'Convert Audio'}
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

        {downloadUrl && file && (
          <div className="p-4 bg-muted rounded-none border border-border">
            <p className="font-semibold text-foreground">Audio conversion complete!</p>
            <a
              className="text-primary-foreground underline inline-block mt-2 px-4 py-2 bg-primary rounded-none hover:bg-primary/90 transition-colors"
              href={downloadUrl}
              download={`${file.name.replace(/\.[^/.]+$/, "")}.${conversionDirection === "m4a-to-mp3" ? "mp3" : "m4a"}`}
            >
              Download {conversionDirection === "m4a-to-mp3" ? "MP3" : "M4A"}
            </a>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
