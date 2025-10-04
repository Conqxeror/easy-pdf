import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/unlock');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Unlock PDF Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Can I unlock any password-protected PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can unlock most password-protected PDFs, provided you know the correct password. Our tool supports standard PDF encryption methods."
              }
            },
            {
              "@type": "Question",
              "name": "Is my PDF file uploaded to any server?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, all unlocking is done 100% client-side in your browser. Your files never leave your device, ensuring complete privacy and security."
              }
            },
            {
              "@type": "Question",
              "name": "Are there any limits on file size?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can upload PDF files up to 50MB for unlocking. For larger files, consider breaking them into smaller sections first."
              }
            },
            {
              "@type": "Question",
              "name": "Is the unlocking process secure?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, all processing happens locally in your browser with no data transmission, ensuring complete privacy and security for your documents."
              }
            },
            {
              "@type": "Question",
              "name": "Will the unlocked PDF retain all its content?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the unlocked PDF will retain all its original content and formatting. Only the password protection is removed."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
