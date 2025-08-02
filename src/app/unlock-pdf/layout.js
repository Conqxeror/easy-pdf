import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Unlock PDF (Remove Password) – Easy PDF Tool",
  description: "Remove password from PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF unlocker. No uploads required.",
  keywords: [
    "Unlock PDF",
    "Remove PDF password",
    "Decrypt PDF",
    "PDF unlocker",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF unlock",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/unlock-pdf",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Unlock PDF (Remove Password)",
  description: "Remove password from PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF unlocker. No uploads required.",
  url: "/unlock-pdf",
  features: [
    "Remove password protection",
    "Instant processing",
    "Secure and private"
  ]
});

export default function UnlockPdfLayout({ children }) {
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