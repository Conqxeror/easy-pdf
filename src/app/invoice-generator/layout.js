import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Invoice Generator - Create Professional Invoices Online",
  description: "Generate professional PDF invoices with GST support, multiple currencies, and customizable templates. Perfect for businesses and freelancers.",
  keywords: ["pdf invoice generator", "create invoice", "invoice maker", "business invoice", "gst invoice", "professional invoice"],
  canonicalUrl: "/invoice-generator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app"
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Invoice Generator",
  description: "Create professional PDF invoices with GST support, multiple currencies, and customizable templates.",
  url: "/invoice-generator",
  features: [
    "Professional invoice templates",
    "GST and tax calculations", 
    "Multiple currency support",
    "Client and company management",
    "Automatic calculations",
    "PDF download"
  ]
});

export default function InvoiceGeneratorLayout({ children }) {
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