import { getToolMetadata } from "@/lib/toolSeoHelper";
import DocxToPdfClient from "./components/DocxToPdfClient";

const toolSeo = getToolMetadata("/docx-to-pdf");
export const metadata = toolSeo.metadata;

export default function DocxToPdfPage() {
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
      <DocxToPdfClient />
    </>
  );
}
