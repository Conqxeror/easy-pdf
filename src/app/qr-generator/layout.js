import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "QR Code Generator - Create QR Codes for PDF Online | easy-pdf",
  description: "Generate QR codes for URLs, text, WiFi, contact cards, and more. Export as PNG or PDF with customizable size and quality. Free online QR code maker with no uploads.",
  keywords: [
    "QR code generator",
    "QR code maker",
    "wifi QR code",
    "vcard QR code",
    "url QR code",
    "QR code PDF",
    "barcode generator",
    "QR code creator",
    "dynamic QR code",
    "free QR code generator",
    "online QR code maker",
    "PDF QR code creator",
    "custom QR code design",
    "QR code printing tool",
    "professional QR code generator",
    "QR code design tool",
    "batch QR code creation",
    "QR code customization",
    "secure QR code generator",
    "privacy-first QR code tool"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/qr-generator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "QR Code Generator",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "QR Code Generator", url: "https://easy-pdf-murex.vercel.app/qr-generator" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "QR Code Generator",
  description: "Generate QR codes for URLs, text, WiFi, contact cards, and more. Export as PNG or PDF with customizable size and quality.",
  url: "/qr-generator",
  features: [
    "Multiple QR code types",
    "Customizable size and quality",
    "WiFi and vCard support",
    "PNG and PDF export"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "QR Code Generator", url: "https://easy-pdf-murex.vercel.app/qr-generator" }
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
