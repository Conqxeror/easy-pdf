import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Annotation Collaboration - Team Review Tool",
  description: "Collaborate on PDF annotations with team members and export shared comments. Perfect for document review workflows.",
  keywords: [
    "PDF collaboration",
    "document review",
    "team annotations",
    "collaborative editing",
    "PDF comments",
    "document workflow",
    "review process",
    "annotation sharing",
    "team collaboration",
    "document feedback",
    "collaborative review",
    "shared annotations"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/tools/pdf-annotation-collaboration",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Annotation Collaboration",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "/" },
    { name: "Tools", url: "/#tools" },
    { name: "PDF Annotation Collaboration", url: "/tools/pdf-annotation-collaboration" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Annotation Collaboration",
  description: "Collaborate on PDF annotations with team members and export shared comments. Perfect for document review workflows.",
  url: "/tools/pdf-annotation-collaboration",
  features: [
    "Team annotations",
    "Comment threads",
    "Export annotations",
    "Review workflows",
    "Collaborative editing",
    "Shared feedback"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Tools", url: "https://easy-pdf-murex.vercel.app/#tools" },
    { name: "PDF Annotation Collaboration", url: "https://easy-pdf-murex.vercel.app/tools/pdf-annotation-collaboration" }
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
