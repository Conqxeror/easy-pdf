import CompressImagesClient from "./components/CompressImagesClient";
import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolHref = "/compress-images";
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function CompressImagesPage() {
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
      <CompressImagesClient />
    </>
  );
}
