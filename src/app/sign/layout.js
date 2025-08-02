import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Sign PDF Online – Easy PDF Tool",
  description: "Sign and annotate PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF signing tool. No uploads required.",
  keywords: [
    "Sign PDF",
    "Annotate PDF",
    "PDF signature",
    "PDF signing tool",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF sign",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/sign",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Sign PDF Online",
  description: "Sign and annotate PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF signing tool. No uploads required.",
  url: "/sign",
  features: [
    "Draw, type, or upload signature",
    "Place signature anywhere on the page",
    "Instant processing",
    "Secure and private"
  ]
});

export default function SignLayout({ children }) {
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