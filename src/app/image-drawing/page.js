import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageDrawingClient from "./components/ImageDrawingClient";

const toolSeo = getToolMetadata("/image-drawing");
export const metadata = toolSeo.metadata;

export default function ImageDrawingPage() {
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
      <ImageDrawingClient />
    </>
  );
}
