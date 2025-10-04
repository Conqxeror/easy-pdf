import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/pdf-accessibility-checker');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What accessibility standards does this tool check?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The tool checks for WCAG 2.1 compliance, including document structure, image alt text, color contrast, reading order, form accessibility, and proper tagging for screen readers."
      }
    },
    {
      "@type": "Question",
      "name": "What does the accessibility score mean?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The accessibility score (0-100) indicates how well your PDF meets accessibility standards. Scores 80+ are good, 60-79 need improvement, and below 60 require significant accessibility enhancements."
      }
    },
    {
      "@type": "Question",
      "name": "Can I fix accessibility issues with this tool?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "This tool identifies accessibility issues and provides recommendations, but you'll need to use other PDF editing tools to implement the fixes. The tool helps you understand what needs to be improved."
      }
    },
    {
      "@type": "Question",
      "name": "What types of accessibility issues are most critical?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Critical issues include missing document titles, untagged PDFs, missing image alt text, and unlabeled form fields. These prevent screen readers from properly interpreting your content."
      }
    },
    {
      "@type": "Question",
      "name": "Is the accessibility analysis secure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, all analysis happens locally in your browser. Your PDF files are never uploaded to our servers, ensuring complete privacy and security for your sensitive documents."
      }
    }
  ]
};

export default function PDFAccessibilityCheckerLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      {children}
    </>
  );
}
