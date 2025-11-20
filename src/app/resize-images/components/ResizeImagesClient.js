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

export default function ResizeImagesClient() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);
  const [resizeOption, setResizeOption] = useState("percentage"); // 'percentage', 'dimensions', 'preset'
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [percentage, setPercentage] = useState(50);
  const [preset, setPreset] = useState("medium");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  // const [originalDimensions, setOriginalDimensions] = useState({});

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
      // setOriginalDimensions({});
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
        originalWidth: null,
        originalHeight: null,
      };
    });

    // Load image dimensions for each file
    const loadDimensions = async () => {
      for (const item of prepared) {
        const img = new Image();
        img.onload = () => {
          /*
          setOriginalDimensions(prev => ({
            ...prev,
            [item.id]: { width: img.width, height: img.height }
          }));
          */
          // Update the item with original dimensions
          setFiles(prev => prev.map(f =>
            f.id === item.id ? { ...f, originalWidth: img.width, originalHeight: img.height } : f
          ));
        };
        img.onerror = () => {
          console.error(`Failed to load image dimensions for ${item.name}`);
        };
        img.src = item.previewUrl;
      }
    };

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

    loadDimensions();
  }, []);

  const resizeImage = (file, targetWidth, targetHeight) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        try {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          // Draw the image at the target dimensions
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(objectUrl);
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to resize image'));
              }
            },
            'image/jpeg', // Default to JPEG, could make this configurable
            0.85 // Default quality
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
  };

  const calculateTargetDimensions = useCallback((originalWidth, originalHeight) => {
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (resizeOption === "percentage") {
      targetWidth = Math.round(originalWidth * (percentage / 100));
      targetHeight = Math.round(originalHeight * (percentage / 100));
    } else if (resizeOption === "dimensions") {
      if (maintainAspectRatio && originalWidth && originalHeight) {
        // Calculate aspect ratio
        const aspectRatio = originalWidth / originalHeight;

        if (width / aspectRatio <= height) {
          // Width is the limiting factor
          targetWidth = width;
          targetHeight = Math.round(width / aspectRatio);
        } else {
          // Height is the limiting factor
          targetHeight = height;
          targetWidth = Math.round(height * aspectRatio);
        }
      } else {
        targetWidth = width;
        targetHeight = height;
      }
    } else if (resizeOption === "preset") {
      // Common presets
      const presets = {
        "thumbnail": { width: 150, height: 150 },
        "small": { width: 320, height: 240 },
        "medium": { width: 800, height: 600 },
        "large": { width: 1200, height: 900 },
        "xlarge": { width: 1920, height: 1080 }
      };

      const presetSize = presets[preset];
      if (maintainAspectRatio && originalWidth && originalHeight) {
        const aspectRatio = originalWidth / originalHeight;

        if (presetSize.width / aspectRatio <= presetSize.height) {
          targetWidth = presetSize.width;
          targetHeight = Math.round(presetSize.width / aspectRatio);
        } else {
          targetHeight = presetSize.height;
          targetWidth = Math.round(presetSize.height * aspectRatio);
        }
      } else {
        targetWidth = presetSize.width;
        targetHeight = presetSize.height;
      }
    }

    return { targetWidth, targetHeight };
  }, [resizeOption, percentage, width, height, maintainAspectRatio, preset]);

  const resizeAll = useCallback(async () => {
    if (!files.length) {
      setError("Please upload at least one image file.");
      return;
    }

    setIsProcessing(true);
    setProcessingMessage("Preparing resize...");
    setCurrentProgress(0);
    setError("");

    const updated = [...files];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      if (!item || item.status === "done") continue;

      setProcessingMessage(`Resizing ${item.file.name} (${i + 1}/${updated.length})...`);
      setCurrentProgress(Math.round((i / updated.length) * 100));

      try {
        item.status = "processing";

        // Get original dimensions
        const originalWidth = item.originalWidth;
        const originalHeight = item.originalHeight;

        if (!originalWidth || !originalHeight) {
          throw new Error('Could not determine original image dimensions');
        }

        // Calculate target dimensions
        const { targetWidth, targetHeight } = calculateTargetDimensions(originalWidth, originalHeight);

        // Resize the image
        const resizedBlob = await resizeImage(item.file, targetWidth, targetHeight);

        if (item.resultUrl) {
          try { safeRevokeObjectURL(item.resultUrl); } catch { /* ignore */ }
        }
        const resultUrl = safeCreateObjectURL(resizedBlob);

        const safeName = `${sanitizeFileName(item.file.name.replace(/\.[^.]+$/, "")) || "resized"}_${targetWidth}x${targetHeight}.jpg`;
        item.resultUrl = resultUrl;
        item.resultName = safeName;
        item.status = "done";
        item.error = "";
        item.targetWidth = targetWidth;
        item.targetHeight = targetHeight;
      } catch (resizeError) {
        console.error("Failed to resize image", resizeError);
        item.status = "error";
        item.error = resizeError?.message || "Resize failed";
      }
    }

    setFiles(updated.map((item) => ({ ...item })));
    setProcessingMessage("Resize complete!");
    setCurrentProgress(100);
    setTimeout(() => setCurrentProgress(0), 1200);
    setIsProcessing(false);
  }, [files, calculateTargetDimensions]);

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

  const toolName = "Resize Images";
  const toolDescription = "Resize your images to custom dimensions or predefined presets. All processing happens directly in your browser for privacy and security.";
  const steps = [
    "Upload image files via drag & drop or the file picker.",
    "Select your resize option: percentage, specific dimensions, or preset sizes.",
    "Click 'Resize' to adjust your images.",
    "Download the resized images once processing is complete."
  ];
  const faqs = [
    {
      question: "How do I resize images?",
      answer: "You can resize images by percentage (e.g., 50% of original size), by specifying exact width and height dimensions, or by choosing from common preset sizes like thumbnail, small, medium, etc."
    },
    {
      question: "Can I maintain the original aspect ratio?",
      answer: "Yes, you can maintain the original aspect ratio by enabling the 'Maintain Aspect Ratio' option. This ensures your images don't get distorted during resizing."
    },
    {
      question: "Are my images uploaded to a server?",
      answer: "No. All resizing happens securely in your browser. Your images never leave your device."
    }
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Resize images to custom dimensions or predefined presets."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Resize Images", href: "/resize-images" },
      ]}
      currentTool="resize-images"
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

        {/* Resize options */}
        <div className="p-4 bg-background dark:bg-background rounded-none space-y-4">
          <Label className="font-semibold">Resize Options</Label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Method</label>
              <select
                value={resizeOption}
                onChange={(e) => setResizeOption(e.target.value)}
                className="w-full rounded-none border px-2 py-1 text-sm"
              >
                <option value="percentage">By Percentage</option>
                <option value="dimensions">By Dimensions</option>
                <option value="preset">By Preset</option>
              </select>
            </div>

            {resizeOption === "percentage" && (
              <div>
                <Label htmlFor="percentage">Resize Percentage (%)</Label>
                <Input
                  id="percentage"
                  type="number"
                  min="1"
                  max="200"
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {resizeOption === "dimensions" && (
              <>
                <div>
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    min="1"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="1"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {resizeOption === "preset" && (
              <div>
                <Label htmlFor="preset">Preset Size</Label>
                <select
                  id="preset"
                  value={preset}
                  onChange={(e) => setPreset(e.target.value)}
                  className="w-full rounded-none border px-2 py-1 text-sm"
                >
                  <option value="thumbnail">Thumbnail (150x150)</option>
                  <option value="small">Small (320x240)</option>
                  <option value="medium">Medium (800x600)</option>
                  <option value="large">Large (1200x900)</option>
                  <option value="xlarge">Extra Large (1920x1080)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="maintain-aspect"
              checked={maintainAspectRatio}
              onChange={(e) => setMaintainAspectRatio(e.target.checked)}
              className="mr-2"
            />
            <Label htmlFor="maintain-aspect">Maintain Aspect Ratio</Label>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Resize error</AlertTitle>
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
                <Button onClick={resizeAll} disabled={isProcessing}>
                  {isProcessing ? "Resizing..." : "Resize All"}
                </Button>
                <Button variant="ghost" onClick={() => setFiles([])} disabled={isProcessing}>
                  Clear list
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {files.map((item) => (
                <div key={item.id} className="border border-border dark:border-border rounded-none p-4 space-y-3 bg-background dark:bg-background/40">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground dark:text-foreground break-all">{item.name}</p>
                      <p className="text-xs text-foreground">{(item.size / (1024 * 1024)).toFixed(2)} MB</p>
                      {item.originalWidth && item.originalHeight && (
                        <p className="text-xs text-foreground">
                          Original: {item.originalWidth}×{item.originalHeight}px
                        </p>
                      )}
                      {item.targetWidth && item.targetHeight && (
                        <p className="text-xs text-blue-500">
                          Resized: {item.targetWidth}×{item.targetHeight}px
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(item.id)} disabled={isProcessing}>
                      Remove
                    </Button>
                  </div>
                  <div className="text-sm">
                    {item.status === "pending" && <span className="text-foreground">Pending resize</span>}
                    {item.status === "processing" && <span className="text-blue-500">Resizing...</span>}
                    {item.status === "done" && (
                      <span className="text-green-600">Ready</span>
                    )}
                    {item.status === "error" && (
                      <span className="text-red-600">{item.error}</span>
                    )}
                  </div>
                  {item.resultUrl && (
                    <Button asChild variant="success" size="sm">
                      <a href={item.resultUrl} download={item.resultName}>
                        Download Resized
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
