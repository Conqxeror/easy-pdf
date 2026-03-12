"use client";

import React, { useState, useCallback, useEffect  } from "react";
import { loadPdfJs, loadPdfLib } from "@/lib/pdfjsWorker";
import { Download, FileText, Zap } from "lucide-react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { toast } from "sonner";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";

export default function CompressPdfClient() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [compressedPdfUrl, setCompressedPdfUrl] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState("balanced");
  const [compressionPercentage, setCompressionPercentage] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [imageQuality, setImageQuality] = useState(75);

  // Cleanup function for object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (compressedPdfUrl) {
  try { if (compressedPdfUrl && typeof URL !== 'undefined' && !String(compressedPdfUrl).startsWith('data:')) URL.revokeObjectURL(compressedPdfUrl); } catch { /* ignore */ }
      }
    };
  }, [compressedPdfUrl]);

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    setOriginalSize(selectedFile ? selectedFile.size : 0);
    setCompressedPdfUrl(null);
    setCompressionPercentage(null);
    setCompressedSize(0);
    setError("");
    setProgress(0);
  };

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const compressPDF = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    setError("");
    setIsCompressing(true);
    setProcessingMessage("Loading PDF document...");
    setProgress(0);
    setCompressedPdfUrl(null);

    try {
      // Load pdf libraries dynamically
      const pdfjs = await loadPdfJs();
      const { PDFDocument } = await loadPdfLib();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      const numPages = pdf.numPages;
      setProgress(10);
      setProcessingMessage("Processing pages...");

      const newPdfDoc = await PDFDocument.create();
      const finalJpegQuality = imageQuality;

      for (let i = 1; i <= numPages; i++) {
        setProcessingMessage(`Compressing page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imageDataUrl = canvas.toDataURL(
          "image/jpeg",
          finalJpegQuality / 100
        );

        const embeddedImage = await newPdfDoc.embedJpg(imageDataUrl);

        const newPage = newPdfDoc.addPage([
          embeddedImage.width,
          embeddedImage.height,
        ]);
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });

        setProgress(10 + Math.round((i / numPages) * 80));
      }

      setProcessingMessage("Saving compressed PDF...");

      const compressedPdfBytes = await newPdfDoc.save();
      const blob = new Blob([compressedPdfBytes], { type: "application/pdf" });
  let url = null;
  try { url = safeCreateObjectURL(blob); } catch { url = null; }
      // Revoke previous URL if present to avoid memory leaks
      setCompressedPdfUrl((prev) => {
  try { if (prev) safeRevokeObjectURL(prev); } catch {}
        return url;
      });

      const newSize = blob.size;
      setCompressedSize(newSize);
      const reduction = ((originalSize - newSize) / originalSize) * 100;
      setCompressionPercentage(Math.max(0, Math.round(reduction)));

      setProgress(100);
      setProcessingMessage("Compression complete!");
    } catch {
      toast.error("Failed to compress PDF. Please try again with a different file.");
      setError(
        "Failed to compress PDF. Please try again with a different file."
      );
    } finally {
      setIsCompressing(false);
      setProcessingMessage("");
    }
  };

  return (
    <ToolPageLayout>
      <div className="space-y-6">
        <FileDropzone
          accept="application/pdf"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Choose a PDF File"
          description="Drag & drop or click to select a PDF file (Max 50MB)"
          maxSize={50 * 1024 * 1024}
          isLoading={isCompressing}
        />

        {fileName && (
          <div className="p-4 bg-background/10 border border-border">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-background/20 mr-3">
                <FileText className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{fileName}</h3>
                <p className="text-sm text-foreground">
                  {formatFileSize(originalSize)}
                </p>
              </div>
            </div>
            
            {compressedSize > 0 && !isCompressing && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground">Original Size:</span>
                  <span className="font-medium">
                    {formatFileSize(originalSize)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground">Compressed Size:</span>
                  <span className="font-medium text-green-400">
                    {formatFileSize(compressedSize)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Reduction:</span>
                  <span className="font-medium text-foreground">
                    {compressionPercentage}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <Label className="text-foreground mb-3 block">Compression Level</Label>
            <RadioGroup
              value={compressionLevel}
              onValueChange={(value) => {
                setCompressionLevel(value);
                if (value === "mild") {
                  setImageQuality(85);
                } else if (value === "balanced") {
                  setImageQuality(75);
                } else if (value === "aggressive") {
                  setImageQuality(50);
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <div>
                <RadioGroupItem
                  value="mild"
                  id="mild"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="mild"
                  className="flex flex-col items-center justify-between border-2 border-border bg-background p-4 hover:bg-background peer-data-[state=checked]:border-border [&:has([data-state=checked])]:border-border text-foreground cursor-pointer transition-colors"
                >
                  <span className="font-medium">Mild</span>
                  <span className="text-xs text-foreground mt-1">
                    Good Quality (85%)
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="balanced"
                  id="balanced"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="balanced"
                  className="flex flex-col items-center justify-between border-2 border-border bg-background p-4 hover:bg-background peer-data-[state=checked]:border-border [&:has([data-state=checked])]:border-border text-foreground cursor-pointer transition-colors"
                >
                  <span className="font-medium">Balanced</span>
                  <span className="text-xs text-foreground mt-1">
                    Recommended (75%)
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="aggressive"
                  id="aggressive"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="aggressive"
                  className="flex flex-col items-center justify-between border-2 border-border bg-background p-4 hover:bg-background peer-data-[state=checked]:border-border [&:has([data-state=checked])]:border-border text-foreground cursor-pointer transition-colors"
                >
                  <span className="font-medium">Aggressive</span>
                  <span className="text-xs text-foreground mt-1">
                    Smallest Size (50%)
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-foreground">
                Image Quality: {imageQuality}%
              </Label>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <Slider
              value={[imageQuality]}
              onValueChange={([value]) => setImageQuality(value)}
              min={10}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-foreground">
              <span>Smaller File</span>
              <span>Better Quality</span>
            </div>
          </div>
        </div>

        {isCompressing && (
          <div className="space-y-3 p-4 bg-background border border-border">
            <Progress
              value={progress}
              className="h-2.5 bg-background [&::-webkit-progress-bar]:bg-background [&::-webkit-progress-value]:bg-background"
            />
            <p className="text-sm text-center text-foreground">
              {processingMessage || `Compressing PDF... ${progress}%`}
            </p>
          </div>
        )}

        {error && <Alert variant="destructive">{error}</Alert>}

        <div className="flex justify-center">
          <Button
            onClick={compressPDF}
            disabled={isCompressing || !file}
            size="lg"
          >
            {isCompressing ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></span>
                Compressing...
              </span>
            ) : (
              "Compress PDF"
            )}
          </Button>
        </div>

        {compressedPdfUrl && !isCompressing && (
          <div className="flex flex-col gap-6 p-6 bg-background shadow-lg border border-border">
            <div className="w-full text-center space-y-4 text-foreground">
              <h3 className="text-2xl font-semibold flex items-center justify-center text-green-400">
                <Download className="w-6 h-6 mr-2" />
                Compression Complete
              </h3>
              
              <div className="bg-background p-4 border border-border">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-background">
                    <div className="text-foreground text-sm">Original Size</div>
                    <div className="font-medium">{formatFileSize(originalSize)}</div>
                  </div>
                  <div className="text-center p-3 bg-background">
                    <div className="text-foreground text-sm">Compressed Size</div>
                    <div className="font-medium text-green-400">{formatFileSize(compressedSize)}</div>
                  </div>
                  <div className="text-center p-3 bg-background">
                    <div className="text-foreground text-sm">Saved</div>
                    <div className="font-medium text-foreground">{compressionPercentage}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button asChild variant="success" size="lg" className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-foreground shadow-lg hover:shadow-xl">
                <a
                  href={compressedPdfUrl}
                  download={`compressed_${fileName}`}
                  className="text-center"
                  onClick={() => {
                    const urlToRevoke = compressedPdfUrl;
                    setTimeout(() => {
                      try { if (urlToRevoke && typeof URL !== 'undefined' && !String(urlToRevoke).startsWith('data:')) URL.revokeObjectURL(urlToRevoke); } catch { /* ignore */ }
                    }, 500);
                  }}
                >
                  <span className="flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Download Compressed PDF
                  </span>
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}