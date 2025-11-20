"use client";

import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { loadFfmpegClient } from "@/lib/ffmpegClient";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ACCEPT = ".mp3,audio/mpeg,.wav,audio/wav,.m4a,audio/mp4,.flac,audio/flac"; // Accept common audio formats
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB guard

export default function AudioCompressorClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState("medium"); // low, medium, high
  const [outputFormat, setOutputFormat] = useState("mp3"); // mp3, m4a, flac

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

  const compressAudio = async () => {
    if (!file) { setError("Please upload an audio file first."); return; }

    setIsProcessing(true);
    setProgress(5);
    setError("");

    try {
      const { ffmpeg, fetchFile } = await loadFfmpegClient();

      ffmpeg.setProgress(({ ratio }) => {
        setProgress(Math.min(100, Math.round(ratio * 100)));
      });

      const inName = "input_audio";
      const outName = `output.${outputFormat}`;

      // Clean up any previous files
      try { ffmpeg.FS("unlink", inName); } catch { };
      try { ffmpeg.FS("unlink", outName); } catch { };

      // Write input file
      ffmpeg.FS("writeFile", inName, await fetchFile(file));

      // Set compression parameters based on level
      let bitrate = "128k";
      let quality = 5; // Default medium quality

      switch (compressionLevel) {
        case "low": // Low compression (better quality)
          bitrate = outputFormat === "flac" ? "lossless" : "320k";
          quality = outputFormat === "mp3" ? 0 : 2; // 0=best for MP3, 2=high for AAC
          break;
        case "medium": // Medium compression
          bitrate = outputFormat === "flac" ? "lossless" : "192k";
          quality = outputFormat === "mp3" ? 2 : 4; // 2=good for MP3, 4=medium for AAC
          break;
        case "high": // High compression (smaller file)
          bitrate = outputFormat === "flac" ? "lossless" : "128k";
          quality = outputFormat === "mp3" ? 5 : 7; // 5=standard for MP3, 7=fast for AAC
          break;
        default:
          bitrate = outputFormat === "flac" ? "lossless" : "192k";
          quality = outputFormat === "mp3" ? 2 : 4;
      }

      // Apply compression based on output format
      let params = ["-i", inName];

      if (outputFormat === "mp3") {
        params = params.concat([
          "-b:a", bitrate,      // Audio bitrate
          "-q:a", quality.toString(),  // Quality (0-9 for MP3, 0=best)
          "-y",                 // Overwrite output files
          outName
        ]);
      } else if (outputFormat === "m4a") {
        params = params.concat([
          "-c:a", "aac",       // AAC codec for M4A
          "-b:a", bitrate,     // Audio bitrate
          "-cutoff", "20000",  // Cutoff frequency for AAC
          "-y",                // Overwrite output files
          outName
        ]);
      } else if (outputFormat === "flac") {
        params = params.concat([
          "-c:a", "flac",      // FLAC codec
          "-compression_level", quality.toString(), // Compression level (0-12)
          "-y",                // Overwrite output files
          outName
        ]);
      } else { // Keep MP3 as default
        params = params.concat([
          "-b:a", bitrate,
          "-q:a", quality.toString(),
          "-y",
          outName
        ]);
      }

      await ffmpeg.run(...params);

      const data = ffmpeg.FS("readFile", outName);
      let mimeType = "audio/mpeg";
      if (outputFormat === "m4a") mimeType = "audio/mp4";
      if (outputFormat === "flac") mimeType = "audio/flac";
      if (outputFormat === "wav") mimeType = "audio/wav";

      const blob = new Blob([data.buffer], { type: mimeType });

      const url = safeCreateObjectURL(blob);
      setDownloadUrl(url);

      // Clean up
      try { ffmpeg.FS("unlink", inName); } catch { };
      try { ffmpeg.FS("unlink", outName); } catch { };

      setProgress(100);
    } catch (err) {
      console.error("Audio compression failed", err);
      setError(err?.message || "Audio compression failed. Please try another file.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const toolName = "Audio Compressor";
  const toolDescription = "Compress audio files with adjustable compression levels. Reduce file size while maintaining acceptable quality for various use cases.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={["Upload audio file", "Select compression level and format", "Compress and download"]}
      faqs={[
        {
          question: "Is my file uploaded to a server?",
          answer: "No — FFmpeg.wasm runs inside your browser so your file never leaves your device."
        },
        {
          question: "What compression levels are available?",
          answer: "Low compression maintains highest quality with larger file size, Medium provides balanced quality and size, and High compression maximizes file size reduction with lowest quality."
        },
        {
          question: "What audio formats can I compress to?",
          answer: "You can compress to MP3, M4A, or FLAC formats depending on your quality and file size requirements."
        }
      ]}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Audio Compressor', href: '/audio-compressor' }]}
      currentTool="audio-compressor"
    >
      <div className="space-y-6">
        <FileDropzone
          accept={ACCEPT}
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload audio file"
          description="MP3, WAV, M4A, FLAC (max 500MB)"
          maxSize={MAX_FILE_SIZE}
        />

        {/* Compression options */}
        <div className="p-4 bg-background dark:bg-background rounded-none space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="compressionLevel" className="block text-sm font-medium mb-2">Compression Level</Label>
              <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                <SelectTrigger id="compressionLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Better Quality)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="high">High (Smaller File)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-foreground mt-1">
                {compressionLevel === "low" && "Preserves most audio quality, larger file size"}
                {compressionLevel === "medium" && "Good balance between quality and file size"}
                {compressionLevel === "high" && "Maximizes compression, smallest file size"}
              </p>
            </div>

            <div>
              <Label htmlFor="outputFormat" className="block text-sm font-medium mb-2">Output Format</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger id="outputFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3 (Widely Compatible)</SelectItem>
                  <SelectItem value="m4a">M4A (Apple Ecosystem)</SelectItem>
                  <SelectItem value="flac">FLAC (Lossless)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}

        <div className="flex gap-3">
          <Button onClick={compressAudio} disabled={!file || isProcessing}>
            {isProcessing ? 'Compressing...' : 'Compress Audio'}
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
            <p className="font-semibold text-green-800">Audio compression complete!</p>
            <a
              className="text-blue-600 underline inline-block mt-2 px-4 py-2 bg-blue-100 rounded-none hover:bg-blue-200 transition-colors"
              href={downloadUrl}
              download={`${file.name.replace(/\.[^/.]+$/, "")}_compressed.${outputFormat}`}
            >
              Download {outputFormat.toUpperCase()}
            </a>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
