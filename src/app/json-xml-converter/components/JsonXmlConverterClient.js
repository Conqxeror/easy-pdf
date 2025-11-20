"use client";

import React, { useState, useCallback } from "react";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ArrowRightLeft, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function JsonXmlConverterClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("json-to-xml"); // 'json-to-xml' or 'xml-to-json'
  const [error, setError] = useState("");
  // Use Sonner directly for toasts.

  const handleConvert = useCallback(() => {
    setError("");
    setOutput("");

    if (!input.trim()) {
      setError("Please enter some input text.");
      return;
    }

    try {
      if (mode === "json-to-xml") {
        // JSON to XML
        let jsonObj;
        try {
          jsonObj = JSON.parse(input);
        } catch (e) {
          throw new Error("Invalid JSON format: " + e.message);
        }

        const builder = new XMLBuilder({
          format: true,
          ignoreAttributes: false,
        });
        const xmlStr = builder.build(jsonObj);
        setOutput(xmlStr);
      } else {
        // XML to JSON
        const parser = new XMLParser({
          ignoreAttributes: false,
          parseAttributeValue: true,
        });
        // Basic validation
        if (!input.trim().startsWith("<")) {
          throw new Error("Invalid XML format: Must start with <");
        }

        const jsonObj = parser.parse(input);
        setOutput(JSON.stringify(jsonObj, null, 2));
      }
    } catch (err) {
      setError(err.message || "Conversion failed");
    }
  }, [input, mode]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied!",
      description: "Result copied to clipboard.",
    });
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], {
      type: mode === "json-to-xml" ? "application/xml" : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${mode === "json-to-xml" ? "xml" : "json"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const toolName = "JSON <> XML Converter";
  const toolDescription = "Convert JSON data to XML and vice versa instantly. Validate structure, format output, and download files for development and data processing.";

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Seamlessly convert between JSON and XML formats with validation and formatting."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={[
        "Paste your JSON or XML code into the input area.",
        "Select the conversion direction (JSON to XML or XML to JSON).",
        "Click 'Convert' to process the data.",
        "Copy the result or download it as a file."
      ]}
      faqs={[
        {
          question: "Is the conversion performed locally?",
          answer: "Yes, all processing happens in your browser using JavaScript. Your data is never sent to a server."
        },
        {
          question: "Does it handle attributes in XML?",
          answer: "Yes, the parser preserves attributes when converting between formats."
        },
        {
          question: "Can I convert large files?",
          answer: "Performance depends on your browser, but it generally handles text up to several megabytes without issues."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "JSON-XML Converter", href: "/json-xml-converter" },
      ]}
      currentTool="json-xml-converter"
    >
      <div className="space-y-6">
        <div className="flex justify-center mb-6">
          <Tabs value={mode} onValueChange={(v) => { setMode(v); setError(""); setOutput(""); }} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json-to-xml">JSON to XML</TabsTrigger>
              <TabsTrigger value="xml-to-json">XML to JSON</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 h-[600px]">
          <div className="flex flex-col h-full space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-medium text-sm text-foreground dark:text-foreground">
                Input {mode === "json-to-xml" ? "(JSON)" : "(XML)"}
              </label>
              <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 text-xs">
                <Trash2 className="w-3 h-3 mr-1" /> Clear
              </Button>
            </div>
            <Textarea
              placeholder={mode === "json-to-xml" ? '{\n  "key": "value"\n}' : '<root>\n  <key>value</key>\n</root>'}
              className="flex-1 font-mono text-sm resize-none p-4"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col h-full space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-medium text-sm text-foreground dark:text-foreground">
                Output {mode === "json-to-xml" ? "(XML)" : "(JSON)"}
              </label>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output} className="h-8 text-xs">
                  <Copy className="w-3 h-3 mr-1" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!output} className="h-8 text-xs">
                  <Download className="w-3 h-3 mr-1" /> Download
                </Button>
              </div>
            </div>
            <div className="relative flex-1">
              <Textarea
                readOnly
                className="absolute inset-0 w-full h-full font-mono text-sm resize-none p-4 bg-background dark:bg-background/50"
                value={output}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleConvert} size="lg" className="w-full md:w-auto min-w-[200px]">
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Convert
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </ToolPageLayout>
  );
}
