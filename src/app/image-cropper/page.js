import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageCropperClient from "./components/ImageCropperClient";

const toolSeo = getToolMetadata("/image-cropper");
export const metadata = toolSeo.metadata;

export default function ImageCropperPage() {
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
      <ImageCropperClient />
    </>
  );
}
