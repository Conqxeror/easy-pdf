"use client";

import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { loadFfmpegClient } from "@/lib/ffmpegClient";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const ACCEPT = ".mp3,audio/mpeg,.wav,audio/wav,.m4a,audio/mp4,.flac,audio/flac"; // Accept common audio formats
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB guard

export default function AudioSpeedChangerClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [speed, setSpeed] = useState(1.0); // Default to 1.0x speed
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

  const changeSpeed = async () => {
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

      // Use the atempo filter to change speed
      // The atempo filter accepts values between 0.5 (half speed) and 2.0 (double speed)
      let tempoFilters = [];

      // FFmpeg's atempo filter only supports 0.5 to 2.0, so we need to chain filters if needed
      if (speed < 0.5) {
        // For speeds < 0.5, we need to slow down gradually
        // Chain multiple atempo filters, each slowing by a maximum factor
        let remainingSpeed = speed;
        while (remainingSpeed < 0.5) {
          tempoFilters.push("atempo=0.5");
          remainingSpeed /= 0.5;
        }
        if (remainingSpeed <= 2.0) {
          tempoFilters.push(`atempo=${remainingSpeed}`);
        }
      } else if (speed > 2.0) {
        // For speeds > 2.0, we need to speed up gradually
        // Chain multiple atempo filters, each speeding by a maximum factor
        let remainingSpeed = speed;
        while (remainingSpeed > 2.0) {
          tempoFilters.push("atempo=2.0");
          remainingSpeed /= 2.0;
        }
        if (remainingSpeed >= 0.5) {
          tempoFilters.push(`atempo=${remainingSpeed}`);
        }
      } else {
        // For speeds between 0.5 and 2.0, just use one filter
        tempoFilters.push(`atempo=${speed}`);
      }

      const filterChain = tempoFilters.join(',');

      // Apply the speed change using FFmpeg
      await ffmpeg.run(
        "-i", inName,
        "-af", filterChain,  // Apply the atempo filter chain
        "-c:a", "copy",      // Copy audio codec if possible, otherwise use defaults
        "-y",                // Overwrite output files
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
      console.error("Change audio speed failed", err);
      setError(err?.message || "Failed to change audio speed. Please try another file with different settings.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const toolName = "Audio Speed Changer";
  const toolDescription = "Change the playback speed of audio files while maintaining pitch. Make podcasts, audiobooks, or lectures faster or slower to suit your listening preferences.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={["Upload audio file", "Adjust speed settings", "Change speed and download"]}
      faqs={[
        {
          question: "Is my file uploaded to a server?",
          answer: "No — FFmpeg.wasm runs inside your browser so your file never leaves your device."
        },
        {
          question: "What speed ranges are supported?",
          answer: "You can adjust the speed from 0.25x (quarter speed) to 4x (four times faster) while maintaining audio pitch."
        },
        {
          question: "How does speed change affect audio quality?",
          answer: "Modern algorithms maintain audio quality during speed changes with minimal degradation. Very slow speeds (below 0.5x) may have more noticeable artifacts."
        }
      ]}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Audio Speed Changer', href: '/audio-speed-changer' }]}
      currentTool="audio-speed-changer"
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

        {/* Speed adjustment settings */}
        <div className="p-4 bg-background dark:bg-background rounded-none space-y-6">
          <div>
            <Label htmlFor="speedSlider" className="block text-sm font-medium mb-2">
              Playback Speed: {speed.toFixed(2)}x
            </Label>
            <Slider
              id="speedSlider"
              min={0.25}
              max={4.0}
              step={0.05}
              value={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-foreground mt-1">
              <span>0.25x</span>
              <span>1x (Normal)</span>
              <span>4x</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="speedInput" className="block text-sm font-medium mb-2">Speed Factor</Label>
              <Input
                id="speedInput"
                type="number"
                min="0.25"
                max="4.0"
                step="0.05"
                value={speed}
                onChange={(e) => setSpeed(Math.min(4.0, Math.max(0.25, parseFloat(e.target.value) || 1.0)))}
                className="w-full"
              />
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
          <Button onClick={changeSpeed} disabled={!file || isProcessing}>
            {isProcessing ? 'Changing speed...' : 'Change Speed'}
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
            <p className="font-semibold text-green-800">Audio speed change complete!</p>
            <a
              className="text-blue-600 underline inline-block mt-2 px-4 py-2 bg-blue-100 rounded-none hover:bg-blue-200 transition-colors"
              href={downloadUrl}
              download={`${file.name.replace(/\.[^/.]+$/, "")}_speed_${speed.toFixed(2)}x.${outputFormat}`}
            >
              Download {outputFormat.toUpperCase()} ({speed.toFixed(2)}x)
            </a>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
