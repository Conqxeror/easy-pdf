"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import JSZip from "jszip";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import { toast } from "sonner";

const ACCEPTED_ZIP_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
];

const MAX_ZIP_SIZE = 200 * 1024 * 1024; // 200MB client-side cap to avoid memory spikes

export default function ZipExtractorClient() {
  const [zipFile, setZipFile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);
  const [activeDownload, setActiveDownload] = useState(null);

  const zipRef = useRef(null);
  const downloadCacheRef = useRef(new Map());

  useEffect(() => {
    return () => {
      cleanupCachedUrls();
    };
  }, []);

  const cleanupCachedUrls = () => {
    downloadCacheRef.current.forEach((url) => {
      try { safeRevokeObjectURL(url); } catch { /* ignore */ }
    });
    downloadCacheRef.current.clear();
  };

  const resetExtractionState = () => {
    setEntries([]);
    setProcessingMessage("");
    setCurrentProgress(0);
    zipRef.current = null;
    cleanupCachedUrls();
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "—";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleFiles = (files) => {
    setError("");
    if (!files || files.length === 0) {
      setZipFile(null);
      resetExtractionState();
      return;
    }

    const selected = files[0];
    if (!ACCEPTED_ZIP_TYPES.includes(selected.type) && !selected.name.endsWith(".zip")) {
      setError("Unsupported archive. Please upload a .zip file.");
      setZipFile(null);
      resetExtractionState();
      return;
    }

    if (selected.size > MAX_ZIP_SIZE) {
      setError("Archive too large for in-browser extraction (max 200MB).");
      setZipFile(null);
      resetExtractionState();
      return;
    }

    setZipFile(selected);
    resetExtractionState();
  };

  const extractZip = async () => {
    if (!zipFile) {
      setError("Please upload a ZIP file first.");
      return;
    }

    setIsProcessing(true);
    setProcessingMessage("Reading archive...");
    setCurrentProgress(15);
    setError("");

    try {
      const arrayBuffer = await zipFile.arrayBuffer();
      setProcessingMessage("Parsing file entries...");
      setCurrentProgress(40);

      const zip = await JSZip.loadAsync(arrayBuffer, { createFolders: true });
      zipRef.current = zip;

      const allEntries = Object.keys(zip.files).map((path) => {
        const entry = zip.files[path];
        const cleanName = entry.dir ? path.replace(/\/$/, "") || "(folder)" : path.split("/").pop() || path;
        return {
          path,
          name: cleanName,
          isDirectory: entry.dir,
          extension: entry.dir ? "" : (cleanName.split(".").pop() || "").toLowerCase(),
          size: entry._data?.uncompressedSize ?? null,
          compressedSize: entry._data?.compressedSize ?? null,
        };
      });

      const sortedEntries = allEntries.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.path.localeCompare(b.path);
      });

      setEntries(sortedEntries);
      setProcessingMessage(`Found ${sortedEntries.length} items.`);
      setCurrentProgress(100);
      setTimeout(() => setCurrentProgress(0), 1200);
    } catch (extractionError) {
      toast.error(extractionError?.message || "ZIP extraction failed");
      setError("Failed to extract ZIP. Please make sure the archive is valid.");
      setProcessingMessage("Extraction failed");
      setEntries([]);
      zipRef.current = null;
    } finally {
      setIsProcessing(false);
    }
  };

  const getEntryUrl = async (entry) => {
    let cachedUrl = downloadCacheRef.current.get(entry.path);
    if (cachedUrl) return cachedUrl;

    if (!zipRef.current) {
      throw new Error("Archive not loaded");
    }

    const zipEntry = zipRef.current.file(entry.path);
    if (!zipEntry) {
      throw new Error("Entry not found in archive");
    }

    const blob = await zipEntry.async("blob");
    const url = safeCreateObjectURL(blob);
    downloadCacheRef.current.set(entry.path, url);
    return url;
  };

  const triggerDownload = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadEntry = async (entry) => {
    if (entry.isDirectory) return;
    if (!zipRef.current) {
      setError("Please extract the archive first.");
      return;
    }

    setActiveDownload(entry.path);
    setProcessingMessage(`Preparing ${entry.name}...`);

    try {
      const url = await getEntryUrl(entry);
      const safeName = sanitizeFileName(entry.name) || "file";
      triggerDownload(url, safeName);
    } catch (downloadError) {
      toast.error(downloadError?.message || "Failed to download entry");
      setError("Failed to download file. Please try again.");
    } finally {
      setActiveDownload(null);
      setProcessingMessage("");
    }
  };

  const downloadAllFiles = async () => {
    if (!zipRef.current) {
      setError("Please extract the archive first.");
      return;
    }

    setActiveDownload("all");
    setProcessingMessage("Preparing files...");

    for (const entry of entries) {
      if (entry.isDirectory) continue;
      try {
        const url = await getEntryUrl(entry);
        const safeName = sanitizeFileName(entry.name) || "file";
        triggerDownload(url, safeName);
        await new Promise((resolve) => setTimeout(resolve, 150));
      } catch (err) {
        toast.error(err?.message || "Batch download failed");
        setError("A file failed to download. Please try individually.");
        break;
      }
    }

    setActiveDownload(null);
    setProcessingMessage("");
  };

  const stats = useMemo(() => {
    if (!entries.length) return null;
    let fileCount = 0;
    let folderCount = 0;
    let totalKnownSize = 0;

    entries.forEach((entry) => {
      if (entry.isDirectory) {
        folderCount += 1;
      } else {
        fileCount += 1;
        if (typeof entry.size === "number") {
          totalKnownSize += entry.size;
        }
      }
    });

    return { fileCount, folderCount, totalKnownSize };
  }, [entries]);

  const toolName = "ZIP Extractor";
  const toolDescription = "Unpack ZIP archives directly in your browser, preview their structure, and download exactly the files you need — no uploads, no server in the loop.";
  const steps = [
    "Drop a .zip archive into the uploader or click to select one.",
    "Click 'Extract ZIP' to parse the archive entirely on your device.",
    "Download individual files or trigger a batch download when ready.",
  ];
  const faqs = [
    {
      question: "Is there a size limit?",
      answer: "For stability, we recommend archives under 200MB. Larger files can exhaust browser memory, especially on low-RAM devices.",
    },
    {
      question: "Do you upload my files?",
      answer: "Never. The ZIP stays in memory inside your browser tab. You can even disconnect from the internet once the page loads.",
    },
    {
      question: "Can I download everything at once?",
      answer: "Yes, use the 'Download All Files' option. Your browser may show multiple save prompts — that's expected for file-by-file exports.",
    },
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Extract ZIP archives securely inside your browser. Preview contents, grab individual files, or export everything in one go."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "ZIP Extractor", href: "/zip-extractor" },
      ]}
      currentTool="zip-extractor"
    >
      <div className="space-y-6">
        <Alert variant="info">
          <AlertTitle>Privacy-first extraction</AlertTitle>
          <AlertDescription>
            We use JSZip in WebAssembly-friendly mode so the entire archive stays in memory on your device. Close the tab and everything disappears.
          </AlertDescription>
        </Alert>

        <FileDropzone
          accept={`${ACCEPTED_ZIP_TYPES.join(",")},.zip`}
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload a ZIP archive"
          description="Drag & drop or click to select .zip files (max 200MB)"
          maxSize={MAX_ZIP_SIZE}
          isLoading={isProcessing}
        />

        {zipFile && (
          <div className="border border-border dark:border-border bg-background dark:bg-background/40 p-4 space-y-1 text-sm">
            <p><strong>Selected archive:</strong> {zipFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(zipFile.size)}</p>
            <p className="text-foreground dark:text-foreground">Click &quot;Extract ZIP&quot; to list its contents.</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Extraction error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(isProcessing || currentProgress > 0) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-foreground dark:text-foreground">
              <span>{processingMessage || "Processing..."}</span>
              <span>{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={extractZip} disabled={!zipFile || isProcessing} size="lg">
            {isProcessing ? "Extracting..." : "Extract ZIP"}
          </Button>
          <Button
            variant="outline"
            onClick={downloadAllFiles}
            disabled={!entries.length || activeDownload === "all"}
          >
            {activeDownload === "all" ? "Downloading..." : "Download All Files"}
          </Button>
        </div>

        {stats && (
          <div className="border border-border dark:border-border bg-background dark:bg-background/40 p-4 grid gap-2 text-sm">
            <p><strong>Total files:</strong> {stats.fileCount}</p>
            <p><strong>Folders:</strong> {stats.folderCount}</p>
            <p><strong>Known extracted size:</strong> {formatFileSize(stats.totalKnownSize)}</p>
          </div>
        )}

        {entries.length > 0 && (
          <div className="overflow-hidden border border-border dark:border-border">
            <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_auto] bg-background dark:bg-background/60 text-sm font-semibold text-foreground dark:text-foreground px-4 py-3">
              <span>Path</span>
              <span>Type</span>
              <span>Size</span>
              <span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {entries.map((entry) => (
                <div
                  key={entry.path}
                  className="grid lg:grid-cols-[2fr_1fr_1fr_auto] grid-cols-1 gap-2 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground dark:text-foreground break-all">{entry.path}</p>
                    {!entry.isDirectory && (
                      <p className="text-xs text-foreground">Saved as {entry.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-foreground dark:text-foreground">
                    {entry.isDirectory ? (
                      <Badge variant="outline">Folder</Badge>
                    ) : (
                      <Badge variant="secondary">{entry.extension || "file"}</Badge>
                    )}
                  </div>
                  <div className="text-foreground dark:text-foreground">
                    {entry.isDirectory ? "—" : formatFileSize(entry.size)}
                  </div>
                  <div className="flex justify-end items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadEntry(entry)}
                      disabled={entry.isDirectory || activeDownload === entry.path}
                      loading={activeDownload === entry.path}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
