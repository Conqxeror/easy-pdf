import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfToJpgClient from "./components/PdfToJpgClient";

const toolSeo = getToolMetadata("/pdf-to-jpg");
export const metadata = toolSeo.metadata;

export default function PdfToJpgPage() {
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
      <PdfToJpgClient />
    </>
  );
}
