import { getToolMetadata } from "@/lib/toolSeoHelper";
import TarExtractorClient from "./components/TarExtractorClient";

const toolSeo = getToolMetadata("/tar-extractor");
export const metadata = toolSeo.metadata;

export default function TarExtractorPage() {
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
      <TarExtractorClient />
    </>
  );
}
