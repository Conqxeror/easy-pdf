import { getToolMetadata } from "@/lib/toolSeoHelper";
import ZipCreatorClient from "./components/ZipCreatorClient";

const toolSeo = getToolMetadata("/zip-creator");
export const metadata = toolSeo.metadata;

export default function ZipCreatorPage() {
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
      <ZipCreatorClient />
    </>
  );
}
