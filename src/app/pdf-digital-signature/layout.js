import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Digital Signature - Add Legal Digital Signatures",
  description: "Add legally binding digital signatures to PDF documents with certificate management and validation. Secure, compliant, and browser-based.",
  keywords: [
  "PDF digital signature",
  "digital certificate",
  "electronic signature",
  "PDF signing",
  "legal signature",
  "document authentication",
  "signature validation",
  "certificate management",
  "secure signing",
  "digital notary",
  "PDF security",
  "document integrity"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/pdf-digital-signature",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Digital Signature",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Digital Signature", url: "https://easy-pdf-murex.vercel.app/pdf-digital-signature" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Digital Signature",
  description: "Add legally binding digital signatures to PDF documents with certificate management and validation. Secure, compliant, and browser-based.",
  url: "/pdf-digital-signature",
  features: [
  "Digital certificates",
  "Signature validation",
  "Timestamp authority",
  "Legal compliance"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Digital Signature", url: "https://easy-pdf-murex.vercel.app/pdf-digital-signature" }
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
