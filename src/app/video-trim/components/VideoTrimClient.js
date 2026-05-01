"use client";

import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { loadFfmpegClient } from "@/lib/ffmpegClient";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import { toast } from "sonner";

const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB

function formatSeconds(input) {
  if (!input && input !== 0) return "";
  if (typeof input === "number") return String(input);
  // accept hh:mm:ss or seconds
  if (input.includes(":")) return input;
  return String(input);
}

export default function VideoTrimClient() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadName, setDownloadName] = useState("");
  const [previewIndex, setPreviewIndex] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [videoEl, setVideoEl] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [isGeneratingThumbs, setIsGeneratingThumbs] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [markerStart, setMarkerStart] = useState(0);
  const [markerEnd, setMarkerEnd] = useState(0);
  const [dragging, setDragging] = useState(null); // 'start' | 'end' | null
  const [waveform, setWaveform] = useState(null);
  const waveformCanvasRef = React.useRef(null);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapThreshold, setSnapThreshold] = useState(0.5); // seconds, user-adjustable
  const [snapMessage, setSnapMessage] = useState("");
  const [lastSnappedTime, setLastSnappedTime] = useState(null);
  const [zoomFactor, setZoomFactor] = useState(1);
  const [zoomOffset, setZoomOffset] = useState(0); // fraction 0..1 of which part to show
  const appliedFakeThumbsRef = React.useRef(false);
  // accessibility: which marker has keyboard focus (future use)

  useEffect(() => {
    return () => {
      if (downloadUrl) try { safeRevokeObjectURL(downloadUrl); } catch { }
    };
  }, [downloadUrl]);

  const onFiles = (incoming) => {
    setError("");
    if (!incoming || incoming.length === 0) {
      setFiles([]);
      return;
    }
    const prepared = Array.from(incoming).map((f, index) => ({ id: `${f.name}-${f.size}-${f.lastModified}-${index}`, file: f, start: "0", end: "", status: "pending" }));
    setFiles(prepared);
    setPreviewIndex(null);
    if (previewUrl) {
      try { safeRevokeObjectURL(previewUrl); } catch { }
      setPreviewUrl(null);
    }
  };

  const updateEntry = (id, patch) => {
    setFiles((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));
  };

  const openPreview = (index) => {
    const entry = files[index];
    if (!entry) return;
    // revoke any previous preview url
    if (previewUrl) {
      try { safeRevokeObjectURL(previewUrl); } catch { }
    }
    const url = safeCreateObjectURL(entry.file);
    setPreviewUrl(url);
    setPreviewIndex(index);
    // initialize markers to current entry values (if present)
    setMarkerStart(Number(entry.start || 0) || 0);
    setMarkerEnd(Number(entry.end || 0) || 0);
  };

  const closePreview = () => {
    setPreviewIndex(null);
    if (previewUrl) {
      try { safeRevokeObjectURL(previewUrl); } catch { }
      setPreviewUrl(null);
    }
    setVideoEl(null);
    setWaveform(null);
  };

  const loadTestThumbnails = React.useCallback((thumbs) => {
    try {
      setThumbnails(thumbs);
      setPreviewIndex(0);
      const blob = new Blob([], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl((previousUrl) => {
        if (previousUrl) {
          try { safeRevokeObjectURL(previousUrl); } catch { }
        }
        return url;
      });
    } catch (err) {
      console.warn("E2E loadThumbs failed", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.__E2E_EXPOSE) window.__E2E_EXPOSE = {};
    const setLastSnappedTimeHook = (time) => setLastSnappedTime(time);
    window.__E2E_EXPOSE.setLastSnappedTime = setLastSnappedTimeHook;
    window.__E2E_EXPOSE.loadThumbs = loadTestThumbnails;

    return () => {
      if (window.__E2E_EXPOSE?.setLastSnappedTime === setLastSnappedTimeHook) {
        delete window.__E2E_EXPOSE.setLastSnappedTime;
      }
      if (window.__E2E_EXPOSE?.loadThumbs === loadTestThumbnails) {
        delete window.__E2E_EXPOSE.loadThumbs;
      }
    };
  }, [loadTestThumbnails]);


  const setStartFromCurrent = () => {
    if (previewIndex == null || !videoEl) return;
    const t = Number(videoEl.currentTime.toFixed(2));
    // snapping
    let snapTime = t;
    if (snapEnabled && thumbnails && thumbnails.length) {
      let best = thumbnails[0];
      let bestDiff = Math.abs(t - best.time);
      for (let i = 1; i < thumbnails.length; i++) {
        const d = Math.abs(t - thumbnails[i].time);
        if (d < bestDiff) { best = thumbnails[i]; bestDiff = d; }
      }
      const SNAP_THRESHOLD = Math.min(1.0, (videoEl?.duration || 10) / 50);
      if (bestDiff <= SNAP_THRESHOLD) snapTime = best.time;
    }
    updateEntry(files[previewIndex].id, { start: String(snapTime.toFixed(2)) });
    setMarkerStart(snapTime);
  };

  const setEndFromCurrent = () => {
    if (previewIndex == null || !videoEl) return;
    const t = Number(videoEl.currentTime.toFixed(2));
    // snapping
    let snapTime2 = t;
    if (snapEnabled && thumbnails && thumbnails.length) {
      let best = thumbnails[0];
      let bestDiff = Math.abs(t - best.time);
      for (let i = 1; i < thumbnails.length; i++) {
        const d = Math.abs(t - thumbnails[i].time);
        if (d < bestDiff) { best = thumbnails[i]; bestDiff = d; }
      }
      const SNAP_THRESHOLD = Math.min(1.0, (videoEl?.duration || 10) / 50);
      if (bestDiff <= SNAP_THRESHOLD) snapTime2 = best.time;
    }
    updateEntry(files[previewIndex].id, { end: String(snapTime2.toFixed(2)) });
    setMarkerEnd(snapTime2);
  };

  // Build a simple waveform by decoding audio from the file arrayBuffer.
  const generateWaveform = async (entry) => {
    try {
      const arrayBuffer = await entry.file.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      // decodeAudioData can throw on some files; guard it
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer).catch(() => null);
      if (!audioBuffer) {
        setWaveform(null);
        audioCtx.close();
        return;
      }

      const channelData = audioBuffer.numberOfChannels > 0 ? audioBuffer.getChannelData(0) : null;
      if (!channelData) {
        audioCtx.close();
        setWaveform(null);
        return;
      }

      // Downsample to bins for display (e.g., 500 bins)
      const BIN_COUNT = 500;
      const binSize = Math.max(1, Math.floor(channelData.length / BIN_COUNT));
      const bins = new Array(BIN_COUNT).fill(0);
      for (let i = 0; i < BIN_COUNT; i++) {
        let max = 0;
        const start = i * binSize;
        const end = Math.min(channelData.length, start + binSize);
        for (let j = start; j < end; j++) {
          const val = Math.abs(channelData[j]);
          if (val > max) max = val;
        }
        bins[i] = max;
      }

      const sampleRate = audioBuffer.sampleRate;
      const duration = audioBuffer.duration || (channelData.length / sampleRate);
      setWaveform({ bins, sampleRate, duration });
      audioCtx.close();
    } catch {
      toast.error("Waveform generation failed");
      setWaveform(null);
    }
  };

  // Sync slider to video playback
  useEffect(() => {
    if (!videoEl) return;

    const onTimeUpdate = () => {
      if (!isScrubbing) setScrubTime(videoEl.currentTime || 0);
    };

    videoEl.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      videoEl.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [videoEl, isScrubbing]);

  const onScrubStart = () => {
    setIsScrubbing(true);
    if (videoEl) videoEl.pause();
  };

  const onScrubEnd = (value) => {
    setIsScrubbing(false);
    const t = Number(value);
    setScrubTime(t);
    if (videoEl) videoEl.currentTime = t;
  };

  // Update markers when preview index or element duration changes
  useEffect(() => {
    if (previewIndex == null) return;
    const entry = files[previewIndex];
    if (!entry) return;
    setMarkerStart(Number(entry.start || 0) || 0);
    if (entry.end && Number(entry.end) > 0) setMarkerEnd(Number(entry.end));
    else if (videoEl?.duration) setMarkerEnd(videoEl.duration);
  }, [previewIndex, videoEl?.duration, files]);

  // Generate thumbnails for the preview to help users pick frames quickly
  useEffect(() => {
    if (!videoEl || !previewUrl) return;

    let cancelled = false;
    const generate = async () => {
      setIsGeneratingThumbs(true);
      try {
        const duration = videoEl.duration || 0;
        const count = Math.min(8, Math.max(1, Math.floor(duration) || 1));
        const step = Math.max(0.2, duration / count);
        const times = [];
        for (let i = 0; i < count; i++) times.push(Math.min(duration, i * step + 0.5));

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const thumbs = [];

        // choose thumbnail width
        const targetWidth = 120;

        const captureFrame = (time) => new Promise((resolve) => {
          const onSeeked = () => {
            try {
              const ratio = videoEl.videoWidth ? videoEl.videoHeight / videoEl.videoWidth : 9 / 16;
              const w = targetWidth;
              const h = Math.floor(w * ratio);
              canvas.width = w;
              canvas.height = h;
              ctx.drawImage(videoEl, 0, 0, w, h);
              const data = canvas.toDataURL("image/jpeg", 0.75);
              resolve({ time, data });
            } catch {
              resolve({ time, data: null });
            } finally {
              videoEl.removeEventListener("seeked", onSeeked);
            }
          };

          videoEl.addEventListener("seeked", onSeeked);
          videoEl.currentTime = Math.max(0, Math.min(time, videoEl.duration || 0));
        });

        for (const t of times) {
          if (cancelled) break;
          const thumb = await captureFrame(t);
          if (thumb.data) thumbs.push(thumb);
        }

        // Some players may not include the last frame; ensure final timestamp exists
        if (thumbs.length === 0 && times.length > 0) thumbs.push({ time: times[times.length - 1], data: null });
        if (!cancelled) setThumbnails(thumbs);
        // if there's an entry with no explicit end, set the marker end to duration
        if (!cancelled && files[previewIndex]) {
          const entry = files[previewIndex];
          if (!entry.end || Number(entry.end) === 0) {
            setMarkerEnd(videoEl?.duration || 0);
          }
        }
      } catch {
        toast.error("Thumbnail generation failed");
        setThumbnails([]);
      } finally {
        setIsGeneratingThumbs(false);
      }
    };

    // When metadata is ready, ensure video is loaded before generating
    if (videoEl.readyState >= 1) generate();
    else {
      const onLoaded = () => generate();
      videoEl.addEventListener("loadedmetadata", onLoaded, { once: true });
    }

    return () => {
      cancelled = true;
    };
  }, [videoEl, previewUrl, files, previewIndex]);

  // Render waveform if present
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas || !waveform) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    const { bins } = waveform;
    // apply zoom/pan: pick visible bins range
    const total = bins.length;
    const visible = Math.max(32, Math.floor(total / Math.max(1, zoomFactor)));
    const maxOffset = Math.max(0, total - visible);
    const offsetIndex = Math.floor(maxOffset * Math.min(1, Math.max(0, zoomOffset)));
    const displayBins = bins.slice(offsetIndex, offsetIndex + visible);
    // draw baseline
    ctx.fillStyle = "#e6f0ff";
    const w = canvas.clientWidth / bins.length;
    const h = canvas.clientHeight;
    for (let i = 0; i < displayBins.length; i++) {
      const v = displayBins[i];
      const barHeight = Math.max(1, v * h * 0.8);
      const x = i * w;
      const y = (h - barHeight) / 2;
      ctx.fillRect(x, y, Math.max(1, w - 1), barHeight);
    }

    // draw markers
    if (videoEl && (markerStart != null || markerEnd != null)) {
      ctx.fillStyle = "rgba(20, 184, 166, 0.3)"; // teal
      // For display, map marker time to visible bin range
      const duration = videoEl.duration || waveform.duration || 1;
      const sTime = markerStart;
      const eTime = markerEnd;
      // Map times to canvas x in current zoom/pan
      const startBin = Math.floor((sTime / duration) * total) - offsetIndex;
      const endBin = Math.floor((eTime / duration) * total) - offsetIndex;
      const s = Math.max(0, Math.min(canvas.clientWidth, (startBin / displayBins.length) * canvas.clientWidth));
      const e = Math.max(0, Math.min(canvas.clientWidth, (endBin / displayBins.length) * canvas.clientWidth));
      ctx.fillRect(s, 0, Math.max(2, e - s), canvas.clientHeight);
    }

    // add click to jump
    const onClick = (ev) => {
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      const t = pct * (videoEl.duration || waveform.duration || 0);
      if (videoEl) videoEl.currentTime = t;
      setScrubTime(t);
    };

    canvas.addEventListener("click", onClick);
    return () => canvas.removeEventListener("click", onClick);
  }, [waveform, markerStart, markerEnd, videoEl, zoomFactor, zoomOffset]);

  // Keyboard controls on focused marker
  const onMarkerKey = (which) => (ev) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(ev.key)) return;
    ev.preventDefault();
    const delta = ev.key === 'ArrowLeft' ? -0.2 : 0.2;
    if (which === 'start') {
      const ns = Math.max(0, markerStart + delta);
      setMarkerStart(ns);
      if (previewIndex != null) updateEntry(files[previewIndex].id, { start: String(ns.toFixed(2)) });
    } else if (which === 'end') {
      const ne = Math.max(0, markerEnd + delta);
      setMarkerEnd(ne);
      if (previewIndex != null) updateEntry(files[previewIndex].id, { end: String(ne.toFixed(2)) });
    }
  };

  // dragging overlay markers
  useEffect(() => {
    if (!dragging) return;

    const handleMove = (ev) => {
      if (!videoEl) return;
      const container = document.querySelector(".thumbnail-strip");
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const mouseX = ev.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, mouseX / rect.width));
      const newTime = Number((pct * (videoEl.duration || 0)).toFixed(2));
      if (dragging === "start") setMarkerStart(newTime);
      if (dragging === "end") setMarkerEnd(newTime);
    };

    const handleUp = () => {
      if (previewIndex != null) {
        const entry = files[previewIndex];
        if (entry) {
          // Snap start/end to nearest thumbnail time (if applicable)
          const snap = (t) => {
            if (!thumbnails || thumbnails.length === 0) return t;
            let best = thumbnails[0];
            let bestDiff = Math.abs(t - best.time);
            for (let i = 1; i < thumbnails.length; i++) {
              const d = Math.abs(t - thumbnails[i].time);
              if (d < bestDiff) {
                best = thumbnails[i];
                bestDiff = d;
              }
            }
            // Snap threshold in seconds. Only snap if close.
            const SNAP_THRESHOLD = snapThreshold;
            const snapped = bestDiff <= SNAP_THRESHOLD ? best.time : t;
            if (snapped !== t) {
              setSnapMessage(`Snapped to ${best.time.toFixed(2)}s`);
              setLastSnappedTime(best.time);
              setTimeout(() => setSnapMessage(""), 1600);
            }
            return snapped;
          };

          const snappedStart = snapEnabled ? snap(markerStart) : markerStart;
          const snappedEnd = snapEnabled ? snap(markerEnd) : markerEnd;
          updateEntry(entry.id, { start: String(snappedStart.toFixed(2)), end: String(snappedEnd.toFixed(2)) });
          setMarkerStart(snappedStart);
          setMarkerEnd(snappedEnd);
        }
      }
      setDragging(null);
    };

    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleUp);
    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
    };
  }, [dragging, videoEl, markerStart, markerEnd, previewIndex, files, thumbnails, snapEnabled, snapThreshold]);

  // Persist snapping preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem("videoTrim.snapSettings");
      if (saved) {
        const { enabled, threshold } = JSON.parse(saved);
        setSnapEnabled(Boolean(enabled));
        setSnapThreshold(Number(threshold) || 0.5);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("videoTrim.snapSettings", JSON.stringify({ enabled: snapEnabled, threshold: snapThreshold }));
    } catch {
      // ignore
    }
  }, [snapEnabled, snapThreshold]);

  // Testing hooks: allow Playwright to inject thumbnails and manipulate snap state during E2E.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (appliedFakeThumbsRef.current) return;

    // If the test harness provides thumbnails, use them for the preview.
    if (window.__E2E_FAKE_THUMBS && Array.isArray(window.__E2E_FAKE_THUMBS)) {
      try {
        appliedFakeThumbsRef.current = true;
        loadTestThumbnails(window.__E2E_FAKE_THUMBS);
        delete window.__E2E_FAKE_THUMBS;
      } catch (err) {
        console.warn("E2E thumb injection failed", err);
      }
    }
  }, [loadTestThumbnails]);
  // thumbnails used in snapping logic

  const trim = async (entry) => {
    setIsProcessing(true);
    setError("");
    setProgress(2);
    try {
      const { ffmpeg, fetchFile } = await loadFfmpegClient();
      ffmpeg.setProgress(({ ratio }) => setProgress(Math.min(99, Math.round(ratio * 100))));

      const inName = `in_${entry.id}`.replace(/[^a-z0-9_.-]/gi, "_");
      const outName = `trim_${entry.id}.mp4`.replace(/[^a-z0-9_.-]/gi, "_");

      try { ffmpeg.FS("unlink", inName); } catch { }
      try { ffmpeg.FS("unlink", outName); } catch { }

      ffmpeg.FS("writeFile", inName, await fetchFile(entry.file));

      const args = [
        // fast seek option
        "-ss", formatSeconds(entry.start || "0"),
        "-i", inName,
      ];
      if (entry.end) args.push("-to", formatSeconds(entry.end));
      args.push(
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        outName
      );

      await ffmpeg.run(...args);
      const data = ffmpeg.FS("readFile", outName);
      const blob = new Blob([data.buffer], { type: "video/mp4" });
      const name = `${sanitizeFileName(entry.file.name.replace(/\.[^/.]+$/, "")) || "trimmed"}.mp4`;
      const url = safeCreateObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(name);
      setProgress(100);

      try { ffmpeg.FS("unlink", inName); } catch { }
      try { ffmpeg.FS("unlink", outName); } catch { }
    } catch (err) {
      setError(err?.message || "Trim failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const mergeFiles = async () => {
    if (!files.length || files.length < 2) {
      setError("Please upload two or more videos to merge.");
      return;
    }
    setIsProcessing(true);
    setError("");
    setProgress(2);
    try {
      const { ffmpeg, fetchFile } = await loadFfmpegClient();
      ffmpeg.setProgress(({ ratio }) => setProgress(Math.min(99, Math.round(ratio * 100))));

      // Write all inputs and build a filter_complex concat
      const inputNames = [];
      for (let i = 0; i < files.length; i++) {
        const n = `in_${i}`;
        inputNames.push(n);
        try { ffmpeg.FS("unlink", n); } catch { }
        ffmpeg.FS("writeFile", n, await fetchFile(files[i].file));
      }

      const outName = "merged_output.mp4";
      try { ffmpeg.FS("unlink", outName); } catch { }

      // Build filter_complex for concat, handling both audio & video
      // Example: [0:v:0][0:a:0][1:v:0][1:a:0] concat=n=2:v=1:a=1 [v][a]
      const vf = [];
      for (let i = 0; i < inputNames.length; i++) {
        vf.push(`[${i}:v:0]`);
        vf.push(`[${i}:a:0]`);
      }
      const filter = `${vf.join("")}concat=n=${inputNames.length}:v=1:a=1[v][a]`;

      const args = [];
      for (let i = 0; i < inputNames.length; i++) {
        args.push("-i", inputNames[i]);
      }
      args.push("-filter_complex", filter, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "fast", "-crf", "23", outName);

      await ffmpeg.run(...args);

      const data = ffmpeg.FS("readFile", outName);
      const blob = new Blob([data.buffer], { type: "video/mp4" });
      const safeName = `${sanitizeFileName(files[0].file.name.replace(/\.[^/.]+$/, "")) || "merged"}-merged.mp4`;
      const url = safeCreateObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(safeName);
      setProgress(100);

      // Cleanup
      try { ffmpeg.FS("unlink", outName); } catch { }
      for (let i = 0; i < inputNames.length; i++) try { ffmpeg.FS("unlink", inputNames[i]); } catch { }
    } catch (err) {
      setError(err?.message || "Merge failed. Try ensuring inputs are similar codecs.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Video Trimmer & Merger"
      subtitle="Trim, split, and merge videos in the browser using ffmpeg.wasm"
      toolName="Video Trim & Merge"
      toolDescription="Trim clips or concatenate multiple videos client-side without uploading."
      steps={["Upload videos (multiple)", "Trim each clip or reorder to merge", "Download result"]}
      faqs={[{ question: "Does this upload my files?", answer: "No — ffmpeg.wasm runs locally in your browser." }]}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Video Trim & Merge", href: "/video-trim" }]}
      currentTool="video-trim"
    >
      <div className="space-y-6">
        <FileDropzone accept="video/*" multiple onFiles={onFiles} error={error} setError={setError} label="Upload videos" description="Up to 4 files recommended; max 500MB each" maxSize={MAX_VIDEO_SIZE} />

        {error && <Alert variant="destructive">{error}</Alert>}

        {files.map((f, i) => (
          <div key={f.id} className="p-3 border rounded-none bg-background dark:bg-background/40">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{f.file.name}</p>
                <p className="text-xs">{(f.file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <div className="flex gap-3 items-center">
                <input className="w-24 rounded-none border px-2" value={f.start} onChange={(e) => updateEntry(f.id, { start: e.target.value })} placeholder="start (s or 0:00)" aria-label={`Start time for ${f.file.name}`} />
                <input className="w-24 rounded-none border px-2" value={f.end} onChange={(e) => updateEntry(f.id, { end: e.target.value })} placeholder="end (s or 0:10)" aria-label={`End time for ${f.file.name}`} />
                <Button onClick={() => trim(f)} disabled={isProcessing}>Trim</Button>
                <Button variant="ghost" size="sm" onClick={() => openPreview(i)}>Preview</Button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-3">
          <Button onClick={mergeFiles} disabled={isProcessing || files.length < 2}>Merge files</Button>
          <Button variant="ghost" onClick={() => setFiles([])}>Clear list</Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setSnapEnabled((s) => !s)} variant={snapEnabled ? "secondary" : "ghost"}>
            {snapEnabled ? "Snapping: On" : "Snapping: Off"}
          </Button>
          <div className="flex items-center gap-2">
            <label className="text-xs" htmlFor="video-trim-snap-threshold">Threshold</label>
            <input
              id="video-trim-snap-threshold"
              type="range"
              min={0.05}
              max={3}
              step={0.05}
              value={snapThreshold}
              onChange={(e) => setSnapThreshold(Number(e.target.value))}
              className="w-32"
            />
            <div className="text-xs w-10">{snapThreshold.toFixed(2)}s</div>
          </div>
          {snapMessage && (
            <div className="text-sm text-emerald-600 dark:text-emerald-400">{snapMessage}</div>
          )}
        </div>

        {(isProcessing || progress > 0) && (
          <div>
            <div className="text-sm">{progress}%</div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {previewIndex !== null && previewUrl && (
          <div className="p-3 border rounded-none bg-background dark:bg-background/40">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <video
                  ref={(el) => setVideoEl(el)}
                  className="w-full max-h-[360px]"
                  controls
                  src={previewUrl}
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={setStartFromCurrent} disabled={isProcessing}>Set start</Button>
                  <Button onClick={setEndFromCurrent} disabled={isProcessing}>Set end</Button>
                  <Button onClick={() => generateWaveform(files[previewIndex])}>Show waveform</Button>
                  <Button onClick={() => setZoomFactor((z) => Math.max(1, Math.min(8, z - 1)))}>- Zoom</Button>
                  <Button onClick={() => setZoomFactor((z) => Math.max(1, Math.min(8, z + 1)))}>+ Zoom</Button>
                  <Button onClick={() => { setZoomFactor(1); setZoomOffset(0); }}>Reset Zoom</Button>
                  <Button onClick={() => {
                    // simple silence detect: pick first region with amplitude > threshold
                    if (!waveform) return;
                    const { bins, duration } = waveform;
                    const max = Math.max(...bins);
                    const threshold = Math.max(0.01, max * 0.06);
                    // find first bin above threshold
                    let first = 0; while (first < bins.length && bins[first] <= threshold) first++;
                    let last = first; while (last < bins.length && bins[last] > threshold) last++;
                    const startSec = (first / bins.length) * duration;
                    const endSec = (last / bins.length) * duration;
                    setMarkerStart(Number(startSec.toFixed(2)));
                    setMarkerEnd(Number(endSec.toFixed(2)));
                    updateEntry(files[previewIndex].id, { start: String(startSec.toFixed(2)), end: String(endSec.toFixed(2)) });
                  }}>Detect silence</Button>
                  <Button variant="ghost" onClick={closePreview}>Close</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isGeneratingThumbs && (
          <div className="text-sm text-foreground">Generating thumbnails…</div>
        )}

        {thumbnails.length > 0 && (
          <div className="overflow-x-auto py-2 thumbnail-strip relative">
            <div className="flex gap-2">
              {thumbnails.map((t, idx) => {
                const isSnapped = lastSnappedTime != null && Math.abs(t.time - lastSnappedTime) < 0.001;
                return (
                  <div key={String(t.time)} className="flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.data}
                      className={`w-28 h-auto rounded-none shadow-sm cursor-pointer ${isSnapped ? 'ring-2 ring-green-400' : ''}`}
                      alt={`frame-${idx}`}
                      onClick={() => { if (videoEl) videoEl.currentTime = t.time; }}
                    />
                    <div className="text-xs text-foreground">{Math.round(t.time)}s</div>
                  </div>
                );
              })}
            </div>
            {/* markers overlay (absolute) */}
            <div className="absolute inset-0 pointer-events-none">
              {videoEl?.duration > 0 && (
                <>
                  <button
                    aria-label="start-marker"
                    className="absolute top-0 bottom-0 w-3 bg-sky-500 contrast-125 pointer-events-auto"
                    style={{ left: `${(markerStart / (videoEl?.duration || 1)) * 100}%`, transform: 'translateX(-50%)' }}
                    onPointerDown={() => setDragging("start")}
                    onFocus={() => { }}
                    onBlur={() => { }}
                    onKeyDown={onMarkerKey('start')}
                  />
                  <button
                    aria-label="end-marker"
                    className="absolute top-0 bottom-0 w-3 bg-rose-500 contrast-125 pointer-events-auto"
                    style={{ left: `${(markerEnd / (videoEl?.duration || 1)) * 100}%`, transform: 'translateX(-50%)' }}
                    onPointerDown={() => setDragging("end")}
                    onFocus={() => { }}
                    onBlur={() => { }}
                    onKeyDown={onMarkerKey('end')}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {snapMessage && (
          <div className="text-sm text-green-700 dark:text-green-200">{snapMessage}</div>
        )}

        {waveform && (
          <div className="py-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xs text-foreground">Zoom: {zoomFactor}x</div>
              <div className="text-xs text-foreground">Pan</div>
              <Button size="sm" onClick={() => setZoomOffset((o) => Math.max(0, o - 0.1))}>◀</Button>
              <Button size="sm" onClick={() => setZoomOffset((o) => Math.min(1, o + 0.1))}>▶</Button>
            </div>
            <canvas ref={waveformCanvasRef} className="w-full h-14" />
            <div className="text-xs text-foreground">Audio waveform (click to jump)</div>
          </div>
        )}

        {/* Scrubber slider to help pick a point in the video */}
        {previewUrl && (
          <div className="py-2">
            <input
              aria-label="Scrub video"
              type="range"
              min={0}
              step="0.01"
              max={videoEl?.duration || 0}
              value={isScrubbing ? scrubTime : scrubTime}
              onInput={(e) => setScrubTime(Number(e.target.value))}
              onChange={(e) => onScrubEnd(e.target.value)}
              onPointerDown={onScrubStart}
              onPointerUp={(e) => onScrubEnd(e.target.value)}
              className="w-full"
            />

            <div className="flex justify-between text-xs text-foreground">
              <div>Start: {files[previewIndex]?.start || "0s"}</div>
              <div>Current: {Math.round(scrubTime)}s</div>
              <div>End: {files[previewIndex]?.end || ""}</div>
            </div>
          </div>
        )}

        {downloadUrl && (
          <div className="p-3 rounded-none bg-muted">
            <p className="font-semibold">Result ready</p>
            <a href={downloadUrl} download={downloadName || true} className="text-primary-foreground bg-primary px-3 py-1 rounded-none underline">Download</a>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
