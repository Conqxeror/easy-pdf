"use client";
import { Metadata } from "next";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import FileDropzone from "@/components/ui/FileDropzone";
import Loader from "@/components/ui/Loader";


import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import {
  FileHeart,
  Stethoscope,
  User,
  Calendar,
  FlaskConical,
} from "lucide-react";
import ToolPageContent from "@/components/ui/ToolPageContent";

export default function MedicalAnalyzerPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFile = useCallback((f) => {
    const selectedFile = f && f.length > 0 ? f[0] : null;
    setFile(selectedFile);
    setResult(null);
    setError("");
    setLoadingMessage("");
  }, []);

  const analyzeDocument = async () => {
    if (!file) {
      setError("Please select a file to analyze.");
      return;
    }

    setLoading(true);
    setLoadingMessage("Uploading document...");
    setError("");
    setResult(null);

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
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Dynamically import pdfjs-dist only if the file is a PDF
          if (file.type === "application/pdf") {
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.js`;
            // You might need to do something with the PDF here, e.g., extract text
            // For now, just setting the workerSrc
          }

          setLoadingMessage("Analyzing medical document with AI...");
          const res = await fetch("/api/medical-analyzer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file: base64,
              name: file.name,
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
          setResult({
            summary: data.summary || "No summary provided.",
            patientInfo: Array.isArray(data.patientInfo)
              ? data.patientInfo
              : [],
            diagnoses: Array.isArray(data.diagnoses) ? data.diagnoses : [],
            medications: Array.isArray(data.medications)
              ? data.medications
              : [],
            labResults: Array.isArray(data.labResults) ? data.labResults : [],
            recommendations: Array.isArray(data.recommendations)
              ? data.recommendations
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
          setLoadingMessage("");
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
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-12 md:py-20 px-4">
        <div className="max-w-2xl w-full">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Medical Document AI Analyzer
          </h1>
          <p className="mb-8 text-lg text-gray-300 text-center">
            Upload your medical document (PDF, Word, or image). Our AI will
            extract key patient information, diagnoses, medications, and more.
            <b className="text-pink-300">
              Your document content is sent to an external AI service for
              analysis and is not stored by easy-pdf.
            </b>
          </p>
          <FileDropzone
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onFiles={handleFile}
            setError={setError}
            aria-label="Upload medical document"
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
                       bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700
                       text-white transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900"
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
            <Card className="mt-10 p-8 bg-gray-800 text-gray-200 rounded-lg shadow-xl border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 text-center text-red-400">
                Analysis Report
              </h2>
              <Alert className="block mb-6 p-4 bg-yellow-900/20 text-yellow-300 border border-yellow-700 rounded-lg">
                <p className="text-sm text-center">
                  <div className="font-semibold mb-2">
                    <b>Important:</b>
                  </div>
                  <div>
                    This analysis is performed by an external AI service
                    (OpenRouter). While your document is not stored by easy-pdf,
                    its content is sent to this external service for processing.
                    Please review OpenRouter&apos;s privacy policy for more
                    details.
                  </div>
                </p>
              </Alert>
              <div className="mb-6 border-b border-gray-700 pb-4">
                <h3 className="text-red-300 block mb-2 text-lg items-center">
                  <FileHeart className="w-6 h-6 inline-block mr-2 text-red-400" />{" "}
                  Summary:
                </h3>
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                  {result.summary}
                </p>
              </div>
              <div className="mb-6 border-b border-gray-700 pb-4">
                <h3 className="text-red-300 block mb-2 text-lg items-center">
                  <User className="w-6 h-6 inline-block mr-2 text-red-400" />{" "}
                  Patient Information:
                </h3>
                {result.patientInfo && result.patientInfo.length > 0 ? (
                  <ul className="list-disc ml-6 text-gray-300 space-y-1">
                    {result.patientInfo.map((info, i) => (
                      <li key={i}>{info}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">
                    No patient information extracted.
                  </p>
                )}
              </div>
              <div className="mb-6 border-b border-gray-700 pb-4">
                <h3 className="text-red-300 block mb-2 text-lg items-center">
                  <Stethoscope className="w-6 h-6 inline-block mr-2 text-red-400" />{" "}
                  Diagnoses:
                </h3>
                {result.diagnoses && result.diagnoses.length > 0 ? (
                  <ul className="list-disc ml-6 text-gray-300 space-y-1">
                    {result.diagnoses.map((diag, i) => (
                      <li key={i}>{diag}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">
                    No diagnoses extracted.
                  </p>
                )}
              </div>
              <div className="mb-6 border-b border-gray-700 pb-4">
                <h3 className="text-red-300 block mb-2 text-lg items-center">
                  <FlaskConical className="w-6 h-6 inline-block mr-2 text-red-400" />{" "}
                  Lab Results:
                </h3>
                {result.labResults && result.labResults.length > 0 ? (
                  <ul className="list-disc ml-6 text-gray-300 space-y-1">
                    {result.labResults.map((lab, i) => (
                      <li key={i}>{lab}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">
                    No lab results extracted.
                  </p>
                )}
              </div>
              <div className="mb-6 border-b border-gray-700 pb-4">
                <h3 className="text-red-300 block mb-2 text-lg items-center">
                  <Calendar className="w-6 h-6 inline-block mr-2 text-red-400" />{" "}
                  Medications:
                </h3>
                {result.medications && result.medications.length > 0 ? (
                  <ul className="list-disc ml-6 text-gray-300 space-y-1">
                    {result.medications.map((med, i) => (
                      <li key={i}>{med}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">
                    No medications extracted.
                  </p>
                )}
              </div>
              <div className="mb-6">
                <h3 className="text-red-300 block mb-2 text-lg items-center">
                  <Stethoscope className="w-6 h-6 inline-block mr-2 text-red-400" />{" "}
                  Recommendations:
                </h3>
                {result.recommendations && result.recommendations.length > 0 ? (
                  <ul className="list-disc ml-6 text-gray-300 space-y-1">
                    {result.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">
                    No recommendations provided.
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
                      }\n\nPatient Information:\n${result.patientInfo?.join(
                        "\n"
                      )}\n\nDiagnoses:\n${result.diagnoses?.join(
                        "\n"
                      )}\n\nMedications:\n${result.medications?.join(
                        "\n"
                      )}\n\nLab Results:\n${result.labResults?.join(
                        "\n"
                      )}\n\nRecommendations:\n${result.recommendations?.join(
                        "\n"
                      )}`,
                    ],
                    { type: "text/plain" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `medical-analysis-${file.name}.txt`;
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
              This tool uses AI (OpenRouter) to assist with medical document
              analysis. Results are for informational purposes only and do not
              constitute medical advice. Your documents are processed securely
              and never stored.
            </div>
          </Alert>
        </div>
        <ToolPageContent
          toolName="Medical Document AI Analyzer"
          toolDescription="Leverage the power of AI to quickly analyze your medical documents. Our tool provides a concise summary, identifies key patient information, diagnoses, medications, lab results, and offers recommendations. Your privacy is paramount: all analysis is performed securely, and your documents are never stored."
          currentTool="medical-analyzer"
          steps={[
            "Upload your medical document (PDF, Word, or image format) using the drag-and-drop zone or by clicking to select a file.",
            "Click the 'Analyze Document' button. Our AI will process the content to extract relevant information.",
            "Review the comprehensive analysis report, which includes a summary, patient information, diagnoses, medications, lab results, and recommendations.",
            "Optionally, download the full analysis report as a text file for your records.",
          ]}
          faqs={[
            {
              question:
                "Is this tool a substitute for professional medical advice?",
              answer:
                "No, this AI Medical Document Analyzer is for informational purposes only and should not be considered a substitute for professional medical advice. Always consult with a qualified medical professional for specific medical guidance.",
            },
            {
              question: "How secure are my documents during analysis?",
              answer:
                "Your privacy and data security are our top priorities. All document processing and AI analysis are performed securely, and your documents are never stored on our servers. They are processed in a temporary, isolated environment.",
            },
            {
              question: "What types of medical documents can I analyze?",
              answer:
                "You can analyze a wide range of medical documents, including patient records, lab results, prescriptions, and more. The tool supports PDF, Microsoft Word (.doc, .docx), and common image formats (JPG, PNG).",
            },
            {
              question: "What kind of insights does the AI provide?",
              answer:
                "The AI provides a concise summary of the document, identifies key patient information (like name, age, gender), lists diagnoses, medications, lab results, and provides recommendations based on its analysis.",
            },
            {
              question: "Is there a limit to the document size or length?",
              answer:
                "While there isn't a strict page limit, very large or complex documents may take longer to process. The maximum file size for upload is 50MB. For optimal performance, we recommend documents of reasonable length.",
            },
          ]}
        />
      </div>
    </>
  );
}