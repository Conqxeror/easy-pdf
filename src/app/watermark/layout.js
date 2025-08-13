import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Watermark PDF Online – Easy PDF Tool",
  description: "Add custom text or image watermarks to your PDF documents. Free online watermarking tool with position control and opacity adjustment.",
  keywords: [
  "Watermark PDF",
  "Add watermark",
  "PDF branding",
  "Document protection",
  "PDF stamp",
  "Client-side PDF",
  "Privacy PDF tool",
  "No upload PDF watermark",
  "Wali Mohammad Kadri"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/watermark",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Watermarker",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Watermarker", url: "https://easy-pdf-murex.vercel.app/watermark" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Watermarker",
  description: "Add custom text or image watermarks to your PDF documents. Free online watermarking tool with position control and opacity adjustment.",
  url: "/watermark",
  features: [
  "Text & image watermarks",
  "Custom positioning",
  "Opacity control",
  "Rotation options"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Watermarker", url: "https://easy-pdf-murex.vercel.app/watermark" }
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
