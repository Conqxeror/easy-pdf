import { getToolMetadata } from "@/lib/toolSeoHelper";
import MetadataExtractorClient from "./components/MetadataExtractorClient";

const toolSeo = getToolMetadata("/metadata-extractor");
export const metadata = toolSeo.metadata;

export default function MetadataExtractorPage() {
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
      <MetadataExtractorClient />
    </>
  );
}
