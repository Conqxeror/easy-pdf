"use client";

import React, { useState, useEffect, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import { toast } from "sonner";

export default function SvgToPngClient() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);
  const outputFormat = "png";

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

    const prepared = incomingFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      previewUrl: null,
      resultUrl: null,
      status: "pending",
      error: "",
      name: file.name,
      size: file.size,
    }));

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

  const convertSvgToImage = useCallback((svgFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const svgContent = event.target.result;

          // Create a temporary div to parse the SVG
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = svgContent;
          document.body.appendChild(tempDiv);

          const svgElement = tempDiv.querySelector('svg');
          if (!svgElement) {
            throw new Error('No valid SVG element found in file');
          }

          // Get SVG dimensions
          let width = svgElement.width.baseVal.value || 800;
          let height = svgElement.height.baseVal.value || 600;

          // Use viewBox if dimensions are not specified
          if (width === 0 || height === 0) {
            const viewBox = svgElement.viewBox.baseVal;
            if (viewBox.width > 0 && viewBox.height > 0) {
              width = viewBox.width;
              height = viewBox.height;
            } else {
              width = 800;
              height = 600; // default dimensions
            }
          }

          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          // Create an image object to draw the SVG
          const img = new Image();
          img.onload = () => {
            try {
              // Clear canvas and draw the SVG image
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, width, height);

              // Convert to blob
              canvas.toBlob(
                (blob) => {
                  document.body.removeChild(tempDiv); // Clean up
                  if (blob) {
                    resolve(blob);
                  } else {
                    reject(new Error('Failed to convert SVG to image'));
                  }
                },
                `image/${outputFormat}`,
                1.0 // full quality for PNG
              );
            } catch (drawError) {
              document.body.removeChild(tempDiv); // Clean up
              reject(drawError);
            }
          };

          img.onerror = (err) => {
            document.body.removeChild(tempDiv); // Clean up
            reject(err);
          };

          // Convert SVG to data URL
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = safeCreateObjectURL(svgBlob);

          // Set image source to the SVG URL
          img.src = svgUrl;

          // Clean up the object URL after image loads
          setTimeout(() => {
            try {
              safeRevokeObjectURL(svgUrl);
            } catch { }
          }, 1000);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read SVG file'));
      };

      reader.readAsText(svgFile);
    });
  }, [outputFormat]);

  const convertAll = useCallback(async () => {
    if (!files.length) {
      setError("Please upload at least one SVG file.");
      return;
    }

    setIsProcessing(true);
    setProcessingMessage("Preparing conversion...");
    setCurrentProgress(0);
    setError("");

    const updated = [...files];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      if (!item || item.status === "done") continue;

      setProcessingMessage(`Converting ${item.file.name} (${i + 1}/${updated.length})...`);
      setCurrentProgress(Math.round((i / updated.length) * 100));

      try {
        item.status = "processing";

        const convertedBlob = await convertSvgToImage(item.file);

        if (item.resultUrl) {
          try { safeRevokeObjectURL(item.resultUrl); } catch { /* ignore */ }
        }
        const resultUrl = safeCreateObjectURL(convertedBlob);

        const safeName = `${sanitizeFileName(item.file.name.replace(/\.[^.]+$/, "")) || "converted"}.${outputFormat}`;
        item.resultUrl = resultUrl;
        item.resultName = safeName;
        item.status = "done";
        item.error = "";
      } catch (conversionError) {
        toast.error(conversionError?.message || "SVG conversion failed - may contain unsupported elements");
        item.status = "error";
        item.error = conversionError?.message || "SVG conversion failed - may contain unsupported elements";
      }
    }

    setFiles(updated.map((item) => ({ ...item })));
    setProcessingMessage("Conversion complete!");
    setCurrentProgress(100);
    setTimeout(() => setCurrentProgress(0), 1200);
    setIsProcessing(false);
  }, [files, outputFormat, convertSvgToImage]);

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

  const toolName = "SVG to PNG Converter";
  const toolDescription = "Convert SVG images to PNG format directly in your browser. Maintain quality and transparency when converting vector graphics to raster images.";
  const steps = [
    "Upload SVG image files via drag & drop or the file picker.",
    "Click 'Convert' to transform your SVGs to PNG format.",
    "Download the converted PNG images once processing is complete."
  ];
  const faqs = [
    {
      question: "What is SVG to PNG conversion?",
      answer: "SVG to PNG conversion transforms vector-based SVG graphics into raster PNG images. This is useful when you need to use SVG graphics in applications or contexts that don't support vector formats."
    },
    {
      question: "Will transparency be preserved?",
      answer: "Yes, transparency in your SVG files will be preserved in the PNG output, provided that the SVG has transparent elements."
    },
    {
      question: "Are my SVGs uploaded to a server?",
      answer: "No. All conversion happens securely in your browser. Your SVG files never leave your device."
    }
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Convert SVG images to PNG format."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "SVG to PNG", href: "/svg-to-png" },
      ]}
      currentTool="svg-to-png"
    >
      <div className="space-y-6">
        <FileDropzone
          accept=".svg"
          multiple
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload SVG files"
          description="Drag & drop or click to select SVG files (max 10MB each)"
          maxSize={10 * 1024 * 1024}
          isLoading={isProcessing}
        />

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Conversion error</AlertTitle>
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
                <Button onClick={convertAll} disabled={isProcessing}>
                  {isProcessing ? "Converting..." : "Convert All"}
                </Button>
                <Button variant="ghost" onClick={() => setFiles([])} disabled={isProcessing}>
                  Clear list
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {files.map((item) => (
                <div key={item.id} className="border border-border dark:border-border p-4 space-y-3 bg-background dark:bg-background/40">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground dark:text-foreground break-all">{item.name}</p>
                      <p className="text-xs text-foreground">{(item.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(item.id)} disabled={isProcessing}>
                      Remove
                    </Button>
                  </div>
                  <div className="text-sm">
                    {item.status === "pending" && <span className="text-foreground">Pending conversion</span>}
                    {item.status === "processing" && <span className="text-muted-foreground">Converting...</span>}
                    {item.status === "done" && (
                      <span className="text-emerald-600 dark:text-emerald-400">Ready</span>
                    )}
                    {item.status === "error" && (
                      <span className="text-destructive">{item.error}</span>
                    )}
                  </div>
                  {item.resultUrl && (
                    <Button asChild variant="success" size="sm">
                      <a href={item.resultUrl} download={item.resultName}>
                        Download {outputFormat.toUpperCase()}
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
