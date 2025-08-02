import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Repair PDF - Easy PDF Tool",
  description: "Repair corrupted PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF repair tool. No uploads required.",
  keywords: [
    "Repair PDF",
    "Fix PDF",
    "Corrupted PDF",
    "PDF repair tool",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF repair",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/repair-pdf",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Repair PDF",
  description: "Repair corrupted PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF repair tool. No uploads required.",
  url: "/repair-pdf",
  features: [
    "Repair corrupted PDF files",
    "Recover data from damaged PDFs",
    "Instant processing",
    "Secure and private"
  ]
});

export default function RepairPdfLayout({ children }) {
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