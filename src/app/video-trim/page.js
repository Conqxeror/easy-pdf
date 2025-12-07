import { getToolMetadata } from "@/lib/toolSeoHelper";
import VideoTrimClient from "./components/VideoTrimClient";

const toolSeo = getToolMetadata("/video-trim");
export const metadata = toolSeo.metadata;

export default function VideoTrimPage() {
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
      <VideoTrimClient />
    </>
  );
}
