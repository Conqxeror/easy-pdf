import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/report-generator');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Report Generator Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Can I add more sections or metrics?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, use the 'Add Section' or 'Add Metric' buttons to include as many as you need."
              }
            },
            {
              "@type": "Question",
              "name": "Can I style my report?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can choose different templates and customize primary/secondary colors."
              }
            },
            {
              "@type": "Question",
              "name": "Is my report data saved online?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, all processing happens in your browser for privacy."
              }
            },
            {
              "@type": "Question",
              "name": "Can I upload existing reports?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can import a JSON file exported from this tool to continue editing."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
