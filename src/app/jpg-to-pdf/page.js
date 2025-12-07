import { getToolMetadata } from "@/lib/toolSeoHelper";
import JpgToPdfClient from "./components/JpgToPdfClient";

const toolSeo = getToolMetadata("/jpg-to-pdf");
export const metadata = toolSeo.metadata;

export default function JpgToPdfPage() {
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
      <JpgToPdfClient />
    </>
  );
}
