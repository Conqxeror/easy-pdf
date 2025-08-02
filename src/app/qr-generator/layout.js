import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "QR Code Generator - Create QR Codes for PDF Online",
  description: "Generate QR codes for URLs, WiFi, contact cards, and more. Export as PNG or PDF with customizable size and quality.",
  keywords: ["qr code generator", "qr code maker", "wifi qr code", "vcard qr code", "url qr code", "qr code pdf"],
  canonicalUrl: "/qr-generator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app"
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "QR Code Generator",
  description: "Generate QR codes for URLs, text, WiFi, contact cards, and more. Export as PNG or PDF.",
  url: "/qr-generator",
  features: [
    "Multiple QR code types",
    "Customizable size and quality",
    "WiFi and vCard support",
    "PNG and PDF export",
    "High-resolution output",
    "Batch generation ready"
  ]
});

export default function QRGeneratorLayout({ children }) {
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