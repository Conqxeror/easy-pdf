import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/pdf-bookmark-manager');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What are PDF bookmarks and why are they useful?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "PDF bookmarks are clickable navigation links that help users quickly jump to specific sections or pages in a document. They create a table of contents that appears in the PDF viewer's bookmark panel, making it easier to navigate through long documents."
      }
    },
    {
      "@type": "Question",
      "name": "Can I create hierarchical bookmarks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can create hierarchical bookmark structures using the level field. Level 0 creates main bookmarks, while higher levels (1, 2, 3, etc.) create sub-bookmarks that are indented under their parent bookmarks."
      }
    },
    {
      "@type": "Question",
      "name": "How do I edit existing bookmarks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Click the edit button (pencil icon) next to any bookmark to modify its title, page number, or level. You can also use the up/down arrows to reorder bookmarks in the list."
      }
    },
    {
      "@type": "Question",
      "name": "Can I export my bookmark list?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can export your bookmark list as a JSON file, which includes all bookmark information including titles, page numbers, and hierarchy levels. This is useful for backing up your bookmark structure or importing it into other documents."
      }
    },
    {
      "@type": "Question",
      "name": "Will the bookmarks work in all PDF viewers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bookmarks created with this tool will be compatible with most PDF viewers including Adobe Reader, browsers, and mobile PDF apps. The bookmark panel can usually be accessed through the viewer's navigation menu."
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
