import React from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ToolPageContent from "@/components/ui/ToolPageContent";
import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Security & Privacy Policy - easy-pdf | 100% Client-Side PDF Tools",
  description: "Learn about easy-pdf's commitment to your privacy and data security. All processing is client-side, ensuring your files never leave your device. Complete transparency and security with no file uploads.",
  keywords: [
    "PDF security", "privacy policy", "client-side processing", "data protection", "online PDF tools security",
    "document privacy", "file security", "no upload PDF tools", "browser-based security", "GDPR compliant",
    "secure PDF processing", "privacy-first tools", "data encryption", "document confidentiality",
    "zero data collection", "PDF privacy protection", "browser-based PDF security", "secure document processing"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/security",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  pageType: "article",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Security", url: "https://easy-pdf-murex.vercel.app/security" }
  ]
});

const structuredData = generateComprehensiveJsonLd('faq', {
  faqs: [
    {
      question: "How does easy-pdf ensure my files are secure?",
      answer: "easy-pdf operates entirely client-side. This means all PDF processing—merging, splitting, compressing, converting, etc.—happens directly in your web browser. Your files are never uploaded to our servers, ensuring they remain on your device and under your control."
    },
    {
      question: "Do you store my documents?",
      answer: "No. We do not store, collect, or transmit your documents or any data from them. Once you close your browser tab or navigate away, your document data is gone."
    },
    {
      question: "What about cookies and tracking?",
      answer: "We use minimal, essential cookies for the proper functioning of the website (e.g., for dark mode preferences). We do not use tracking cookies or collect personal identifiable information. Our analytics are privacy-focused and anonymized."
    },
    {
      question: "Is easy-pdf open source?",
      answer: "Yes, easy-pdf is open source. You can review our codebase on GitHub to verify our privacy claims and understand exactly how the application works. This transparency ensures there are no hidden processes."
    },
    {
      question: "What technologies are used to ensure client-side processing?",
      answer: "We leverage powerful JavaScript libraries like pdf-lib and pdfjs-dist, which enable robust PDF manipulation directly within the browser environment, eliminating the need for server interaction for core PDF functionalities."
    }
  ]
});

export default function SecurityPage() {
  const faqs = [
    {
      question: "How does easy-pdf ensure my files are secure?",
      answer:
        "easy-pdf operates entirely client-side. This means all PDF processing—merging, splitting, compressing, converting, etc.—happens directly in your web browser. Your files are never uploaded to our servers, ensuring they remain on your device and under your control.",
    },
    {
      question: "Do you store my documents?",
      answer:
        "No. We do not store, collect, or transmit your documents or any data from them. Once you close your browser tab or navigate away, your document data is gone.",
    },
    {
      question: "What about cookies and tracking?",
      answer:
        "We use minimal, essential cookies for the proper functioning of the website (e.g., for dark mode preferences). We do not use tracking cookies or collect personal identifiable information. Our analytics are privacy-focused and anonymized.",
    },
    {
      question: "Is easy-pdf open source?",
      answer:
        "Yes, easy-pdf is open source. You can review our codebase on GitHub to verify our privacy claims and understand exactly how the application works. This transparency ensures there are no hidden processes.",
    },
    {
      question: "What technologies are used to ensure client-side processing?",
      answer:
        "We leverage powerful JavaScript libraries like pdf-lib and pdfjs-dist, which enable robust PDF manipulation directly within the browser environment, eliminating the need for server interaction for core PDF functionalities.",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="container max-w-4xl py-8 mx-auto">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={[{ name: "Security", url: "/security" }]} />
        
        <ToolPageContent
          toolName="Security & Privacy Policy"
          toolDescription="Your privacy and data security are our top priorities. Learn how easy-pdf protects your sensitive documents with 100% client-side processing, ensuring your files never leave your device."
          currentTool="security"
          steps={[
            "All PDF processing happens directly in your browser - no server uploads required.",
            "Your files remain on your device throughout the entire process.",
            "No data collection, storage, or transmission of your documents.",
            "Open source codebase available for transparency and verification.",
          ]}
          faqs={faqs}
        />
      </main>
    </>
  );
}