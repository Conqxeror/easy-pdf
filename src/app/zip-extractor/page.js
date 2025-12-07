import { getToolMetadata } from "@/lib/toolSeoHelper";
import ZipExtractorClient from "./components/ZipExtractorClient";

const toolSeo = getToolMetadata("/zip-extractor");
export const metadata = toolSeo.metadata;

export default function ZipExtractorPage() {
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
      <ZipExtractorClient />
    </>
  );
}
