import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfTableExtractorClient from "./components/PdfTableExtractorClient";

const toolSeo = getToolMetadata("/pdf-table-extractor");
export const metadata = toolSeo.metadata;

export default function PDFTableExtractorPage() {
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
      <PdfTableExtractorClient />
    </>
  );
}
