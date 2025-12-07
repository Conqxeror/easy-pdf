import { getToolMetadata } from "@/lib/toolSeoHelper";
import RemoveSilenceClient from "./components/RemoveSilenceClient";

const toolSeo = getToolMetadata("/remove-silence");
export const metadata = toolSeo.metadata;

export default function RemoveSilencePage() {
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
      <RemoveSilenceClient />
    </>
  );
}
