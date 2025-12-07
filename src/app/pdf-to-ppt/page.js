import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfToPptClient from "./components/PdfToPptClient";

const toolSeo = getToolMetadata("/pdf-to-ppt");
export const metadata = toolSeo.metadata;

export default function PdfToPptPage() {
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
      <PdfToPptClient />
    </>
  );
}
