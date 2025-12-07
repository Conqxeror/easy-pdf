import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageWatermarkClient from "./components/ImageWatermarkClient";

const toolSeo = getToolMetadata("/image-watermark");
export const metadata = toolSeo.metadata;

export default function ImageWatermarkPage() {
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
      <ImageWatermarkClient />
    </>
  );
}
