import { getToolMetadata } from "@/lib/toolSeoHelper";
import UuidGeneratorClient from "./components/UuidGeneratorClient";

const toolSeo = getToolMetadata("/uuid-generator");
export const metadata = toolSeo.metadata;

export default function UuidGeneratorPage() {
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
      <UuidGeneratorClient />
    </>
  );
}
