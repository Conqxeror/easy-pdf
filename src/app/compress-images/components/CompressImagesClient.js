"use client";

import React, { useState, useEffect, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CompressImagesClient() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);
  const [quality, setQuality] = useState(80); // Default to 80% quality
  const [format, setFormat] = useState("jpeg"); // Default to JPEG

  useEffect(() => {
    return () => {
      // Clean up object URLs on unmount
      files.forEach((item) => {
        if (item.previewUrl) {
          try { safeRevokeObjectURL(item.previewUrl); } catch { /* ignore */ }
        }
        if (item.resultUrl) {
          try { safeRevokeObjectURL(item.resultUrl); } catch { /* ignore */ }
        }
      });
    };
  }, [files]);

  const handleFiles = useCallback((incomingFiles) => {
    setError("");
    if (!incomingFiles?.length) {
      setFiles([]);
      return;
    }

    const prepared = incomingFiles.map((file) => {
      const previewUrl = safeCreateObjectURL(file);
      return {
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        previewUrl,
        resultUrl: null,
        resultName: "",
        status: "pending",
        error: "",
        name: file.name,
        size: file.size,
        originalSize: file.size,
      };
    });

    setFiles((prev) => {
      prev.forEach((f) => {
        if (f.previewUrl) {
          try { safeRevokeObjectURL(f.previewUrl); } catch { /* ignore */ }
        }
        if (f.resultUrl) {
          try { safeRevokeObjectURL(f.resultUrl); } catch { /* ignore */ }
        }
      });
      return prepared;
    });
  }, []);

  const compressImage = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        try {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          // Draw the image on canvas
          ctx.drawImage(img, 0, 0);

          // Determine the output format
          const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
          const qualityValue = format === 'jpeg' ? quality / 100 : 1.0; // PNG doesn't use quality

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(objectUrl);
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            mimeType,
            qualityValue
          );
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      };

      img.src = objectUrl;
    });
  }, [format, quality]);

  const compressAll = useCallback(async () => {
    if (!files.length) {
      setError("Please upload at least one image file.");
      return;
    }

    setIsProcessing(true);
    setProcessingMessage("Preparing compression...");
    setCurrentProgress(0);
    setError("");

    const updated = [...files];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      if (!item || item.status === "done") continue;

      setProcessingMessage(`Compressing ${item.file.name} (${i + 1}/${updated.length})...`);
      setCurrentProgress(Math.round((i / updated.length) * 100));

      try {
        item.status = "processing";

        // Compress the image
        const compressedBlob = await compressImage(item.file);

        if (item.resultUrl) {
          try { safeRevokeObjectURL(item.resultUrl); } catch { /* ignore */ }
        }
        const resultUrl = safeCreateObjectURL(compressedBlob);

        const extension = format;
        const safeName = `${sanitizeFileName(item.file.name.replace(/\.[^.]+$/, "")) || "compressed"}.${extension}`;
        item.resultUrl = resultUrl;
        item.resultName = safeName;
        item.status = "done";
        item.error = "";
        item.compressedSize = compressedBlob.size;
        item.originalSize = item.file.size;
      } catch (compressError) {
        console.error("Failed to compress image", compressError);
        item.status = "error";
        item.error = compressError?.message || "Compression failed";
      }
    }

    setFiles(updated.map((item) => ({ ...item })));
    setProcessingMessage("Compression complete!");
    setCurrentProgress(100);
    setTimeout(() => setCurrentProgress(0), 1200);
    setIsProcessing(false);
  }, [files, format, compressImage]);

  const removeFile = (id) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry) {
        if (entry.previewUrl) {
          try { safeRevokeObjectURL(entry.previewUrl); } catch { /* ignore */ }
        }
        if (entry.resultUrl) {
          try { safeRevokeObjectURL(entry.resultUrl); } catch { /* ignore */ }
        }
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const toolName = "Compress Images";
  const toolDescription = "Reduce image file sizes while maintaining visual quality. Perfect for web optimization and faster loading times.";
  const steps = [
    "Upload image files via drag & drop or the file picker.",
    "Adjust compression settings like quality and output format.",
    "Click 'Compress' to reduce your image file sizes.",
    "Download the compressed images once processing is complete."
  ];
  const faqs = [
    {
      question: "How does image compression work?",
      answer: "Our tool uses canvas-based compression that reduces file size by adjusting image quality. For JPEG files, you can set the quality level (lower values mean smaller files). PNG files maintain transparency but may not compress as much as JPEGs."
    },
    {
      question: "What's the difference between JPEG and PNG compression?",
      answer: "JPEG compression is lossy and results in smaller file sizes but may reduce image quality. PNG compression is lossless, preserving image quality but resulting in larger files. PNG also supports transparency."
    },
    {
      question: "Are my images uploaded to a server?",
      answer: "No. All compression happens securely in your browser. Your images never leave your device."
    }
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Compress images to reduce file size while maintaining quality."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Compress Images", href: "/compress-images" },
      ]}
      currentTool="compress-images"
    >
      <div className="space-y-6">
        <FileDropzone
          accept="image/*"
          multiple
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload Image files"
          description="Drag & drop or click to select image files (max 50MB each)"
          maxSize={50 * 1024 * 1024}
          isLoading={isProcessing}
        />

        {/* Compression options */}
        <div className="p-4 bg-background dark:bg-background rounded-none space-y-4">
          <Label className="font-semibold">Compression Options</Label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quality">Quality Level</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="quality"
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm w-10">{quality}%</span>
              </div>
              <p className="text-xs text-foreground mt-1">Lower values = smaller file size</p>
            </div>

            <div>
              <Label htmlFor="format">Output Format</Label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-none border px-2 py-1 text-sm"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Compression error</AlertTitle>
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

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between flex-wrap gap-3">
              <p className="text-sm text-foreground dark:text-foreground">{files.length} file(s) queued.</p>
              <div className="flex gap-2">
                <Button onClick={compressAll} disabled={isProcessing}>
                  {isProcessing ? "Compressing..." : "Compress All"}
                </Button>
                <Button variant="outline" onClick={() => setFiles([])} disabled={isProcessing}>
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((item) => (
                <div key={item.id} className="border rounded-none p-3 bg-background dark:bg-background shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="truncate font-medium text-sm" title={item.name}>{item.name}</div>
                    <button
                      onClick={() => removeFile(item.id)}
                      className="text-foreground hover:text-red-500"
                      disabled={isProcessing}
                    >
                      ×
                    </button>
                  </div>

                  <div className="aspect-video bg-background dark:bg-background rounded-none mb-2 flex items-center justify-center overflow-hidden">
                    {item.previewUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-foreground">No preview</span>
                    )}
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-foreground">Original:</span>
                      <span>{(item.originalSize / 1024).toFixed(1)} KB</span>
                    </div>

                    {item.status === "done" && (
                      <>
                        <div className="flex justify-between font-medium text-green-600">
                          <span>Compressed:</span>
                          <span>{(item.compressedSize / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Saved:</span>
                          <span>{Math.round((1 - item.compressedSize / item.originalSize) * 100)}%</span>
                        </div>
                        <a
                          href={item.resultUrl}
                          download={item.resultName}
                          className="block w-full text-center mt-2 py-1 bg-blue-50 text-blue-600 rounded-none hover:bg-blue-100 transition-colors"
                        >
                          Download
                        </a>
                      </>
                    )}

                    {item.status === "error" && (
                      <div className="text-red-500 text-xs mt-1">{item.error}</div>
                    )}

                    {item.status === "processing" && (
                      <div className="text-blue-500 text-xs mt-1">Compressing...</div>
                    )}
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
