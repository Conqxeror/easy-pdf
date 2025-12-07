import { getToolMetadata } from "@/lib/toolSeoHelper";
import WebmToMp4Client from "./components/WebmToMp4Client";

const toolSeo = getToolMetadata("/webm-to-mp4");
export const metadata = toolSeo.metadata;

export default function WebmToMp4Page() {
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
      <WebmToMp4Client />
    </>
  );
}
