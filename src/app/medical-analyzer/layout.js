import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/medical-analyzer');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Medical Document Analyzer Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Can this tool replace a doctor or medical professional?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, this tool is designed for document analysis and information extraction only. It cannot replace professional medical advice from qualified healthcare providers. Always consult with your doctor for medical concerns."
                }
              },
              {
                "@type": "Question",
                "name": "What types of medical documents can be analyzed?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The tool can analyze medical reports, lab results, prescriptions, discharge summaries, medical histories, and other clinical documents to extract key information and medical terminology."
                }
              },
              {
                "@type": "Question",
                "name": "How does the tool extract medical information?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The tool uses advanced OCR and medical terminology recognition to extract key information such as test results, diagnoses, medications, and other clinical data from medical documents."
                }
              },
              {
                "@type": "Question",
                "name": "Is my medical data completely private?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, your privacy is our top priority. All processing happens entirely in your browser. Your medical documents are never uploaded to servers and remain completely confidential."
                }
              },
              {
                "@type": "Question",
                "name": "Can I export the analyzed data?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, you can export the analyzed medical data in various formats including PDF, CSV, or plain text for your personal records or to share with healthcare providers."
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
