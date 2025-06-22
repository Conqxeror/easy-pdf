// src/app/legal-analyzer/page.js
"use client";

import React, { useState } from "react";
import MetaHead from "@/components/ui/MetaHead";
import { Button } from "@/components/ui/button";
import FileDropzone from "@/components/ui/FileDropzone";
import Loader from "@/components/ui/Loader";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

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
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFile = (f) => {
    const selectedFile = f && f.length > 0 ? f[0] : null;
    setFile(selectedFile);
    setResult(null);
    setError(""); // Clear error when a new file is dropped
  };

  const analyzeDocument = async () => {
    if (!file) {
      setError("Please select a file to analyze.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onloadstart = () => setLoading(true);
      reader.onloadend = async (e) => {
        try {
          const base64 = e.target.result.split(",")[1];
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
            let errorMsg = "Analysis failed. Server responded with an error.";
            try {
              const errorData = await res.json();
              errorMsg = errorData.error || errorMsg;
            } catch (jsonParseError) {
              try {
                const rawText = await res.text();
                errorMsg = `Analysis failed: Server responded with status ${
                  res.status
                } ${res.statusText}. Raw response: ${rawText.substring(
                  0,
                  200
                )}...`;
              } catch (textParseError) {
                errorMsg = `Analysis failed: Server responded with status ${res.status} ${res.statusText}. Could not read response.`;
              }
            }
            throw new Error(errorMsg);
          }

          const data = await res.json();
          setResult(data);
        } catch (err) {
          console.error("Analysis inner error:", err);
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
        }
      };
      reader.onerror = () => {
        setError("Failed to read file. Please try again.");
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Analysis outer error:", err);
      setError(err.message || "Failed to analyze document. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <MetaHead
        title="Legal Document Analyzer | AI-powered Legal Review Tool"
        description="Upload and analyze legal documents with AI. Summarize, extract clauses, assess risk, and get a report. 100% privacy-first."
        ogTitle="Legal Document Analyzer"
        ogDescription="AI-powered tool to analyze, summarize, and review legal documents."
        ogImage="/icon.png"
        twitterCard="summary_large_image"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Legal Document Analyzer",
          description:
            "AI-powered tool to analyze, summarize, and review legal documents.",
          applicationCategory: "LegalService",
          url: "https://easy-pdf.in/legal-analyzer",
        }}
      />
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-12 md:py-20 px-4">
        <div className="max-w-2xl w-full">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            AI Legal Document Analyzer
          </h1>
          <p className="mb-8 text-lg text-gray-300 text-center">
            Upload your legal document (PDF, Word, or image). Our AI will
            extract key points, highlight important clauses, assess risk, and
            generate a summary report.{" "}
            <b className="text-blue-300">
              Your data is secure and never stored.
            </b>
          </p>
          <FileDropzone
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onFiles={(files) => handleFile(files)}
            setError={setError}
            aria-label="Upload legal document"
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
          <p className="mt-8">wait 1-2 minutes for the process...</p>
          <Button
            className="mt-3 w-full py-3 px-6 text-lg font-semibold rounded-lg shadow-xl
                       bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                       text-white transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
            onClick={analyzeDocument}
            disabled={!file || loading}
            aria-label="Analyze Document"
          >
            {loading ? <Loader size="sm" color="white" /> : "Analyze Document"}
          </Button>
          {error && (
            <Alert className="mt-6" variant="destructive">
              {error}
            </Alert>
          )}
          {result && (
            <Card className="mt-10 p-8 bg-gray-800 text-gray-200 rounded-lg shadow-xl border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">
                Analysis Report
              </h2>
              <div className="mb-6 border-b border-gray-700 pb-4">
                <b className="text-blue-300 block mb-2 text-lg">Summary:</b>
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                  {result.summary}
                </p>
              </div>
              <div className="mb-6 border-b border-gray-700 pb-4">
                <b className="text-blue-300 block mb-2 text-lg">
                  Key Entities:
                </b>
                <ul className="list-disc ml-6 text-gray-300 space-y-1">
                  {result.entities?.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-6 border-b border-gray-700 pb-4">
                <b className="text-blue-300 block mb-2 text-lg">
                  Detected Clauses:
                </b>
                <ul className="list-disc ml-6 text-gray-300 space-y-1">
                  {result.clauses?.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-6 border-b border-gray-700 pb-4">
                <b className="text-blue-300 block mb-2 text-lg">
                  Risk Assessment:
                </b>
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                  {result.risk}
                </p>
              </div>
              <div className="mb-6">
                <b className="text-blue-300 block mb-2 text-lg">Suggestions:</b>
                <ul className="list-disc ml-6 text-gray-300 space-y-1">
                  {result.suggestions?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
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
            </Card>
          )}
          <Alert className="block mt-10 p-6 bg-gray-800/70 text-gray-400 rounded-lg border border-gray-700 italic text-sm text-center">
            <b className="text-gray-200 mb-2 not-italic">Disclaimer:</b>
            <div>
              This tool uses AI (OpenRouter) to assist with legal document
              analysis. Results are for informational purposes only and do not
              constitute legal advice. Your documents are processed securely and
              never stored.
            </div>
          </Alert>
        </div>
      </div>
    </>
  );
}
