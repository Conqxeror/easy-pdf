import { getToolMetadata } from "@/lib/toolSeoHelper";
import RsaGeneratorClient from "./components/RsaGeneratorClient";

const toolSeo = getToolMetadata("/rsa-generator");
export const metadata = toolSeo.metadata;

export default function RsaGeneratorPage() {
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
      <RsaGeneratorClient />
    </>
  );
}
