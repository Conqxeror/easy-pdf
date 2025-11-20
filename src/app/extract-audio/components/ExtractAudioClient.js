"use client";

import React, { useState, useEffect } from "react";
import { loadFfmpegClient } from '@/lib/ffmpegClient';
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Music, Video } from "lucide-react";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";

export default function ExtractAudioClient() {
  const [ffmpeg, setFfmpeg] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [file, setFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const { ffmpeg } = await loadFfmpegClient();
        ffmpeg.on('log', ({ message }) => {
          setLogs((prev) => [...prev.slice(-4), message]);
        });
        setFfmpeg(ffmpeg);
        setIsReady(true);
      } catch (err) {
        console.error("FFmpeg load error:", err);
        setError("Failed to load audio processing engine. Please try a different browser (Chrome/Edge recommended).");
      }
    };

    loadFFmpeg();
  }, []);

  useEffect(() => {
    return () => {
      if (resultUrl) safeRevokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFile = (files) => {
    if (files && files.length > 0) {
      setFile(files[0]);
      setError("");
      setResultUrl(null);
      setProgress(0);
    }
  };

  const extractAudio = async () => {
    if (!file || !ffmpeg || !isReady) return;

    setIsProcessing(true);
    setProgress(0);
    setError("");
    setLogs([]);

    try {
      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = `output.${outputFormat}`;

      const { fetchFile } = await loadFfmpegClient();
      ffmpeg.FS("writeFile", inputName, await fetchFile(file));

      ffmpeg.setProgress(({ ratio }) => {
        setProgress(Math.round(ratio * 100));
      });

      // Basic extraction command
      // -i input -vn (no video) -acodec (codec based on format) output
      let args = ["-i", inputName, "-vn"];

      if (outputFormat === "mp3") {
        args.push("-acodec", "libmp3lame", "-q:a", "2");
      } else if (outputFormat === "aac") {
        args.push("-acodec", "aac", "-b:a", "192k");
      } else if (outputFormat === "wav") {
        args.push("-acodec", "pcm_s16le");
      } else if (outputFormat === "ogg") {
        args.push("-acodec", "libvorbis");
      }

      args.push(outputName);

      await ffmpeg.run(...args);

      const data = ffmpeg.FS("readFile", outputName);
      const blob = new Blob([data.buffer], { type: `audio/${outputFormat}` });
      const url = safeCreateObjectURL(blob);

      setResultUrl(url);
      setProgress(100);

      // Cleanup
      ffmpeg.FS("unlink", inputName);
      ffmpeg.FS("unlink", outputName);

    } catch (err) {
      console.error("Extraction error:", err);
      setError("Failed to extract audio. The file might be corrupt or the format unsupported.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toolName = "Video to Audio Extractor";
  const toolDescription = "Extract high-quality audio from video files directly in your browser. Supports MP4, AVI, MOV, MKV to MP3, AAC, WAV, and OGG.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Turn your videos into audio files instantly. Private, fast, and free."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={[
        "Upload a video file (MP4, MKV, AVI, MOV, etc).",
        "Choose your desired audio format (MP3, AAC, WAV, OGG).",
        "Click 'Extract Audio' and wait for the process to finish.",
        "Download your new audio file."
      ]}
      faqs={[
        {
          question: "Is my video uploaded to a server?",
          answer: "No. We use WebAssembly (FFmpeg.wasm) to process your video directly inside your browser. It never leaves your device."
        },
        {
          question: "What formats are supported?",
          answer: "Input: Most common video formats (MP4, MOV, AVI, MKV, WEBM). Output: MP3, AAC, WAV, OGG."
        },
        {
          question: "Why is it taking a while?",
          answer: "Processing video in the browser is resource-intensive. Large files will take longer to process than small ones."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Extract Audio", href: "/extract-audio" },
      ]}
      currentTool="extract-audio"
    >
      <div className="space-y-6">
        {!isReady && !error && (
          <div className="text-center p-8 bg-background dark:bg-background rounded-none">
            <p className="animate-pulse">Loading audio engine...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isReady && (
          <>
            <FileDropzone
              accept="video/*"
              onFiles={handleFile}
              label="Upload Video"
              description="Drag & drop a video file here (MP4, MOV, AVI, etc)"
              isLoading={isProcessing}
            />

            {file && (
              <div className="bg-background dark:bg-background border border-border dark:border-border rounded-none p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-none">
                    <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                  <div className="w-full sm:w-48">
                    <label className="text-sm font-medium mb-1 block">Output Format</label>
                    <Select value={outputFormat} onValueChange={setOutputFormat} disabled={isProcessing}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp3">MP3 (Universal)</SelectItem>
                        <SelectItem value="aac">AAC (High Quality)</SelectItem>
                        <SelectItem value="wav">WAV (Lossless)</SelectItem>
                        <SelectItem value="ogg">OGG (Open Source)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={extractAudio}
                    disabled={isProcessing}
                    className="w-full sm:w-auto"
                    size="lg"
                  >
                    {isProcessing ? "Extracting..." : "Extract Audio"}
                  </Button>
                </div>

                {(isProcessing || progress > 0) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-foreground font-mono truncate">
                      {logs[logs.length - 1] || "Initializing..."}
                    </p>
                  </div>
                )}

                {resultUrl && (
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-none">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-none">
                        <Music className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Extraction Complete!</p>
                        <p className="text-sm text-green-700 dark:text-green-300">Ready to download</p>
                      </div>
                    </div>
                    <Button asChild variant="success">
                      <a href={resultUrl} download={`extracted-audio.${outputFormat}`}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
