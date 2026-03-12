"use client";

import React, { useState, useEffect, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { toast } from "sonner";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { loadFfmpegClient } from "@/lib/ffmpegClient";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";

const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/x-matroska",
  "video/quicktime",
];

const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024; // 200MB client-side cap

export default function Mp4ToMp3Client() {
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [outputFileName, setOutputFileName] = useState("");

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        try { safeRevokeObjectURL(downloadUrl); } catch { /* ignore */ }
      }
    };
  }, [downloadUrl]);

  const formatFileSize = useCallback((bytes) => {
    if (!bytes && bytes !== 0) return "-";
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }, []);

  const handleFiles = useCallback((files) => {
    setError("");
    if (!files || files.length === 0) {
      setVideoFile(null);
      return;
    }

    const selected = files[0];
    if (!ACCEPTED_VIDEO_TYPES.includes(selected.type)) {
      setError("Unsupported video format. Please upload MP4, WebM, OGG, MKV, or MOV files.");
      setVideoFile(null);
      return;
    }

    if (selected.size > MAX_VIDEO_SIZE_BYTES) {
      setError("File too large. Please keep uploads under 200MB for in-browser processing.");
      setVideoFile(null);
      return;
    }

    if (downloadUrl) {
      try { safeRevokeObjectURL(downloadUrl); } catch { /* ignore */ }
      setDownloadUrl(null);
      setOutputFileName("");
    }

    setVideoFile(selected);
  }, [downloadUrl]);

  const convertToMp3 = async () => {
    if (!videoFile) {
      setError("Please upload a video file first.");
      return;
    }

    setIsProcessing(true);
    setProcessingMessage(ffmpegReady ? "Preparing conversion..." : "Loading FFmpeg core (~27 MB) ...");
    setCurrentProgress(0);
    setError("");

    try {
      const { ffmpeg, fetchFile } = await loadFfmpegClient();
      setFfmpegReady(true);

      ffmpeg.setProgress(({ ratio }) => {
        if (typeof ratio === "number" && !Number.isNaN(ratio)) {
          setCurrentProgress(Math.min(99, Math.round(ratio * 100)));
        }
      });

      ffmpeg.setLogger(({ message }) => {
        if (!message) return;
        if (message.toLowerCase().includes("error")) {
          setProcessingMessage("FFmpeg reported an issue. Retrying may help.");
        } else if (message.includes("Opening")) {
          setProcessingMessage("Decoding source video...");
        } else if (message.includes("frame")) {
          setProcessingMessage("Extracting audio...");
        }
      });

      const inputName = "input-video";
      const outputName = "output-audio.mp3";

      try { ffmpeg.FS("unlink", inputName); } catch { /* ignore */ }
      try { ffmpeg.FS("unlink", outputName); } catch { /* ignore */ }

      ffmpeg.FS("writeFile", inputName, await fetchFile(videoFile));

      await ffmpeg.run(
        "-i", inputName,
        "-vn",
        "-acodec", "libmp3lame",
        "-b:a", "192k",
        outputName
      );

      const data = ffmpeg.FS("readFile", outputName);
      const blob = new Blob([data.buffer], { type: "audio/mpeg" });

      const sanitizedBase = sanitizeFileName(videoFile.name?.replace(/\.[^/.]+$/, "")) || "converted-audio";
      const finalName = `${sanitizedBase}.mp3`;
      const newUrl = safeCreateObjectURL(blob);

      setDownloadUrl((prev) => {
        if (prev && prev !== newUrl) {
          try { safeRevokeObjectURL(prev); } catch { /* ignore */ }
        }
        return newUrl;
      });
      setOutputFileName(finalName);
      setProcessingMessage("Conversion complete!");
      setCurrentProgress(100);

      try { ffmpeg.FS("unlink", inputName); } catch { /* ignore */ }
      try { ffmpeg.FS("unlink", outputName); } catch { /* ignore */ }
    } catch (conversionError) {
      toast.error(conversionError?.message || "MP4 to MP3 conversion failed");
      setError(conversionError?.message || "Failed to convert video. Please try a different file.");
      setProcessingMessage("Conversion failed.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setCurrentProgress(0), 1500);
    }
  };

  const toolName = "MP4 to MP3 Converter";
  const toolDescription = "Extract high-quality MP3 audio from your MP4, WebM, or MOV videos directly in the browser. No uploads, no wait times, and everything stays on your device.";

  const steps = [
    "Upload your MP4 (or compatible video) by dragging it into the dropzone.",
    "Click 'Convert to MP3' to load FFmpeg and extract the audio track.",
    "Download the MP3 file instantly once processing completes.",
  ];

  const faqs = [
    {
      question: "Is there a file size limit?",
      answer: "For stability, in-browser conversions are capped at 200MB per video. Larger files may exhaust memory on low-end devices.",
    },
    {
      question: "Do my videos get uploaded?",
      answer: "No. Every step of the conversion runs locally using ffmpeg.wasm, so your media never leaves the browser.",
    },
    {
      question: "What audio bitrate do you use?",
      answer: "We export at 192 kbps using the LAME encoder, which balances quality and file size for most voice and music tracks in the current browser-based workflow.",
    },
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Convert MP4 and other videos to MP3 purely in the browser using ffmpeg.wasm."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "MP4 to MP3", href: "/mp4-to-mp3" },
      ]}
      currentTool="mp4-to-mp3"
    >
      <div className="space-y-6">
        <Alert variant="info">
          <AlertTitle>Runs offline in your browser</AlertTitle>
          <AlertDescription>
            The first conversion downloads the FFmpeg WebAssembly core (~27 MB). Subsequent runs are instant because the binary stays cached locally.
          </AlertDescription>
        </Alert>

        <FileDropzone
          accept={ACCEPTED_VIDEO_TYPES.join(",")}
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Choose a video file"
          description="Drag & drop or click to upload MP4, WebM, OGG, MKV, or MOV files (max 200MB)"
          maxSize={MAX_VIDEO_SIZE_BYTES}
          isLoading={isProcessing}
        />

        {videoFile && (
          <div className="p-4 border border-border rounded-none bg-background shadow-sm dark:bg-background/40 dark:border-border">
            <h3 className="text-lg font-semibold mb-2">Selected file</h3>
            <p className="text-sm text-foreground dark:text-foreground"><strong>Name:</strong> {videoFile.name}</p>
            <p className="text-sm text-foreground dark:text-foreground"><strong>Size:</strong> {formatFileSize(videoFile.size)}</p>
            <p className="text-sm text-foreground dark:text-foreground"><strong>Type:</strong> {videoFile.type || "Unknown"}</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Conversion failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-foreground dark:text-foreground">
              <span>{processingMessage || "Initializing FFmpeg..."}</span>
              <span>{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>
        )}

        <div className="flex justify-center">
          <Button
            onClick={convertToMp3}
            disabled={isProcessing || !videoFile}
            size="lg"
          >
            {isProcessing ? "Converting..." : "Convert to MP3"}
          </Button>
        </div>

        {downloadUrl && (
          <div className="p-6 bg-muted border border-border rounded-none space-y-4">
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-200">Conversion complete!</h3>
            <p className="text-sm text-foreground">
              Your MP3 is ready. Click the button below to save it. We automatically clean up temporary files for you.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="success" size="lg">
                <a
                  href={downloadUrl}
                  download={outputFileName || "converted-audio.mp3"}
                  className="flex items-center"
                >
                  Download {outputFileName || "MP3"}
                </a>
              </Button>
              <p className="text-sm text-foreground dark:text-foreground">{outputFileName}</p>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
