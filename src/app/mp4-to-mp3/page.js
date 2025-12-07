import { getToolMetadata } from "@/lib/toolSeoHelper";
import Mp4ToMp3Client from "./components/Mp4ToMp3Client";

const toolSeo = getToolMetadata("/mp4-to-mp3");
export const metadata = toolSeo.metadata;

export default function Mp4ToMp3Page() {
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
      <Mp4ToMp3Client />
    </>
  );
}
