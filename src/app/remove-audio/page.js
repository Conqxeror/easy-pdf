import { getToolMetadata } from "@/lib/toolSeoHelper";
import RemoveAudioClient from "./components/RemoveAudioClient";

const toolSeo = getToolMetadata("/remove-audio");
export const metadata = toolSeo.metadata;

export default function RemoveAudioPage() {
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
      <RemoveAudioClient />
    </>
  );
}
