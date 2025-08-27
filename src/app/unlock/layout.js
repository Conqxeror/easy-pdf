import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Unlock PDF (Remove Password) – Free PDF Unlocker | easy-pdf",
  description: "Remove password protection from your PDF files. Free online PDF unlocker with secure browser-based processing. 100% client-side with no file uploads.",
  keywords: [
    "Unlock PDF",
    "Remove PDF password",
    "Decrypt PDF",
    "PDF password remover",
    "Open protected PDF",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF unlock",
    "PDF decryption",
    "Password protected PDF remover",
    "Secure PDF unlocker",
    "Online PDF unlocker",
    "Free PDF password remover",
    "PDF access restoration",
    "Protected PDF opener",
    "PDF security removal",
    "Password recovery PDF",
    "PDF unlock tool",
    "Browser-based PDF unlocker",
    "Local PDF decryption",
    "Safe PDF unlocking"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/unlock",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Unlocker",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Unlocker", url: "https://easy-pdf-murex.vercel.app/unlock" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Unlocker",
  description: "Remove password protection from your PDF files. Free online PDF unlocker with secure browser-based processing.",
  url: "/unlock",
  features: [
    "Password removal",
    "Quick processing",
    "Secure unlocking",
    "No data retention"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Unlocker", url: "https://easy-pdf-murex.vercel.app/unlock" }
  ]
});

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
