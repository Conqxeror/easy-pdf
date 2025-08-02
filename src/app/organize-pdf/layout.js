import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Organize PDF Pages Online – Easy PDF Tool",
  description: "Organize, reorder, and manage your PDF pages instantly. 100% client-side, privacy-first, fast, and secure PDF organizer. No uploads required.",
  keywords: [
    "Organize PDF",
    "PDF organizer",
    "Reorder PDF",
    "PDF editor",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF organize",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/organize-pdf",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Organize PDF Pages Online",
  description: "Organize, reorder, and manage your PDF pages instantly. 100% client-side, privacy-first, fast, and secure PDF organizer. No uploads required.",
  url: "/organize-pdf",
  features: [
    "Reorder pages",
    "Delete pages",
    "Rotate pages",
    "Instant processing"
  ]
});

export default function OrganizePdfLayout({ children }) {
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