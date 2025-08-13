import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Invoice Generator - Create Professional Invoices Online",
  description: "Create professional invoices with GST support, multiple currencies, and customizable templates. Free online invoice maker for businesses.",
  keywords: [
  "PDF invoice generator",
  "create invoice",
  "invoice maker",
  "business invoice",
  "GST invoice",
  "professional invoice",
  "invoice template",
  "business billing",
  "invoice creation",
  "GST billing"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/invoice-generator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Invoice Generator",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Invoice Generator", url: "https://easy-pdf-murex.vercel.app/invoice-generator" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Invoice Generator",
  description: "Create professional invoices with GST support, multiple currencies, and customizable templates. Free online invoice maker for businesses.",
  url: "/invoice-generator",
  features: [
  "Professional invoice templates",
  "GST and tax calculations",
  "Multiple currency support",
  "Client and company management"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Invoice Generator", url: "https://easy-pdf-murex.vercel.app/invoice-generator" }
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
