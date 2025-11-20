"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { safeCreateObjectURL, safeRevokeObjectURL, sanitizeFileName } from "@/lib/enhancedUX";
import { defaultMetadataState, readPdfMetadata, updatePdfMetadata } from "@/lib/pdfMetadata";
import { CalendarDays, ClipboardCheck, FileText, RefreshCcw, ShieldCheck, User, Tag, Type, UploadCloud } from "lucide-react";

const metadataFields = [
  { key: "title", label: "Title", icon: Type },
  { key: "author", label: "Author", icon: User },
  { key: "subject", label: "Subject", icon: FileText },
  { key: "keywords", label: "Keywords", icon: Tag, multiline: true },
  { key: "creator", label: "Creator", icon: UploadCloud },
  { key: "producer", label: "Producer", icon: ClipboardCheck },
  { key: "creationDate", label: "Created On", icon: CalendarDays, type: "date" },
  { key: "modificationDate", label: "Modified On", icon: CalendarDays, type: "date" }
];

export default function PdfMetadataEditorClient() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [metadata, setMetadata] = useState(defaultMetadataState);
  const [originalMetadata, setOriginalMetadata] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    return () => safeRevokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  const extractMetadata = useCallback(async (file) => {
    try {
      setIsProcessing(true);
      const extracted = await readPdfMetadata(file);
      setMetadata(extracted);
      setOriginalMetadata(extracted);
      setStatusMessage("Metadata loaded from PDF");
    } catch (err) {
      setError(err?.message || "Failed to read metadata from PDF.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFiles = useCallback(async (files) => {
    if (!files?.length) return;
    const file = files[0];
    setSelectedFile(file);
    setError("");
    await extractMetadata(file);
  }, [extractMetadata]);

  const handleFieldChange = (field, value) => {
    setMetadata((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const resetMetadata = () => {
    if (originalMetadata) {
      setMetadata(originalMetadata);
      setStatusMessage("Reverted to original metadata");
    }
  };

  const scrubSensitiveInfo = () => {
    setMetadata((prev) => ({
      ...prev,
      author: "",
      creator: "",
      producer: "",
      keywords: ""
    }));
    setStatusMessage("Cleared author, creator, producer, and keywords");
  };

  const saveMetadata = async () => {
    if (!selectedFile) {
      setError("Please upload a PDF first.");
      return;
    }
    try {
      setIsProcessing(true);
      setError("");
      const { blob, metadata: updatedMetadata } = await updatePdfMetadata(selectedFile, {
        ...metadata,
        keywords: (metadata.keywords || "").split(",").map((kw) => kw.trim()).filter(Boolean).join(", ")
      });
      setMetadata(updatedMetadata);
      setOriginalMetadata(updatedMetadata);
      safeRevokeObjectURL(downloadUrl);
      const url = safeCreateObjectURL(blob);
      setDownloadUrl(url);
      setStatusMessage("Metadata updated. Download the refreshed PDF.");
    } catch (err) {
      setError(err?.message || "Unable to update metadata.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFileName = useMemo(() => {
    if (!selectedFile) return "updated-metadata.pdf";
    const base = sanitizeFileName(selectedFile.name.replace(/\.pdf$/i, ""));
    return `${base}-metadata.pdf`;
  }, [selectedFile]);

  return (
    <ToolPageLayout
      title="PDF Metadata Editor"
      subtitle="Clean up authorship, keywords, and document dates without uploading your file."
      toolName="PDF Metadata"
      toolDescription="Extract, edit, or scrub PDF document properties entirely offline."
      currentTool="pdf-metadata-editor"
      steps={[
        "Drop a PDF into the uploader or click to choose a file up to 50 MB.",
        "We extract the existing title, author, subject, keywords, and dates directly in your browser.",
        "Edit the fields, reset to the original snapshot, or scrub sensitive authorship data in one tap.",
        "Save changes to instantly download a fresh PDF with the updated metadata baked in."
      ]}
      features={[
        "Runs 100% locally with pdf-lib so documents never leave your device",
        "One-click scrub action clears author, creator, producer, and keywords",
        "Snapshot + reset flow to compare original and updated values",
        "Audit summary surfaces the most important fields for compliance reviews"
      ]}
      useCases={[
        {
          title: "Brand Compliance",
          description: "Ensure exported decks and brochures ship with the right title, subject, and campaign keywords."
        },
        {
          title: "Privacy Reviews",
          description: "Strip personal authorship details before distributing PDFs externally or to vendors."
        },
        {
          title: "Search Optimization",
          description: "Update keywords and descriptions so internal knowledge bases stay easy to discover."
        }
      ]}
      faqs={[
        {
          question: "Does editing metadata change the PDF content?",
          answer: "No. We only adjust the document properties stored in the file header. Text, images, and layout remain untouched."
        },
        {
          question: "Do you upload my PDFs to a server?",
          answer: "All parsing and rewriting happens in your browser. Once you close the tab the data is gone."
        },
        {
          question: "Can I edit password-protected PDFs?",
          answer: "Encrypted PDFs need to be unlocked before metadata can be updated. If the file is locked, the tool will prompt you to supply an unprotected version."
        }
      ]}
      badge="New"
      icon={null}
      primaryActionHref="/merge"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Organize & Edit", href: "/categories?filter=organize" },
        { label: "PDF Metadata Editor", href: "/pdf-metadata-editor" }
      ]}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="application/pdf"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Upload PDF with Metadata"
          description="Drag & drop or click to select a PDF file (Max 50MB)"
          maxSize={50 * 1024 * 1024}
          isLoading={isProcessing}
        />

        {statusMessage && !error && (
          <Alert variant="success">
            <p>{statusMessage}</p>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <p>{error}</p>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Metadata Fields</CardTitle>
            <CardDescription>Update document properties before sharing your PDF.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {metadataFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-foreground" />
                    {field.label}
                  </Label>
                  {field.multiline ? (
                    <Textarea
                      id={field.key}
                      value={metadata[field.key] || ""}
                      onChange={(event) => handleFieldChange(field.key, event.target.value)}
                      placeholder="Comma-separated keywords"
                      disabled={!selectedFile || isProcessing}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field.key}
                      type={field.type === "date" ? "date" : "text"}
                      value={metadata[field.key] || ""}
                      onChange={(event) => handleFieldChange(field.key, event.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      disabled={!selectedFile || isProcessing}
                    />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={saveMetadata} disabled={!selectedFile || isProcessing}>
            {isProcessing ? "Saving..." : "Save Metadata"}
          </Button>
          <Button type="button" variant="secondary" onClick={resetMetadata} disabled={!originalMetadata || isProcessing}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reset to Original
          </Button>
          <Button type="button" variant="outline" onClick={scrubSensitiveInfo} disabled={!selectedFile || isProcessing}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Scrub Personal Info
          </Button>
          {downloadUrl && (
            <Button asChild variant="secondary">
              <a href={downloadUrl} download={downloadFileName}>
                Download Updated PDF
              </a>
            </Button>
          )}
        </div>

        {selectedFile && (
          <Card>
            <CardHeader>
              <CardTitle>Audit Summary</CardTitle>
              <CardDescription>Quick snapshot of current metadata values.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {metadataFields.slice(0, 6).map((field) => (
                <div key={`summary-${field.key}`} className="rounded-none border border-border p-3">
                  <p className="text-xs uppercase tracking-wide text-foreground">{field.label}</p>
                  <p className="font-medium text-foreground break-words min-h-[28px]">
                    {metadata[field.key] || "—"}
                  </p>
                </div>
              ))}
              <div className="rounded-none border border-border p-3">
                <p className="text-xs uppercase tracking-wide text-foreground">File Name</p>
                <p className="font-medium text-foreground break-words">{selectedFile.name}</p>
              </div>
              <div className="rounded-none border border-border p-3">
                <p className="text-xs uppercase tracking-wide text-foreground">File Size</p>
                <p className="font-medium text-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolPageLayout>
  );
}
