import React from "react";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Medical Document AI Analysis - easy-pdf",
  description: "AI-powered tool for medical document review and key information extraction. Secure and private processing.",
  keywords: [
    "medical document analysis",
    "AI medical",
    "healthcare AI",
    "medical record analysis",
    "patient data extraction",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/medical-analyzer",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

export default function MedicalAnalyzerLayout({ children }) {
  return <>{children}</>;
}
