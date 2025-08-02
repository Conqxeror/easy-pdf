import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Remove PDF Pages Online – Easy PDF Tool",
  description: "Remove unwanted pages from your PDF document instantly. 100% client-side, privacy-first, fast, and secure PDF page remover. No uploads required.",
  keywords: [
    "Remove PDF pages",
    "Delete PDF pages",
    "PDF editor",
    "PDF page remover",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF remove",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/remove-pages",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Remove PDF Pages Online",
  description: "Remove unwanted pages from your PDF document instantly. 100% client-side, privacy-first, fast, and secure PDF page remover. No uploads required.",
  url: "/remove-pages",
  features: [
    "Select specific pages to remove",
    "Preview pages before removal",
    "Instant processing",
    "Secure and private"
  ]
});

export default function RemovePagesLayout({ children }) {
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