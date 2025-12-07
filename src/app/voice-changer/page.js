import { getToolMetadata } from "@/lib/toolSeoHelper";
import VoiceChangerClient from "./components/VoiceChangerClient";

const toolSeo = getToolMetadata("/voice-changer");
export const metadata = toolSeo.metadata;

export default function VoiceChangerPage() {
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
      <VoiceChangerClient />
    </>
  );
}
