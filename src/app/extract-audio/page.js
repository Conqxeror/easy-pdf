import { getToolMetadata } from "@/lib/toolSeoHelper";
import ExtractAudioClient from "./components/ExtractAudioClient";

const toolSeo = getToolMetadata("/extract-audio");
export const metadata = toolSeo.metadata;

export default function ExtractAudioPage() {
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
      <ExtractAudioClient />
    </>
  );
}
