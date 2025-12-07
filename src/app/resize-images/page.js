import { getToolMetadata } from "@/lib/toolSeoHelper";
import ResizeImagesClient from "./components/ResizeImagesClient";

const toolSeo = getToolMetadata("/resize-images");
export const metadata = toolSeo.metadata;

export default function ResizeImagesPage() {
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
      <ResizeImagesClient />
    </>
  );
}
