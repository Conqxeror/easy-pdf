import React from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";
import { resolveSiteUrl } from "@/lib/siteUrl";

const siteUrl = resolveSiteUrl();

const securityFaqs = [
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
    question: "Is the code transparent?",
    answer: "Yes, our codebase is available for review on GitHub to verify our privacy claims and understand exactly how the application works. This transparency ensures there are no hidden processes."
  },
  {
    question: "What technologies are used to ensure client-side processing?",
    answer: "We leverage powerful JavaScript libraries like pdf-lib and pdfjs-dist, which enable robust PDF manipulation directly within the browser environment, eliminating the need for server interaction for core PDF functionalities."
  }
];

export const metadata = generateEnhancedMetadata({
  title: "Security & Privacy Policy - easy-pdf | 100% Client-Side PDF Tools",
  description: "Learn about easy-pdf's commitment to your privacy and data security. All processing is client-side, ensuring your files never leave your device. Complete transparency and security with no file uploads.",
  keywords: [
    "PDF security", "privacy policy", "client-side processing", "data protection", "online PDF tools security",
    "document privacy", "file security", "no upload PDF tools", "browser-based security", "GDPR compliant",
    "secure PDF processing", "privacy-first tools", "data encryption", "document confidentiality",
    "zero data collection", "PDF privacy protection", "browser-based PDF security", "secure document processing"
  ],
  canonicalUrl: `${siteUrl}/security`,
  metadataBaseUrl: siteUrl,
  pageType: "article",
  breadcrumbs: [
    { name: "Home", url: siteUrl },
    { name: "Security", url: `${siteUrl}/security` }
  ]
});

const structuredData = generateComprehensiveJsonLd('faq', {
  title: "Security & Privacy Policy - easy-pdf",
  description: "Learn about easy-pdf's commitment to your privacy and data security.",
  url: `${siteUrl}/security`,
  faqs: securityFaqs
});

export default function SecurityPage() {
  // structuredData already includes FAQ information; constants removed to avoid duplicate unused vars

  const toolName = "Security & Privacy Policy";
  const toolDescription = "Your privacy and data security are our top priorities. Learn how easy-pdf protects your sensitive documents with 100% client-side processing, ensuring your files never leave your device.";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: (() => {
          try {
            return JSON.stringify(structuredData, (_k, v) => (typeof v === 'function' ? undefined : v));
          } catch {
            // fallback to minimal structure
            try { return JSON.stringify({ '@type': 'FAQPage' }); } catch { return '{}'; }
          }
        })() }}
      />
      <ToolPageLayout
        title="Security & Privacy Policy"
        subtitle="Your privacy and data security are our top priorities. Learn how easy-pdf protects your sensitive documents with 100% client-side processing."
        toolName={toolName}
        toolDescription={toolDescription}
        currentTool="security"
        faqs={securityFaqs}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Security', href: '/security' }
        ]}
      />
    </>
  );
}