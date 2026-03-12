"use client";

import { useCallback, useState } from "react";
import { Download, FileHeart, FlaskConical, Pill, Stethoscope, UserRound } from "lucide-react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/components/ui/Loader";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";
import { toolsData } from "@/lib/toolData";

const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = (event) => {
      if (reader.error) {
        reject(new Error(`File read error: ${reader.error.message}`));
        return;
      }

      const result = event?.target?.result;
      const base64 = typeof result === "string" ? result.split(",")[1] : null;
      if (!base64) {
        reject(new Error("Failed to read file content."));
        return;
      }

      resolve(base64);
    };

    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });

const formatAnalysisItem = (item) => {
  if (typeof item === "string") {
    return item;
  }

  if (item && typeof item === "object") {
    return Object.entries(item)
      .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
      .map(([key, value]) => `${key}: ${value}`)
      .join(" | ");
  }

  return String(item ?? "");
};

const buildReportText = (result) => {
  const sections = [
    ["Summary", [result.summary || "No summary provided."]],
    ["Patient Information", result.patientInfo],
    ["Diagnoses", result.diagnoses],
    ["Medications", result.medications],
    ["Lab Results", result.labResults],
    ["Recommendations", result.recommendations],
  ];

  return sections
    .map(([heading, items]) => {
      const normalizedItems = Array.isArray(items) ? items : [];
      const lines = normalizedItems.length > 0
        ? normalizedItems.map((entry) => `- ${formatAnalysisItem(entry)}`)
        : ["- None detected"];

      return `${heading}\n${"=".repeat(heading.length)}\n${lines.join("\n")}`;
    })
    .join("\n\n");
};

