import { getToolMetadata } from "@/lib/toolSeoHelper";
import HashGeneratorClient from "./components/HashGeneratorClient";

const toolSeo = getToolMetadata("/hash-generator");
export const metadata = toolSeo.metadata;

export default function HashGeneratorPage() {
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
      <HashGeneratorClient />
    </>
  );
}
