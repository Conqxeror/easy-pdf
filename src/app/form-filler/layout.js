import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Form Filler Online – Easy PDF Tool",
  description: "Add text, checkmarks, or other inputs to any PDF form. Free online PDF form completion tool with save functionality.",
  keywords: [
  "Fill PDF form",
  "PDF form filler",
  "Complete PDF forms",
  "PDF input",
  "Form completion",
  "Client-side PDF",
  "Privacy PDF tool",
  "No upload PDF form",
  "Wali Mohammad Kadri"
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
