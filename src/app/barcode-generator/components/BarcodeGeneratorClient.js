"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Download } from "lucide-react";
import JsBarcode from "jsbarcode";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import { toast } from "sonner";

export default function BarcodeGeneratorClient() {
  const [text, setText] = useState("1234567890");
  const [format, setFormat] = useState("CODE128");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const background = "#ffffff";
  const lineColor = "#000000";
  const [downloadUrl, setDownloadUrl] = useState(null);

  const svgRef = useRef(null);

  const generateBarcode = React.useCallback(() => {
    if (!svgRef.current) return;

    try {
      JsBarcode(svgRef.current, text, {
        format: format,
        width: width,
        height: height,
        displayValue: displayValue,
        background: background,
        lineColor: lineColor,
        margin: 10,
      });

      // updateDownloadUrl logic
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = safeCreateObjectURL(blob);
      setDownloadUrl(url);
    } catch {
      toast.error("Invalid barcode input for the selected format.");
    }
  }, [text, format, width, height, displayValue, background, lineColor]);

  useEffect(() => {
    generateBarcode();
  }, [generateBarcode]);

  useEffect(() => {
    return () => {
      if (downloadUrl) safeRevokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const downloadPng = () => {
    if (!svgRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = safeCreateObjectURL(blob);
    if (!url) return;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      safeRevokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `barcode-${sanitizeFileName(text)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = url;
  };

  return (
    <ToolPageLayout
      title="Barcode Generator"
      subtitle="Create custom barcodes in various formats."
      toolName="Barcode Generator"
      toolDescription="Generate high-quality barcodes for products, inventory, or personal use. Supports CODE128, EAN, UPC, and more. Customize colors, size, and text."
      currentTool="barcode-generator"
      steps={[
        "Enter the text or number for your barcode.",
        "Select the barcode format (e.g., CODE128, EAN-13).",
        "Customize appearance settings like width, height, and colors.",
        "Download as SVG or PNG."
      ]}
      faqs={[
        {
          question: "What formats are supported?",
          answer: "We support CODE128, CODE39, EAN-13, EAN-8, UPC, ITF, MSI, and Pharmacode."
        },
        {
          question: "Can I use this for commercial products?",
          answer: "Yes, the generated barcodes are standard compliant. However, ensure you have the right to use specific UPC/EAN numbers for retail."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Barcode Generator", href: "/barcode-generator" }
      ]}
    >
      <div className="grid gap-8 md:grid-cols-2 min-w-0">
        <div className="space-y-6 min-w-0">
          <Card className="min-w-0">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label>Content</Label>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter barcode text..."
                />
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CODE128">CODE128 (Auto)</SelectItem>
                    <SelectItem value="CODE39">CODE39</SelectItem>
                    <SelectItem value="EAN13">EAN-13</SelectItem>
                    <SelectItem value="EAN8">EAN-8</SelectItem>
                    <SelectItem value="UPC">UPC</SelectItem>
                    <SelectItem value="ITF">ITF</SelectItem>
                    <SelectItem value="MSI">MSI</SelectItem>
                    <SelectItem value="pharmacode">Pharmacode</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bar Width ({width})</Label>
                <Slider
                  value={[width]}
                  min={1}
                  max={4}
                  step={0.5}
                  onValueChange={([v]) => setWidth(v)}
                />
              </div>

              <div className="space-y-2">
                <Label>Height ({height}px)</Label>
                <Slider
                  value={[height]}
                  min={30}
                  max={200}
                  step={10}
                  onValueChange={([v]) => setHeight(v)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showText"
                  checked={displayValue}
                  onChange={(e) => setDisplayValue(e.target.checked)}
                  className="rounded-none border-border"
                />
                <Label htmlFor="showText">Show Text</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 min-w-0">
          <Card className="h-full flex flex-col min-w-0">
            <CardContent className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-background min-h-[300px] min-w-0">
              <div className="bg-background p-4 rounded-none shadow-sm overflow-auto max-w-full">
                <svg ref={svgRef} />
              </div>
            </CardContent>
            <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row gap-4 justify-center">
              {downloadUrl && (
                <>
                  <Button asChild variant="outline">
                    <a href={downloadUrl} download={`barcode-${sanitizeFileName(text)}.svg`}>
                      <Download className="w-4 h-4 mr-2" />
                      Download SVG
                    </a>
                  </Button>
                  <Button onClick={downloadPng}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </ToolPageLayout>
  );
}
