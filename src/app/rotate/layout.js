import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Rotate PDF Pages Online – Free PDF Rotation Tool | easy-pdf",
  description: "Rotate PDF pages to the correct orientation (90, 180, 270 degrees). Free online PDF rotation tool with secure browser-based processing. 100% client-side with no uploads.",
  keywords: [
    "Rotate PDF",
    "Fix PDF orientation",
    "Turn PDF pages",
    "PDF rotation",
    "Flip PDF",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF rotate",
    "PDF page rotation",
    "Correct PDF orientation",
    "Rotate PDF pages online",
    "PDF document rotation",
    "Free PDF rotator",
    "Online PDF rotation",
    "PDF page flipper",
    "PDF orientation fix",
    "Rotate individual PDF pages",
    "PDF clockwise rotation",
    "PDF anticlockwise rotation",
    "Batch PDF rotation"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/rotate",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Rotator",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Rotator", url: "https://easy-pdf-murex.vercel.app/rotate" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Rotator",
  description: "Rotate PDF pages to the correct orientation (90, 180, 270 degrees). Free online PDF rotation tool with secure browser-based processing.",
  url: "/rotate",
  features: [
    "Multiple rotation angles",
    "Page-specific rotation",
    "Batch rotation",
    "Preview changes"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Rotator", url: "https://easy-pdf-murex.vercel.app/rotate" }
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
