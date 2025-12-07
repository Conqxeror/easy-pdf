import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageCropClient from "./components/ImageCropClient";

const toolSeo = getToolMetadata("/image-crop");
export const metadata = toolSeo.metadata;

export default function ImageCropPage() {
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
      <ImageCropClient />
    </>
  );
}
