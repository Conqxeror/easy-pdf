import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageTextOverlayClient from "./components/ImageTextOverlayClient";

const toolSeo = getToolMetadata("/image-text-overlay");
export const metadata = toolSeo.metadata;

export default function ImageTextOverlayPage() {
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
      <ImageTextOverlayClient />
    </>
  );
}
