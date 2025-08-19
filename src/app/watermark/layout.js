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

      {/* FAQ structured data for Watermark PDF Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Can I add both text and image watermarks to my PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can choose to add either text or image watermarks, with full control over position, opacity, and rotation."
              }
            },
            {
              "@type": "Question",
              "name": "Is my PDF file uploaded to any server?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, all watermarking is done 100% client-side in your browser. Your files never leave your device."
              }
            },
            {
              "@type": "Question",
              "name": "Are there any limits on file size?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can upload PDF files up to 50MB for watermarking."
              }
            },
            {
              "@type": "Question",
              "name": "Can I adjust the watermark's opacity and rotation?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can set the opacity and rotation for both text and image watermarks."
              }
            },
            {
              "@type": "Question",
              "name": "Is the watermark permanent?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, once you download the watermarked PDF, the watermark is embedded and cannot be removed unless you use a PDF editor."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
