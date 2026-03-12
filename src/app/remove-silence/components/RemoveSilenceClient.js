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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ACCEPT = ".mp3,audio/mpeg,.wav,audio/wav,.m4a,audio/mp4,.flac,audio/flac"; // Accept common audio formats
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB guard

export default function RemoveSilenceClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [silenceThreshold, setSilenceThreshold] = useState(-40); // dB threshold (negative)
  const [silenceDuration, setSilenceDuration] = useState(0.5); // Minimum duration in seconds
  const [outputFormat, setOutputFormat] = useState("mp3");

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

  const removeSilence = async () => {
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

      // FFmpeg command to remove silence using the silenceremove filter
      // This filter detects silence and removes it based on threshold and duration
      await ffmpeg.run(
        "-i", inName,
        "-af", `silenceremove=start_threshold=${silenceThreshold}dB:start_duration=${silenceDuration}:detection=peak,silenceremove=end_threshold=${silenceThreshold}dB:end_duration=${silenceDuration}:detection=peak`,
        "-c:a", "copy",  // Copy audio codec if possible
        "-y",             // Overwrite output files
        outName
      );

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
      toast.error(err?.message || "Failed to remove silence");
      setError(err?.message || "Failed to remove silence. Please try another file with different settings.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const toolName = "Remove Silence";
  const toolDescription = "Remove silence from audio files to create more compact recordings. Remove dead air and pauses while preserving spoken content.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={["Upload audio file", "Adjust silence detection settings", "Remove silence and download"]}
      faqs={[
        {
          question: "Is my file uploaded to a server?",
          answer: "No — FFmpeg.wasm runs inside your browser so your file never leaves your device."
        },
        {
          question: "How does silence detection work?",
          answer: "Silence detection uses a threshold in decibels (dB) to identify quiet sections. Sections below this threshold lasting at least the minimum duration will be removed."
        },
        {
          question: "What are the recommended settings?",
          answer: "A threshold of -40dB and duration of 0.5s works well for most speech recordings. Lower values (e.g., -50dB) detect more subtle silence."
        }
      ]}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Remove Silence', href: '/remove-silence' }]}
      currentTool="remove-silence"
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

        {/* Silence removal settings */}
        <div className="p-4 bg-background dark:bg-background rounded-none space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="silenceThreshold" className="block text-sm font-medium mb-2">Silence Threshold (dB)</Label>
              <Input
                id="silenceThreshold"
                type="number"
                min="-100"
                max="-1"
                value={silenceThreshold}
                onChange={(e) => setSilenceThreshold(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-foreground mt-1">Below this level is considered silence</p>
            </div>

            <div>
              <Label htmlFor="silenceDuration" className="block text-sm font-medium mb-2">Min Duration (seconds)</Label>
              <Input
                id="silenceDuration"
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={silenceDuration}
                onChange={(e) => setSilenceDuration(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-foreground mt-1">Minimum length of silence to remove</p>
            </div>

            <div>
              <Label htmlFor="outputFormat" className="block text-sm font-medium mb-2">Output Format</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger id="outputFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="wav">WAV</SelectItem>
                  <SelectItem value="m4a">M4A</SelectItem>
                  <SelectItem value="flac">FLAC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}

        <div className="flex gap-3">
          <Button onClick={removeSilence} disabled={!file || isProcessing}>
            {isProcessing ? 'Removing silence...' : 'Remove Silence'}
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
            <p className="font-semibold text-foreground">Silence removal complete!</p>
            <a
              className="text-primary-foreground underline inline-block mt-2 px-4 py-2 bg-primary rounded-none hover:bg-primary/90 transition-colors"
              href={downloadUrl}
              download={`${file.name.replace(/\.[^/.]+$/, "")}_no_silence.${outputFormat}`}
            >
              Download Audio (No Silence)
            </a>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
