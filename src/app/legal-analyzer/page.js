"use client";

import { Metadata } from 'next';
// src/app/legal-analyzer/page.js

import React, { useState, useCallback } from "react";


import { Button } from "@/components/ui/button";
import FileDropzone from "@/components/ui/FileDropzone";
import Loader from "@/components/ui/Loader";
import { Card } from "@/components/ui/card";
import {
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
// Import lucide-react icons
import {
  FileText,
  Users,
  ScrollText,
  ShieldAlert,
  Lightbulb,
} from "lucide-react";
import ToolPageContent from "@/components/ui/ToolPageContent";

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

export default function LegalAnalyzerPage() {
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
    return "text-gray-300"; // Default color
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
            } catch (jsonParseError) {
              try {
                const rawText = await res.text();
                errorMsg = `Analysis failed (Status: ${res.status} ${
                  res.statusText
                }). Response: ${rawText.substring(0, 200)}...`;
              } catch (textParseError) {
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
          console.error("Analysis processing error:", err);
          let userMessage = "Failed to analyze document. Please try again.";

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
        console.error("FileReader error:", reader.error);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Analysis initiation error:", err);
      setLoading(false);
      setLoadingMessage("");
      setError(
        err.message || "Failed to start document analysis. Please try again."
      );
    }
  };

  return (
    <>
      <main className="container max-w-4xl py-8 mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              AI Legal Document Analyzer
            </CardTitle>
            <CardDescription className="text-lg text-gray-300 text-center mt-2">
              Upload your legal document (PDF, Word, or image). Our AI will
              extract key points, highlight important clauses, assess risk, and
              generate a summary report.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="block p-4 bg-yellow-900/20 text-yellow-300 border border-yellow-700 rounded-lg">
              <p className="text-sm text-center">
                <b className="text-blue-300">
                  Your document content is sent to an external AI service for analysis and is not stored by easy-pdf.
                </b>
              </p>
            </Alert>
            <FileDropzone
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onFiles={handleFile}
              setError={setError}
              aria-label="Upload legal document"
              isLoading={loading}
            />
            {file && (
              <div className="mt-4 flex items-center justify-between p-3 bg-gray-800 rounded-md shadow-md border border-gray-700">
                <span className="text-sm text-gray-200 truncate pr-2">
                  {file.name}
                </span>
                <Button
                  size="sm"
                  onClick={() => setFile(null)}
                  variant="outline"
                  className="bg-red-600 hover:bg-red-700 text-white border-red-700"
                >
                  Remove
                </Button>
              </div>
            )}
            {loading && (
              <div className="mt-8 text-center text-gray-400 flex items-center justify-center">
                <Loader
                  size="sm"
                  color="gray"
                  className="inline-block mr-2"
                  message={loadingMessage || "Processing document..."}
                />
              </div>
            )}
            <Button
              className="mt-3 w-full py-3 px-6 text-lg font-semibold rounded-lg shadow-xl
                         bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                         text-white transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
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
          </CardContent>

          {result && (
            <CardFooter className="flex flex-col gap-4 border-t border-gray-700 pt-6">
              <Card className="w-full p-8 bg-gray-800 text-gray-200 rounded-lg shadow-xl border border-gray-700">
              <h2 className="text-3xl font-bold mb-4 text-center text-blue-400">
                Analysis Report
              </h2>
              <Alert className="mb-6 p-4 bg-yellow-900/20 text-yellow-300 border border-yellow-700 rounded-lg">
                <p className="text-sm text-center">
                  <strong>Important:</strong> This analysis is performed by an external AI service (OpenRouter). While your document is not stored by easy-pdf, its content is sent to this external service for processing. Please review OpenRouter&apos;s privacy policy for more details.
                </p>
              </Alert>
              <div className="mb-6 border-b border-gray-700 pb-4">
                <h3 className="text-blue-300 block mb-2 text-lg items-center">
                  <FileText className="w-6 h-6 inline-block mr-2 text-blue-400" />{" "}
                  Summary:
                </h3>
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                  {result.summary}
                </p>
              </div>
              <div className="mb-6 border-b border-gray-700 pb-4">
                <h3 className="text-blue-300 block mb-2 text-lg items-center">
                  <Users className="w-6 h-6 inline-block mr-2 text-blue-400" />{" "}
                  Key Entities:
                </h3>
                {result.entities && result.entities.length > 0 ? (
                  <ul className="list-disc ml-6 text-gray-300 space-y-1">
                    {result.entities.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">
                    No key entities detected.
                  </p>
                )}
              </div>
              <div className="mb-6 border-b border-gray-700 pb-4">
                <h3 className="text-blue-300 block mb-2 text-lg items-center">
                  <ScrollText className="w-6 h-6 inline-block mr-2 text-blue-400" />{" "}
                  Detected Clauses:
                </h3>
                {result.clauses && result.clauses.length > 0 ? (
                  <ul className="list-disc ml-6 text-gray-300 space-y-1">
                    {result.clauses.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">
                    No specific clauses detected or mentioned.
                  </p>
                )}
              </div>
              <div className="mb-6 border-b border-gray-700 pb-4">
                <h3 className="text-blue-300 block mb-2 text-lg items-center">
                  <ShieldAlert className="w-6 h-6 inline-block mr-2 text-blue-400" />{" "}
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
                <h3 className="text-blue-300 block mb-2 text-lg items-center">
                  <Lightbulb className="w-6 h-6 inline-block mr-2 text-blue-400" />{" "}
                  Suggestions:
                </h3>
                {result.suggestions && result.suggestions.length > 0 ? (
                  <ul className="list-disc ml-6 text-gray-300 space-y-1">
                    {result.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">
                    No specific suggestions provided.
                  </p>
                )}
              </div>
              <Button
                className="mt-6 w-full py-3 px-6 text-lg font-semibold rounded-lg shadow-xl
                           bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700
                           text-white transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900"
                onClick={() => {
                  const blob = new Blob(
                    [
                      `Summary:\n${
                        result.summary
                      }\n\nKey Entities:\n${result.entities?.join(
                        ", "
                      )}\n\nDetected Clauses:\n${result.clauses?.join(
                        ", "
                      )}\n\nRisk Assessment:\n${
                        result.risk
                      }\n\nSuggestions:\n${result.suggestions?.join("\n")}`,
                    ],
                    { type: "text/plain" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `legal-analysis-${file.name}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                aria-label="Download Report"
              >
                Download Report
              </Button>
              
              <Alert className="block mt-6 p-6 bg-gray-800/70 text-gray-400 rounded-lg border border-gray-700 italic text-sm text-center">
                <b className="text-gray-200 mb-2 not-italic">Disclaimer:</b>
                <div>
                  This tool uses AI (OpenRouter) to assist with legal document
                  analysis. Results are for informational purposes only and do not
                  constitute legal advice. Your documents are processed securely and
                  never stored.
                </div>
              </Alert>
              </Card>
            </CardFooter>
          )}
        </Card>
        
        <ToolPageContent
          toolName="AI Legal Document Analyzer"
          toolDescription="Leverage the power of AI to quickly analyze your legal documents. Our tool provides a concise summary, identifies key entities and clauses, assesses potential risks, and offers actionable suggestions. Ideal for contracts, agreements, and other legal texts, this tool helps you understand complex documents faster and more efficiently. Your privacy is paramount: all analysis is performed securely, and your documents are never stored."
          currentTool="legal-analyzer"
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
                "Your privacy and data security are our top priorities. All document processing and AI analysis are performed securely, and your documents are never stored on our servers. They are processed in a temporary, isolated environment.",
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
        />
      </main>
    </>
  );
}