"use client";

import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { loadFfmpegClient } from "@/lib/ffmpegClient";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";

const ACCEPT = ".wav,audio/wav,.mp3,audio/mpeg"; // Accept both WAV and MP3 files
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB guard

export default function WavMp3ConverterClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [conversionDirection, setConversionDirection] = useState("wav-to-mp3");
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
    if (fileExt === 'wav') {
      setConversionDirection("wav-to-mp3");
    } else if (fileExt === 'mp3') {
      setConversionDirection("mp3-to-wav");
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

      if (conversionDirection === "wav-to-mp3") {
        outName = "output.mp3";
        outputMimeType = "audio/mpeg";
      } else {
        outName = "output.wav";
        outputMimeType = "audio/wav";
      }

      // Clean up any previous files
      try { ffmpeg.FS("unlink", inName); } catch { };
      try { ffmpeg.FS("unlink", outName); } catch { };

      // Write input file
      ffmpeg.FS("writeFile", inName, await fetchFile(file));

      // Perform the conversion
      if (conversionDirection === "wav-to-mp3") {
        // Convert WAV to MP3
        await ffmpeg.run(
          "-i", inName,
          "-ab", `${bitrate}k`,     // Audio bitrate
          "-ac", "2",              // Channels (stereo)
          "-ar", "44100",          // Sample rate
          "-y",                    // Overwrite output files
          outName
        );
      } else {
        // Convert MP3 to WAV
        await ffmpeg.run(
          "-i", inName,
          "-acodec", "pcm_s16le",  // PCM signed 16-bit little endian
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
      console.error("Audio conversion failed", err);
      setError(err?.message || "Audio conversion failed. Please try another file.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const toolName = "WAV/MP3 Converter";
  const toolDescription = "Convert between WAV and MP3 audio formats using FFmpeg.wasm. Convert audio directly in your browser without uploading files to a server.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={["Upload audio file (WAV or MP3)", "Select conversion direction and settings", "Convert and download"]}
      faqs={[
        {
          question: "Is my file uploaded to a server?",
          answer: "No — FFmpeg.wasm runs inside your browser so your file never leaves your device."
        },
        {
          question: "What's the difference between WAV and MP3?",
          answer: "WAV files are uncompressed and provide high quality but are large in size. MP3 files are compressed, smaller in size, with slightly reduced quality depending on the bitrate."
        },
        {
          question: "What bitrates are supported for MP3?",
          answer: "Common bitrates are 128kbps (good quality), 192kbps (high quality), and 320kbps (near-CD quality). Higher bitrates result in better quality but larger files."
        }
      ]}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'WAV/MP3 Converter', href: '/wav-mp3-converter' }]}
      currentTool="wav-mp3-converter"
    >
      <div className="space-y-6">
        <FileDropzone
          accept={ACCEPT}
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload WAV or MP3 file"
          description="Audio files (max 500MB)"
          maxSize={MAX_FILE_SIZE}
        />

        {/* Conversion direction and settings */}
        <div className="p-4 bg-background dark:bg-background space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Conversion Direction</label>
              <select
                value={conversionDirection}
                onChange={(e) => setConversionDirection(e.target.value)}
                className="w-full border px-3 py-2 text-sm"
              >
                <option value="wav-to-mp3">WAV to MP3</option>
                <option value="mp3-to-wav">MP3 to WAV</option>
              </select>
            </div>

            {conversionDirection === "wav-to-mp3" && (
              <div>
                <label className="block text-sm font-medium mb-2">MP3 Bitrate</label>
                <select
                  value={bitrate}
                  onChange={(e) => setBitrate(e.target.value)}
                  className="w-full border px-3 py-2 text-sm"
                >
                  <option value="128">128 kbps (Good quality)</option>
                  <option value="192">192 kbps (High quality)</option>
                  <option value="256">256 kbps (Very high quality)</option>
                  <option value="320">320 kbps (Near CD quality)</option>
                </select>
              </div>
            )}
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
          <div className="p-4 bg-green-50 rounded-none border border-green-200">
            <p className="font-semibold text-green-800">Audio conversion complete!</p>
            <a
              className="text-blue-600 underline inline-block mt-2 px-4 py-2 bg-blue-100 rounded-none hover:bg-blue-200 transition-colors"
              href={downloadUrl}
              download={`${file.name.replace(/\.[^/.]+$/, "")}.${conversionDirection === "wav-to-mp3" ? "mp3" : "wav"}`}
            >
              Download {conversionDirection === "wav-to-mp3" ? "MP3" : "WAV"}
            </a>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
