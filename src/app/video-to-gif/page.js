import { getToolMetadata } from "@/lib/toolSeoHelper";
import VideoToGifClient from "./components/VideoToGifClient";

const toolSeo = getToolMetadata("/video-to-gif");
export const metadata = toolSeo.metadata;

export default function VideoToGifPage() {
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
      <VideoToGifClient />
    </>
  );
}
