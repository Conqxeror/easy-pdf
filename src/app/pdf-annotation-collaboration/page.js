import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfAnnotationCollaborationClient from "./components/PdfAnnotationCollaborationClient";

const toolSeo = getToolMetadata("/pdf-annotation-collaboration");
export const metadata = toolSeo.metadata;

export default function PDFAnnotationCollaborationPage() {
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
      <PdfAnnotationCollaborationClient />
    </>
  );
}
