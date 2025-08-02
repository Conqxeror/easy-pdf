import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Form Filler Online – Easy PDF Tool",
  description: "Fill PDF forms and add text instantly. 100% client-side, privacy-first, fast, and secure PDF form filler. No uploads required.",
  keywords: [
    "PDF form filler",
    "Fill PDF forms",
    "Add text PDF",
    "PDF editor",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF form",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/form-filler",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Form Filler Online",
  description: "Fill PDF forms and add text instantly. 100% client-side, privacy-first, fast, and secure PDF form filler. No uploads required.",
  url: "/form-filler",
  features: [
    "Add text to any PDF",
    "Adjust font size and color",
    "Precisely position text",
    "Secure and private"
  ]
});

export default function FormFillerLayout({ children }) {
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