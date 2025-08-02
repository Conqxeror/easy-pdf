import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Certificate Generator - Create Professional Certificates PDF",
  description: "Generate professional certificates for courses, training, achievements with customizable templates and styling options.",
  keywords: ["certificate generator", "certificate maker", "course certificate", "training certificate", "achievement certificate"],
  canonicalUrl: "/certificate-generator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app"
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Certificate Generator",
  description: "Create professional certificates for courses, training, achievements, and more with customizable templates.",
  url: "/certificate-generator",
  features: [
    "Multiple certificate templates",
    "Customizable colors and styles",
    "Professional layouts",
    "Automatic certificate IDs",
    "Digital signatures support",
    "High-quality PDF output"
  ]
});

export default function CertificateGeneratorLayout({ children }) {
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