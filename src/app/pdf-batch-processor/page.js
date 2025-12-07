import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfBatchProcessorClient from "./components/PdfBatchProcessorClient";

const toolSeo = getToolMetadata("/pdf-batch-processor");
export const metadata = toolSeo.metadata;

export default function PDFBatchProcessorPage() {
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
      <PdfBatchProcessorClient />
    </>
  );
}
