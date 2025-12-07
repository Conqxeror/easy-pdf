import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfToTextClient from "./components/PdfToTextClient";

const toolSeo = getToolMetadata("/pdf-to-text");
export const metadata = toolSeo.metadata;

export default function PdfToTextPage() {
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
      <PdfToTextClient />
    </>
  );
}
