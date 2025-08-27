import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Form Filler Online – Free PDF Form Completion | easy-pdf",
  description: "Add text, checkmarks, or other inputs to any PDF form. Free online PDF form completion tool with save functionality. 100% client-side with no uploads.",
  keywords: [
    "Fill PDF form",
    "PDF form filler",
    "Complete PDF forms",
    "PDF input",
    "Form completion",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF form",
    "PDF form completion tool",
    "Fill PDF documents online",
    "PDF form filling software",
    "Free PDF form filler",
    "Online PDF form completion",
    "PDF document form filler",
    "PDF form editor",
    "Digital PDF form completion",
    "PDF form processing tool",
    "Batch PDF form filling",
    "Secure PDF form completion",
    "Professional PDF form filler"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/form-filler",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Form Filler",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Form Filler", url: "https://easy-pdf-murex.vercel.app/form-filler" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Form Filler",
  description: "Add text, checkmarks, or other inputs to any PDF form. Free online PDF form completion tool with save functionality.",
  url: "/form-filler",
  features: [
    "Form field detection",
    "Text input",
    "Checkbox support",
    "Form saving"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Form Filler", url: "https://easy-pdf-murex.vercel.app/form-filler" }
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
