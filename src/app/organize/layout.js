import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Organize PDF Online – Free PDF Page Management | easy-pdf",
  description: "Combine reordering and deletion to organize your PDF pages. Complete suite of PDF organization tools with visual interface. 100% client-side with no uploads.",
  keywords: [
    "Organize PDF",
    "PDF organizer",
    "Manage PDF pages",
    "PDF page management",
    "Restructure PDF",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF organize",
    "PDF page reordering",
    "PDF page deletion",
    "PDF document organization",
    "Free PDF organizer",
    "Online PDF organization",
    "PDF page arrangement",
    "PDF restructuring tool",
    "PDF page sorting",
    "Visual PDF organizer",
    "PDF management tool",
    "Complete PDF organization",
    "Batch PDF organization"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/organize",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Organizer",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Organizer", url: "https://easy-pdf-murex.vercel.app/organize" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Organizer",
  description: "Combine reordering and deletion to organize your PDF pages. Complete suite of PDF organization tools with visual interface.",
  url: "/organize",
  features: [
    "Page reordering",
    "Page deletion",
    "Visual management",
    "Complete organization"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Organizer", url: "https://easy-pdf-murex.vercel.app/organize" }
  ]
});

export default function Layout({ children }) {
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
