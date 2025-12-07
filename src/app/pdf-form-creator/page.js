import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfFormCreatorClient from "./components/PdfFormCreatorClient";

const toolSeo = getToolMetadata("/pdf-form-creator");
export const metadata = toolSeo.metadata;

export default function PDFFormCreatorPage() {
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
      <PdfFormCreatorClient />
    </>
  );
}
