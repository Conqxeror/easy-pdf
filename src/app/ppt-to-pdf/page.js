import { getToolMetadata } from "@/lib/toolSeoHelper";
import PptToPdfClient from "./components/PptToPdfClient";

const toolSeo = getToolMetadata("/ppt-to-pdf");
export const metadata = toolSeo.metadata;

export default function PptToPdfPage() {
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
      <PptToPdfClient />
    </>
  );
}
