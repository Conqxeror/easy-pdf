import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Unlock PDF (Remove Password) – Easy PDF Tool",
  description: "Remove password protection from your PDF files. Free online PDF unlocker with secure browser-based processing.",
  keywords: [
  "Unlock PDF",
  "Remove PDF password",
  "Decrypt PDF",
  "PDF password remover",
  "Open protected PDF",
  "Client-side PDF",
  "Privacy PDF tool",
  "No upload PDF unlock",
  "Wali Mohammad Kadri"
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
      {children}
    </>
  );
}
