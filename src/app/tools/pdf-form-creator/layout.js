import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Form Creator - Create Interactive PDF Forms",
  description: "Create interactive PDF forms with various field types including text, checkboxes, and signatures. Professional form builder.",
  keywords: [
  "PDF form creator",
  "interactive PDF forms",
  "form builder",
  "PDF form designer",
  "fillable PDF forms",
  "form creation tool",
  "PDF form generator",
  "interactive forms",
  "form fields",
  "PDF form development",
  "custom forms",
  "professional forms"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/tools/pdf-form-creator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Form Creator",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Form Creator", url: "https://easy-pdf-murex.vercel.app/tools/pdf-form-creator" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Form Creator",
  description: "Create interactive PDF forms with various field types including text, checkboxes, and signatures. Professional form builder.",
  url: "/tools/pdf-form-creator",
  features: [
  "Text input fields",
  "Checkboxes and radio buttons",
  "Dropdown menus",
  "Signature fields"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Form Creator", url: "https://easy-pdf-murex.vercel.app/tools/pdf-form-creator" }
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
