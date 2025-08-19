import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Protect PDF (Add Password) – Easy PDF Tool",
  description: "Encrypt your PDFs with a password for enhanced security. Free online PDF protection tool with user permissions and print restrictions.",
  keywords: [
  "Protect PDF",
  "Password PDF",
  "Encrypt PDF",
  "Secure PDF",
  "PDF security",
  "Client-side PDF",
  "Privacy PDF tool",
  "No upload PDF protect",
  "Wali Mohammad Kadri"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/protect",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Protector",
  toolCategory: "Security & Privacy",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Protector", url: "https://easy-pdf-murex.vercel.app/protect" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Protector",
  description: "Encrypt your PDFs with a password for enhanced security. Free online PDF protection tool with user permissions and print restrictions.",
  url: "/protect",
  features: [
  "Password encryption",
  "User permissions",
  "Print restrictions",
  "Copy protection"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Protector", url: "https://easy-pdf-murex.vercel.app/protect" }
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
