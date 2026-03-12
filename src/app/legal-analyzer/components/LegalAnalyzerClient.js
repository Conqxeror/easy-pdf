"use client";

// src/app/legal-analyzer/components/LegalAnalyzerClient.js

import React, { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import FileDropzone from "@/components/ui/FileDropzone";
import Loader from "@/components/ui/Loader";

import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
// Import lucide-react icons
import {
  FileText,
  Users,
  ScrollText,
  ShieldAlert,
  Lightbulb,
} from "lucide-react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { toast } from "sonner";
import { safeCreateObjectURL, safeRevokeObjectURL } from "@/lib/enhancedUX";

const LEGAL_CLAUSES = [
  "Indemnity",
  "Termination",
  "Confidentiality",
  "Jurisdiction",
  "Force Majeure",
  "Arbitration",
  "Governing Law",
  "Limitation of Liability",
  "Non-Compete",
  "Severability",
];

export default function LegalAnalyzerClient() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(""); // New state for detailed loading message
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFile = useCallback((f) => {
    const selectedFile = f && f.length > 0 ? f[0] : null;
    setFile(selectedFile);
    setResult(null); // Clear previous results
    setError(""); // Clear error when a new file is dropped
    setLoadingMessage(""); // Clear loading message
  }, []);

  // Helper to determine risk text color
  const getRiskColorClass = (riskText) => {
    // Ensure riskText is a string before calling toLowerCase()
    const textToAnalyze = String(riskText || ""); // Convert to string, default to empty string if null/undefined
    const lowerCaseRisk = textToAnalyze.toLowerCase();
    if (
      lowerCaseRisk.includes("high risk") ||
      lowerCaseRisk.includes("significant risk") ||
      lowerCaseRisk.includes("unfavorable") ||
      lowerCaseRisk.includes("major concern")
    ) {
      return "text-red-400";
    }
    if (
      lowerCaseRisk.includes("moderate risk") ||
      lowerCaseRisk.includes("medium risk") ||
      lowerCaseRisk.includes("potential concern")
    ) {
      return "text-orange-400";
    }
    if (
      lowerCaseRisk.includes("low risk") ||
      lowerCaseRisk.includes("minimal risk") ||
      lowerCaseRisk.includes("favorable")
    ) {
      return "text-green-400";
    }
    return "text-foreground"; // Default color
  };

  const analyzeDocument = async () => {
    if (!file) {
      setError("Please select a file to analyze.");
      return;
    }

    setLoading(true);
    setLoadingMessage("Uploading document...");
    setError(""); // Clear previous errors before starting analysis
    setResult(null); // Clear previous results before starting analysis

    try {
      const reader = new FileReader();

      reader.onloadend = async (e) => {
        try {
          if (reader.error) {
            throw new Error(`File read error: ${reader.error.message}`);
          }

          const base64 = e.target.result.split(",")[1];
          if (!base64) {
            throw new Error("Failed to read file content.");
          }

          setLoadingMessage("Extracting text from document...");
          // Simulate a small delay for visual feedback, not strictly necessary for functionality
          await new Promise((resolve) => setTimeout(resolve, 500));

          setLoadingMessage("Analyzing document with AI...");
          const res = await fetch("/api/legal-analyzer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file: base64,
              name: file.name,
              legalClauses: LEGAL_CLAUSES,
            }),
          });

          if (!res.ok) {
            let errorMsg =
              "Analysis failed. Server responded with an unexpected error.";
            try {
              const errorData = await res.json();
              errorMsg = errorData.error || errorMsg;
            } catch {
              try {
                const rawText = await res.text();
                errorMsg = `Analysis failed (Status: ${res.status} ${res.statusText
                  }). Response: ${rawText.substring(0, 200)}...`;
              } catch {
                errorMsg = `Analysis failed (Status: ${res.status} ${res.statusText}). Could not read response.`;
              }
            }
            throw new Error(errorMsg);
          }

          const data = await res.json();
          // Ensure arrays are indeed arrays, even if LLM provides empty or non-array values
          setResult({
            summary: data.summary || "No summary provided.",
            entities: Array.isArray(data.entities) ? data.entities : [],
            clauses: Array.isArray(data.clauses) ? data.clauses : [],
            risk: data.risk || "No risk assessment provided.",
            suggestions: Array.isArray(data.suggestions)
              ? data.suggestions
              : [],
          });
        } catch (err) {
          let userMessage = "Analysis failed. Please try again.";

          if (
            err instanceof TypeError &&
            err.message.includes("fetch failed")
          ) {
            userMessage =
              "Network error: Could not connect to the analysis service. Please check your internet connection.";
          } else if (err.message) {
            userMessage = err.message;
          }
          setError(userMessage);
        } finally {
          setLoading(false);
          setLoadingMessage(""); // Clear loading message on completion or error
        }
      };

      reader.onerror = () => {
        setLoading(false);
        setLoadingMessage("");
        setError("Failed to read file. Please ensure it's a valid document.");
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setLoading(false);
      setLoadingMessage("");
      setError(
        err.message || "Failed to start document analysis. Please try again."
      );
    }
  };

  return (
    <ToolPageLayout
      title="AI Legal Document Analyzer"
      subtitle="Leverage the power of AI to quickly analyze your legal documents. Our tool provides a concise summary, identifies key entities and clauses, assesses potential risks, and offers actionable suggestions."
      toolName="AI Legal Document Analyzer"
      toolDescription="Leverage the power of AI to quickly analyze your legal documents. Our tool provides a concise summary, identifies key entities and clauses, assesses potential risks, and offers actionable suggestions. Ideal for contracts, agreements, and other legal texts, this tool helps you understand complex documents faster and more efficiently. Your document is uploaded to the easy-pdf analysis route and the extracted text is sent to an external AI provider for analysis; easy-pdf does not store the uploaded file after processing."
      steps={[
        "Upload your legal document (PDF, Word, or image format) using the drag-and-drop zone or by clicking to select a file.",
        "Click the 'Analyze Document' button. Our AI will process the content to extract relevant information.",
        "Review the comprehensive analysis report, which includes a summary, key entities, detected clauses, a risk assessment, and practical suggestions.",
        "Optionally, download the full analysis report as a text file for your records.",
      ]}
      faqs={[
        {
          question: "Is this tool a substitute for professional legal advice?",
          answer:
            "No, this AI Legal Document Analyzer is for informational purposes only and should not be considered a substitute for professional legal advice. Always consult with a qualified legal professional for specific legal guidance.",
        },
        {
          question: "How secure are my documents during analysis?",
          answer:
            "Your document is uploaded to the easy-pdf analysis route and the extracted text is sent to an external AI provider for analysis. easy-pdf does not store the uploaded file after processing, but this tool is not a fully local in-browser workflow.",
        },
        {
          question: "What types of legal documents can I analyze?",
          answer:
            "You can analyze a wide range of legal documents, including contracts, agreements, terms of service, policies, and more. The tool supports PDF, Microsoft Word (.doc, .docx), and common image formats (JPG, PNG).",
        },
        {
          question: "What kind of insights does the AI provide?",
          answer:
            "The AI provides a concise summary of the document, identifies key entities (like parties, dates, and amounts), lists detected legal clauses, offers a risk assessment (e.g., low, moderate, high), and provides actionable suggestions based on its analysis.",
        },
        {
          question: "Is there a limit to the document size or length?",
          answer:
            "While there isn't a strict page limit, very large or complex documents may take longer to process. The maximum file size for upload is 50MB. For optimal performance, we recommend documents of reasonable length.",
        },
      ]}
      currentTool="legal-analyzer"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Legal Analyzer', href: '/legal-analyzer' }
      ]}
    >
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-lg">
            Upload your legal document (PDF, Word, or image). Our AI will
            extract key points, highlight important clauses, assess risk, and
            generate a summary report.
            <b>
              Your document content is sent to an external AI service for analysis and is not stored by easy-pdf.
            </b>
          </p>
        </div>
        <FileDropzone
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onFiles={handleFile}
          setError={setError}
          aria-label="Upload legal document"
          isLoading={loading}
        />
        {file && (
          <div className="mt-4 flex items-center justify-between p-3 bg-background shadow-md border border-border">
            <span className="text-sm truncate pr-2 text-foreground">
              {file.name}
            </span>
            <Button
              size="sm"
              onClick={() => setFile(null)}
              variant="outline"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive"
            >
              Remove
            </Button>
          </div>
        )}
        {loading && (
          <div className="mt-8 text-center flex items-center justify-center">
            <Loader
              size="sm"
              color="gray"
              className="inline-block mr-2"
              message={loadingMessage || "Processing document..."}
            />
          </div>
        )}
        <Button
          className="mt-3 w-full py-3 px-6 text-lg font-semibold shadow-xl
                       bg-gradient-to-r from-gray-700 to-indigo-600 hover:from-gray-800 hover:to-indigo-700
                       text-foreground transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
          onClick={analyzeDocument}
          disabled={!file || loading}
          aria-label="Analyze Document"
        >
          {loading ? "Analyzing..." : "Analyze Document"}
        </Button>
        {error && (
          <Alert className="mt-6" variant="destructive">
            {error}
          </Alert>
        )}
        {result && (
          <Card className="mt-10 p-8 bg-background shadow-xl border border-border">
            <h2 className="text-3xl font-bold mb-4 text-center text-foreground">
              Analysis Report
            </h2>
            <Alert className="mb-6 p-4 bg-yellow-900/30 text-yellow-300 border border-yellow-700">
              <p className="text-sm text-center">
                <strong>Important:</strong> This analysis is performed by an external AI service (OpenRouter). While your document is not stored by easy-pdf, its content is sent to this external service for processing. Please review OpenRouter&apos;s privacy policy for more details.
              </p>
            </Alert>
            <div className="mb-6 border-b border-border pb-4">
              <h3 className="text-foreground block mb-2 text-lg items-center">
                <FileText className="w-6 h-6 inline-block mr-2 text-foreground" />{" "}
                Summary:
              </h3>
              <p className="whitespace-pre-line leading-relaxed text-foreground">
                {result.summary}
              </p>
            </div>
            <div className="mb-6 border-b border-border pb-4">
              <h3 className="text-foreground block mb-2 text-lg items-center">
                <Users className="w-6 h-6 inline-block mr-2 text-foreground" />{" "}
                Key Entities:
              </h3>
              {result.entities && result.entities.length > 0 ? (
                <ul className="list-disc ml-6 space-y-1 text-foreground">
                  {result.entities.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-foreground">
                  No key entities detected.
                </p>
              )}
            </div>
            <div className="mb-6 border-b border-border pb-4">
              <h3 className="text-foreground block mb-2 text-lg items-center">
                <ScrollText className="w-6 h-6 inline-block mr-2 text-foreground" />{" "}
                Detected Clauses:
              </h3>
              {result.clauses && result.clauses.length > 0 ? (
                <ul className="list-disc ml-6 space-y-1 text-foreground">
                  {result.clauses.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-foreground">
                  No specific clauses detected or mentioned.
                </p>
              )}
            </div>
            <div className="mb-6 border-b border-border pb-4">
              <h3 className="text-foreground block mb-2 text-lg items-center">
                <ShieldAlert className="w-6 h-6 inline-block mr-2 text-foreground" />{" "}
                Risk Assessment:
              </h3>
              <p
                className={`${getRiskColorClass(
                  result.risk
                )} whitespace-pre-line leading-relaxed`}
              >
                {result.risk}
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-foreground block mb-2 text-lg items-center">
                <Lightbulb className="w-6 h-6 inline-block mr-2 text-foreground" />{" "}
                Suggestions:
              </h3>
              {result.suggestions && result.suggestions.length > 0 ? (
                <ul className="list-disc ml-6 space-y-1 text-foreground">
                  {result.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-foreground">
                  No specific suggestions provided.
                </p>
              )}
            </div>
            <Button
              className="mt-6 w-full py-3 px-6 text-lg font-semibold shadow-xl
                         bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600
                         text-foreground transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={() => {
                const blob = new Blob(
                  [
                    `Summary:\n${result.summary}\n\nKey Entities:\n${result.entities?.join(", ")}\n\nDetected Clauses:\n${result.clauses?.join(", ")}\n\nRisk Assessment:\n${result.risk}\n\nSuggestions:\n${result.suggestions?.join("\n")}`,
                  ],
                  { type: "text/plain" }
                );
                let url = null;
                try {
                  url = safeCreateObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url || '';
                  const safeBase = String(file?.name || 'analysis').replace(/\s+/g, '-')
                    .replace(/[^a-zA-Z0-9\-_.]/g, '');
                  a.download = `legal-analysis-${safeBase}.txt`;
                  // append to DOM to improve cross-browser behavior
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                } catch {
                  toast.error('Failed to download the report. Please try again.');
                } finally {
                  // Revoke object URL after a short delay
                  setTimeout(() => {
                    try { if (url) safeRevokeObjectURL(url); } catch { /* ignore */ }
                  }, 500);
                }
              }}
              aria-label="Download Report"
            >
              Download Report
            </Button>
          </Card>
        )}
        <Alert className="block mt-10 p-6 bg-background text-foreground border border-border italic text-sm text-center">
          <b className="text-foreground mb-2 not-italic">Disclaimer:</b>
          <div>
            This tool uses AI (OpenRouter) to assist with legal document
            analysis. Results are for informational purposes only and do not
            constitute legal advice. Your documents are processed securely and
            never stored.
          </div>
        </Alert>
      </div>
    </ToolPageLayout>
  );
}
