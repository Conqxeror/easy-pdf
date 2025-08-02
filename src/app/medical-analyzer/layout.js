import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
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

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Medical Document AI Analysis",
  description: "AI-powered tool for medical document review and key information extraction. Secure and private processing.",
  url: "/medical-analyzer",
  features: [
    "AI-powered analysis",
    "Patient data extraction",
    "Diagnosis identification",
    "Health insights"
  ]
});

export default function MedicalAnalyzerLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}