function ResultSection({ icon, title, items, emptyState }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {items.map((item, index) => (
              <li key={`${title}-${index}`} className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-foreground">
                {formatAnalysisItem(item)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyState}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function MedicalAnalyzerClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [result, setResult] = useState(null);

  const toolData = toolsData.find((tool) => tool.href === "/medical-analyzer");

  const handleFiles = useCallback((files) => {
    const selectedFile = files[0] || null;
    setFile(selectedFile);
    setResult(null);
    setError("");
    setLoadingMessage("");
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file) {
      setError("Please select a document to analyze.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setResult(null);

    try {
      setLoadingMessage("Preparing document...");
      const base64 = await readFileAsBase64(file);

      setLoadingMessage("Sending text to the medical analysis service...");
      const response = await fetch("/api/medical-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, name: file.name }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          data.error || "Analysis failed. Please try again with a different document."
        );
      }

      setResult({
        summary: data.summary || "No summary provided.",
        patientInfo: Array.isArray(data.patientInfo) ? data.patientInfo : [],
        diagnoses: Array.isArray(data.diagnoses) ? data.diagnoses : [],
        medications: Array.isArray(data.medications) ? data.medications : [],
        labResults: Array.isArray(data.labResults) ? data.labResults : [],
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
      });
    } catch (analysisError) {
      setError(
        analysisError instanceof Error && analysisError.message
          ? analysisError.message
          : "Failed to analyze the document. Please try again."
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage("");
    }
  }, [file]);

  const downloadReport = useCallback(() => {
    if (!result || !file) {
      return;
    }

    const reportText = buildReportText(result);
    const blob = new Blob([`Medical Document Analysis\nFile: ${file.name}\n\n${reportText}\n`], {
      type: "text/plain;charset=utf-8",
    });

    const url = safeCreateObjectURL(blob);
    if (!url) {
      setError("Unable to create a downloadable report in this browser.");
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = `${file.name.replace(/\.[^.]+$/, "") || "medical-analysis"}-analysis.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    safeRevokeObjectURL(url);
  }, [file, result]);

  const toolName = toolData?.title || "Medical Document Analyzer";
  const toolDescription =
    "Upload a medical PDF, image, or Word document to extract patient details, diagnoses, medications, lab findings, and follow-up recommendations. The document is uploaded to the easy-pdf analysis route and sent to an external AI provider for analysis, but easy-pdf does not store the uploaded file after processing.";

  const steps = [
    "Upload a medical PDF, Word document, or image file.",
    "Start analysis to extract readable text and send it to the medical analysis service.",
    "Review the structured summary, diagnoses, medications, lab results, and follow-up recommendations.",
    "Download the text report if you need a copy for your records or further review.",
  ];

  const faqs = [
    {
      question: "Can this replace advice from a doctor or clinician?",
      answer:
        "No. This tool summarizes documents and extracts details, but it cannot diagnose conditions or replace professional medical advice.",
    },
    {
      question: "Does the analysis stay entirely in my browser?",
      answer:
        "No. Your document is uploaded to the easy-pdf analysis route, text is extracted, and that content is sent to an external AI provider for analysis. easy-pdf does not store the uploaded file after processing.",
    },
    {
      question: "What file types are supported?",
      answer:
        "You can upload PDF, DOC, DOCX, JPG, and PNG files up to 50MB.",
    },
  ];

  const useCases = [
    {
      title: "Prepare for appointments",
      description: "Summarize long reports before discussing them with a clinician or care team.",
    },
    {
      title: "Review medical records",
      description: "Pull medications, diagnoses, and lab values into one structured view for faster follow-up.",
    },
  ];

  return (
    <ToolPageLayout
      title="Medical Document Analyzer"
      subtitle="Extract patient details, diagnoses, medications, and lab findings from medical records with structured AI review."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="medical-analyzer"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Medical Analyzer", href: "/medical-analyzer" },
      ]}
      features={toolData?.features || []}
      useCases={useCases}
    >
      <div className="space-y-6">
        <Alert>
          Your document content is uploaded for text extraction and sent to an external AI service for analysis. easy-pdf does not store the uploaded file after processing.
        </Alert>

        <FileDropzone
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Choose a Medical Document"
          description="Drag & drop or click to select a PDF, Word document, or image file (Max 50MB)"
          maxSize={50 * 1024 * 1024}
          isLoading={isProcessing}
        />

        {file && (
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-foreground">
            Ready to analyze: <span className="font-medium">{file.name}</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}

        {isProcessing && (
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-6">
            <Loader size="sm" color="gray" className="inline-block mr-2" message={loadingMessage || "Analyzing document..."} />
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={handleAnalyze} disabled={isProcessing || !file} size="lg">
            {isProcessing ? "Analyzing..." : "Analyze Document"}
          </Button>
          <Button onClick={downloadReport} disabled={!result || isProcessing} size="lg" variant="outline">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Download Report
          </Button>
        </div>

        {result && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileHeart className="h-5 w-5" aria-hidden="true" />
                  <span>Analysis Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-foreground">{result.summary}</p>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <ResultSection
                icon={<UserRound className="h-5 w-5" aria-hidden="true" />}
                title="Patient Information"
                items={result.patientInfo}
                emptyState="No patient details were extracted from this document."
              />
              <ResultSection
                icon={<Stethoscope className="h-5 w-5" aria-hidden="true" />}
                title="Diagnoses"
                items={result.diagnoses}
                emptyState="No diagnoses were identified."
              />
              <ResultSection
                icon={<Pill className="h-5 w-5" aria-hidden="true" />}
                title="Medications"
                items={result.medications}
                emptyState="No medications were identified."
              />
              <ResultSection
                icon={<FlaskConical className="h-5 w-5" aria-hidden="true" />}
                title="Lab Results"
                items={result.labResults}
                emptyState="No lab results were extracted."
              />
            </div>

            <ResultSection
              icon={<Download className="h-5 w-5" aria-hidden="true" />}
              title="Recommended Follow-up"
              items={result.recommendations}
              emptyState="No follow-up recommendations were returned."
            />
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
