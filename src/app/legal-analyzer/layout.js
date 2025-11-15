import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/legal-analyzer');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Legal Document Analyzer Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Can this tool replace a lawyer?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, this tool is designed to help you understand and analyze legal documents, but it cannot replace professional legal advice from a qualified attorney. Always consult with a lawyer for critical legal matters."
                }
              },
              {
                "@type": "Question",
                "name": "What types of legal documents can be analyzed?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The tool can analyze contracts, agreements, terms and conditions, privacy policies, employment agreements, lease agreements, and other common legal documents."
                }
              },
              {
                "@type": "Question",
                "name": "How accurate is the analysis?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The tool provides general analysis and insights based on common legal patterns. For specific legal advice or complex matters, always consult with a qualified attorney."
                }
              },
              {
                "@type": "Question",
                "name": "Is my document data secure?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, all document analysis happens entirely in your browser. Your documents are never uploaded to servers and are completely private."
                }
              },
              {
                "@type": "Question",
                "name": "Can I download the analysis report?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, you can download the analysis report as a PDF for your records. The report includes key findings, risk assessment, and recommendations."
                }
              }
            ]
          })
        }}
      />
      {children}
    </>
  );
}
