import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Certificate Generator - Create Professional Certificates PDF | easy-pdf",
  description: "Generate professional certificates for courses, training, achievements with customizable templates and styling options. Free online certificate maker with no uploads.",
  keywords: [
    "certificate generator",
    "certificate maker",
    "course certificate",
    "training certificate",
    "achievement certificate",
    "certificate template",
    "professional certificate",
    "digital certificate",
    "free certificate generator",
    "online certificate maker",
    "PDF certificate creator",
    "custom certificate design",
    "certificate printing tool",
    "educational certificate maker",
    "professional certificate generator",
    "certificate design tool",
    "batch certificate creation",
    "certificate customization",
    "secure certificate generator",
    "privacy-first certificate tool"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/certificate-generator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "Certificate Generator",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Certificate Generator", url: "https://easy-pdf-murex.vercel.app/certificate-generator" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Certificate Generator",
  description: "Generate professional certificates for courses, training, achievements with customizable templates and styling options.",
  url: "/certificate-generator",
  features: [
    "Multiple certificate templates",
    "Customizable colors and styles",
    "Professional layouts",
    "Automatic certificate IDs"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Certificate Generator", url: "https://easy-pdf-murex.vercel.app/certificate-generator" }
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
