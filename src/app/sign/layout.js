import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Sign / Annotate PDF Online – Free PDF Signing | easy-pdf",
  description: "Draw, type, or upload your signature and place it on your PDF. Free online PDF signing tool with drawing and typing options. 100% client-side with no uploads.",
  keywords: [
    "Sign PDF",
    "PDF signature",
    "Annotate PDF",
    "Digital signature",
    "PDF signing tool",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF sign",
    "PDF annotation tool",
    "Electronic signature PDF",
    "Free PDF signature",
    "Online PDF signing",
    "PDF document signing",
    "Digital PDF signature",
    "PDF signature pad",
    "PDF annotation features",
    "PDF signing online",
    "Free PDF annotation",
    "PDF signature tool",
    "Secure PDF signing"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/sign",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Signature Tool",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Signature Tool", url: "https://easy-pdf-murex.vercel.app/sign" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Signature Tool",
  description: "Draw, type, or upload your signature and place it on your PDF. Free online PDF signing tool with drawing and typing options.",
  url: "/sign",
  features: [
    "Digital signatures",
    "Drawing tools",
    "Text annotations",
    "Signature placement"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Signature Tool", url: "https://easy-pdf-murex.vercel.app/sign" }
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
