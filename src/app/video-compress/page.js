import { getToolMetadata } from "@/lib/toolSeoHelper";
import VideoCompressClient from "./components/VideoCompressClient";

const toolSeo = getToolMetadata("/video-compress");
export const metadata = toolSeo.metadata;

export default function VideoCompressPage() {
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
      <VideoCompressClient />
    </>
  );
}
