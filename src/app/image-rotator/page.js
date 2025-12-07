import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageRotatorClient from "./components/ImageRotatorClient";

const toolSeo = getToolMetadata("/image-rotator");
export const metadata = toolSeo.metadata;

export default function ImageRotatorPage() {
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
      <ImageRotatorClient />
    </>
  );
}
