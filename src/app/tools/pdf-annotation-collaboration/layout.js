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
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Annotation Collaboration", url: "https://easy-pdf-murex.vercel.app/tools/pdf-annotation-collaboration" }
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
    "Review workflows"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Annotation Collaboration", url: "https://easy-pdf-murex.vercel.app/tools/pdf-annotation-collaboration" }
  ]
});

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What types of annotations can I add to PDFs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can add comments, text highlights, sticky notes, and drawing annotations. Each annotation can be positioned precisely on specific pages and includes author information, timestamps, and discussion threads."
      }
    },
    {
      "@type": "Question",
      "name": "How does team collaboration work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Team members can be assigned different roles (Reviewer, Editor, Approver) with appropriate permissions. Everyone can view annotations, add replies to discussions, and track the status of review items in real-time."
      }
    },
    {
      "@type": "Question",
      "name": "Can I track the status of annotations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, each annotation has a status (Open, In Progress, Resolved) and priority level (High, Medium, Low). You can update statuses as you work through the review process and track progress across the entire document."
      }
    },
    {
      "@type": "Question",
      "name": "What export options are available?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can export the annotated PDF with visual markers, export annotation data as JSON for record-keeping, and generate review summaries. This helps maintain documentation of the collaboration process."
      }
    },
    {
      "@type": "Question",
      "name": "Is real-time collaboration supported?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The tool supports collaborative annotation where team members can see each other's comments and replies. While not fully real-time, it provides a comprehensive collaboration environment for document review."
      }
    }
  ]
};

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      {children}
    </>
  );
}
