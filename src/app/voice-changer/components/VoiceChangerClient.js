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

export default function VoiceChangerClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [pitch, setPitch] = useState(0); // Pitch shift in semitones (-12 to 12)
  const [speed, setSpeed] = useState(1.0); // Speed factor (0.5 to 2.0)
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

  const changeVoice = async () => {
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

      // Prepare the pitch and speed filters
      // The rubberband filter can change both pitch and tempo in one pass
      // Format: rubberband=pitch:semitones:tempo:factor
      const rubberbandFilter = `rubberband=pitch=${(1 + pitch / 12).toFixed(2)}:tempo=${speed.toFixed(2)}`;

      // Apply the voice change using FFmpeg
      await ffmpeg.run(
        "-i", inName,
        "-af", rubberbandFilter,  // Apply the rubberband filter
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
      console.error("Voice change failed", err);
      setError(err?.message || "Failed to change voice. Please try another file with different settings. Note that some audio files may not support all effects.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const toolName = "Voice Changer";
  const toolDescription = "Change pitch and speed of audio files to create different voice effects. Perfect for changing voice characteristics while maintaining audio quality.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle={toolDescription}
      toolName={toolName}
      toolDescription={toolDescription}
      steps={["Upload audio file", "Adjust pitch and speed settings", "Apply voice change and download"]}
      faqs={[
        {
          question: "Is my file uploaded to a server?",
          answer: "No — FFmpeg.wasm runs inside your browser so your file never leaves your device."
        },
        {
          question: "What pitch ranges are supported?",
          answer: "You can adjust pitch from -12 semitones (lower) to +12 semitones (higher). Zero means no pitch change."
        },
        {
          question: "What speed ranges are supported?",
          answer: "You can adjust playback speed from 0.5x (half speed) to 2.0x (double speed)."
        }
      ]}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Voice Changer', href: '/voice-changer' }]}
      currentTool="voice-changer"
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

        {/* Voice change settings */}
        <div className="p-4 bg-background dark:bg-background space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="pitchSlider" className="block text-sm font-medium mb-2">
                Pitch Change: {pitch} semitones
              </Label>
              <Slider
                id="pitchSlider"
                min={-12}
                max={12}
                step={1}
                value={[pitch]}
                onValueChange={(value) => setPitch(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-foreground mt-1">
                <span>-12 (Lower)</span>
                <span>0 (Normal)</span>
                <span>+12 (Higher)</span>
              </div>
            </div>

            <div>
              <Label htmlFor="speedSlider" className="block text-sm font-medium mb-2">
                Speed Change: {speed.toFixed(2)}x
              </Label>
              <Slider
                id="speedSlider"
                min={0.5}
                max={2.0}
                step={0.05}
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-foreground mt-1">
                <span>0.5x (Slower)</span>
                <span>1x (Normal)</span>
                <span>2x (Faster)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pitchInput" className="block text-sm font-medium mb-2">Pitch (Semitones)</Label>
              <Input
                id="pitchInput"
                type="number"
                min="-12"
                max="12"
                value={pitch}
                onChange={(e) => setPitch(Math.min(12, Math.max(-12, parseInt(e.target.value) || 0)))}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="speedInput" className="block text-sm font-medium mb-2">Speed Factor</Label>
              <Input
                id="speedInput"
                type="number"
                min="0.5"
                max="2.0"
                step="0.05"
                value={speed}
                onChange={(e) => setSpeed(Math.min(2.0, Math.max(0.5, parseFloat(e.target.value) || 1.0)))}
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
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
          <Button onClick={changeVoice} disabled={!file || isProcessing}>
            {isProcessing ? 'Changing voice...' : 'Change Voice'}
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
            <p className="font-semibold text-green-800">Voice change complete!</p>
            <a
              className="text-blue-600 underline inline-block mt-2 px-4 py-2 bg-blue-100 rounded-none hover:bg-blue-200 transition-colors"
              href={downloadUrl}
              download={`${file.name.replace(/\.[^/.]+$/, "")}_voice_changed.${outputFormat}`}
            >
              Download {outputFormat.toUpperCase()} (Pitch: {pitch}, Speed: {speed.toFixed(2)}x)
            </a>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
