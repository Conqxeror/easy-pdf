"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import tinycolor from "tinycolor2";

export default function ColorConverterClient() {
  const [input, setInput] = useState("#3b82f6");
  const [copied, setCopied] = useState(null);

  const toCmykString = (c) => {
    const rgb = c.toRgb();
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    let k = 1 - Math.max(r, g, b);
    let cyan = (1 - r - k) / (1 - k) || 0;
    let magenta = (1 - g - k) / (1 - k) || 0;
    let yellow = (1 - b - k) / (1 - k) || 0;

    return `cmyk(${Math.round(cyan * 100)}%, ${Math.round(magenta * 100)}%, ${Math.round(yellow * 100)}%, ${Math.round(k * 100)}%)`;
  };

  const c = tinycolor(input);
  const color = c.isValid() ? {
    hex: c.toHexString(),
    rgb: c.toRgbString(),
    hsl: c.toHslString(),
    hsv: c.toHsvString(),
    cmyk: toCmykString(c),
    isDark: c.isDark(),
    obj: c
  } : null;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ToolPageLayout
      title="Color Converter"
      subtitle="Convert colors between HEX, RGB, HSL, and CMYK formats."
      toolName="Color Converter"
      toolDescription="A powerful color converter and palette generator. Input any color format to see its equivalents."
      currentTool="color-converter"
      steps={[
        "Enter a color code (HEX, RGB, or name).",
        "View the converted values in different formats.",
        "Click to copy any format to your clipboard."
      ]}
      faqs={[
        {
          question: "What formats are supported?",
          answer: "We support HEX, RGB, HSL, HSV, and standard color names."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Color Converter", href: "/color-converter" }
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Input Color</Label>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="#000000, rgb(0,0,0), blue"
              className="text-lg font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Supports HEX, RGB, HSL, and color names.
            </p>
          </div>

          {color && (
            <div
              className="w-full h-48 rounded-none shadow-inner border flex items-center justify-center"
              style={{ backgroundColor: color.hex }}
            >
              <span
                className={`text-2xl font-bold font-mono ${color.isDark ? 'text-foreground' : 'text-foreground'}`}
              >
                {color.hex}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Label>Conversions</Label>
          {color ? (
            <div className="grid gap-3">
              {[
                { label: "HEX", value: color.hex },
                { label: "RGB", value: color.rgb },
                { label: "HSL", value: color.hsl },
                { label: "HSV", value: color.hsv },
                { label: "CMYK", value: color.cmyk },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-16 font-medium text-muted-foreground">{item.label}</div>
                  <Input readOnly value={item.value} className="font-mono" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(item.value, item.label)}
                  >
                    {copied === item.label ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground border rounded-none bg-muted/50">
              Enter a valid color to see conversions
            </div>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
