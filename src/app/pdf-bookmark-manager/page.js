import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfBookmarkManagerClient from "./components/PdfBookmarkManagerClient";

const toolSeo = getToolMetadata("/pdf-bookmark-manager");
export const metadata = toolSeo.metadata;

export default function PDFBookmarkManagerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSeo.structuredData) }}
      />
      {toolSeo.howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSeo.howToSchema) }}
        />
      )}
      <PdfBookmarkManagerClient />
    </>
  );
}
