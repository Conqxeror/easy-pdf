import { getToolMetadata } from "@/lib/toolSeoHelper";
import SteganographyClient from "./components/SteganographyClient";

const toolSeo = getToolMetadata("/steganography");
export const metadata = toolSeo.metadata;

export default function SteganographyPage() {
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
      <SteganographyClient />
    </>
  );
}
