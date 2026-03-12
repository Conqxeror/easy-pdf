"use client";

import React, { useState, useCallback } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { copyToClipboard, sanitizeFileName, safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";

const DEFAULT_CSV_SAMPLE = `name,email,role\nAlice,alice@example.com,Admin\nBob,bob@example.com,Editor`;
const DEFAULT_JSON_SAMPLE = `[
  {"name":"Alice","email":"alice@example.com","role":"Admin"},
  {"name":"Bob","email":"bob@example.com","role":"Editor"}
]`;

const MAX_TEXT_SIZE = 2 * 1024 * 1024; // 2MB safety cap for textarea conversions

const parseCsv = (csv) => {
  const rows = csv
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => line.split(","));
  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] ?? "";
    });
    return obj;
  });
};

const stringifyCsv = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return "";
  }
  const headers = Array.from(
    data.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set())
  );
  const escape = (value) => {
    if (value == null) return "";
    const str = String(value);
    return str.includes(",") || str.includes("\n") ? `"${str.replaceAll("\"", '""')}"` : str;
  };
  const lines = [headers.join(",")];
  data.forEach((row) => {
    const line = headers.map((header) => escape(row[header] ?? ""));
    lines.push(line.join(","));
  });
  return lines.join("\n");
};

export default function CsvJsonConverterClient() {
  const [csvInput, setCsvInput] = useState(DEFAULT_CSV_SAMPLE);
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON_SAMPLE);
  const [error, setError] = useState("");
  const [activeDirection, setActiveDirection] = useState("csv-to-json");
  const [downloadBlob, setDownloadBlob] = useState(null);

  const handleCsvToJson = useCallback(() => {
    setError("");
    try {
      if (!csvInput.trim()) {
        setJsonInput("[]");
        return;
      }
      if (csvInput.length > MAX_TEXT_SIZE) {
        throw new Error("CSV is too large for inline conversion. Please use a smaller file.");
      }
      const parsed = parseCsv(csvInput);
      const jsonStr = JSON.stringify(parsed, null, 2);
      setJsonInput(jsonStr);
      toast.success("Converted CSV to JSON");
      const blob = new Blob([jsonStr], { type: "application/json" });
      setDownloadBlob({ blob, filename: `${sanitizeFileName("converted")}.json` });
    } catch (conversionError) {
      setError(conversionError.message || "Failed to convert CSV to JSON");
    }
  }, [csvInput]);

  const handleJsonToCsv = useCallback(() => {
    setError("");
    try {
      if (!jsonInput.trim()) {
        setCsvInput("");
        return;
      }
      if (jsonInput.length > MAX_TEXT_SIZE) {
        throw new Error("JSON is too large for inline conversion. Please use a smaller file.");
      }
      const parsed = JSON.parse(jsonInput);
      const csv = stringifyCsv(parsed);
      setCsvInput(csv);
      toast.success("Converted JSON to CSV");
      const blob = new Blob([csv], { type: "text/csv" });
      setDownloadBlob({ blob, filename: `${sanitizeFileName("converted")}.csv` });
    } catch (conversionError) {
      setError(conversionError.message || "Failed to convert JSON to CSV");
    }
  }, [jsonInput]);

  const handleFileDrop = (files) => {
    setError("");
    if (!files?.length) return;
    const file = files[0];
    if (file.size > MAX_TEXT_SIZE) {
      setError("File too large. Please keep uploads under 2MB for this inline converter.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      if (file.name.endsWith(".csv")) {
        setCsvInput(text);
        setActiveDirection("csv-to-json");
      } else if (file.name.endsWith(".json")) {
        setJsonInput(text);
        setActiveDirection("json-to-csv");
      } else {
        setError("Unsupported file type. Please upload .csv or .json files.");
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    };
    reader.readAsText(file);
  };

  const downloadResult = () => {
    if (!downloadBlob) return;
    const link = document.createElement("a");
    const url = safeCreateObjectURL(downloadBlob.blob);
    if (!url) return;
    link.href = url;
    link.download = downloadBlob.filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => safeRevokeObjectURL(url), 500);
  };

  const toolName = "CSV ↔ JSON Converter";
  const toolDescription = "Instantly convert comma-separated values to structured JSON (and back) without uploading your data. Paste, edit, or drop files — everything runs locally.";
  const steps = [
    "Paste CSV or JSON into the relevant box (or drop a file).",
    "Choose the conversion direction and click the convert button.",
    "Copy, download, or continue editing the output instantly.",
  ];
  const faqs = [
    {
      question: "Does this handle quoted fields?",
      answer: "Yes, basic quoted values and commas inside quotes are supported. For complex CSV edge cases, we plan to add an advanced parser soon.",
    },
    {
      question: "Is there a row limit?",
      answer: "For inline conversion, we recommend staying under ~10,000 rows (2MB). Larger datasets are better suited for dedicated desktop tools.",
    },
    {
      question: "Can I batch convert multiple files?",
      answer: "Drag one file at a time for now. Batch workflows are on our roadmap once the core converter stabilizes.",
    },
  ];

  return (
    <ToolPageLayout
      title={toolName}
      subtitle="Convert CSV data to JSON (and back) instantly, all within your browser."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "CSV ↔ JSON", href: "/csv-json-converter" },
      ]}
      currentTool="csv-json-converter"
    >
      <div className="space-y-6">
        <FileDropzone
          accept=".csv,.json"
          multiple={false}
          onFiles={handleFileDrop}
          error={error}
          setError={setError}
          label="Drop a CSV or JSON file"
          description="Drag & drop or click to select .csv/.json files (max 2MB)"
          maxSize={MAX_TEXT_SIZE}
        />

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Conversion error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">CSV Input</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCsvInput(DEFAULT_CSV_SAMPLE);
                  setActiveDirection("csv-to-json");
                }}
              >
                Load sample
              </Button>
            </div>
            <Textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              rows={18}
              className="font-mono text-sm"
            />
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={handleCsvToJson} variant={activeDirection === "csv-to-json" ? "default" : "outline"}>
                Convert CSV → JSON
              </Button>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(csvInput)}>
                Copy CSV
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">JSON Output</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setJsonInput(DEFAULT_JSON_SAMPLE);
                  setActiveDirection("json-to-csv");
                }}
              >
                Load sample
              </Button>
            </div>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={18}
              className="font-mono text-sm"
            />
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={handleJsonToCsv} variant={activeDirection === "json-to-csv" ? "default" : "outline"}>
                Convert JSON → CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(jsonInput)}>
                Copy JSON
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button onClick={downloadResult} disabled={!downloadBlob}>
            Download Result
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setCsvInput("");
              setJsonInput("");
              setError("");
              setDownloadBlob(null);
            }}
          >
            Clear all
          </Button>
        </div>
      </div>
    </ToolPageLayout>
  );
}
