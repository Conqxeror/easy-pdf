"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NumberBaseConverterClient() {
  const [values, setValues] = useState({
    binary: "",
    octal: "",
    decimal: "",
    hex: ""
  });
  const [copied, setCopied] = useState("");

  const handleChange = (value, base) => {
    if (!value) {
      setValues({ binary: "", octal: "", decimal: "", hex: "" });
      return;
    }

    try {
      // Validate input based on base
      let isValid = false;
      if (base === 2) isValid = /^[01]+$/.test(value);
      if (base === 8) isValid = /^[0-7]+$/.test(value);
      if (base === 10) isValid = /^[0-9]+$/.test(value);
      if (base === 16) isValid = /^[0-9A-Fa-f]+$/.test(value);

      if (!isValid) return; // Ignore invalid input

      const decimalValue = parseInt(value, base);

      if (isNaN(decimalValue)) return;

      setValues({
        binary: decimalValue.toString(2),
        octal: decimalValue.toString(8),
        decimal: decimalValue.toString(10),
        hex: decimalValue.toString(16).toUpperCase()
      });
    } catch {
      // Ignore errors
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <ToolPageLayout
      title="Number Base Converter"
      subtitle="Convert numbers between Binary, Octal, Decimal, and Hexadecimal."
      toolName="Base Converter"
      toolDescription="Instantly convert numbers between different bases. Supports Binary (Base 2), Octal (Base 8), Decimal (Base 10), and Hexadecimal (Base 16)."
      currentTool="number-base-converter"
      steps={[
        "Type a number in any field.",
        "The other fields will update automatically.",
        "Copy the converted values."
      ]}
      faqs={[
        {
          question: "What is the maximum number supported?",
          answer: "This tool supports standard JavaScript integers (up to 2^53 - 1)."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Base Converter", href: "/number-base-converter" }
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <Label>Decimal (Base 10)</Label>
          <div className="flex gap-2">
            <Input
              value={values.decimal}
              onChange={(e) => handleChange(e.target.value, 10)}
              placeholder="e.g. 255"
            />
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(values.decimal, "dec")}>
              {copied === "dec" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Binary (Base 2)</Label>
          <div className="flex gap-2">
            <Input
              value={values.binary}
              onChange={(e) => handleChange(e.target.value, 2)}
              placeholder="e.g. 11111111"
            />
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(values.binary, "bin")}>
              {copied === "bin" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Hexadecimal (Base 16)</Label>
          <div className="flex gap-2">
            <Input
              value={values.hex}
              onChange={(e) => handleChange(e.target.value, 16)}
              placeholder="e.g. FF"
            />
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(values.hex, "hex")}>
              {copied === "hex" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Octal (Base 8)</Label>
          <div className="flex gap-2">
            <Input
              value={values.octal}
              onChange={(e) => handleChange(e.target.value, 8)}
              placeholder="e.g. 377"
            />
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(values.octal, "oct")}>
              {copied === "oct" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
