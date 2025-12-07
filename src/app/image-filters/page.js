import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageFiltersClient from "./components/ImageFiltersClient";

const toolSeo = getToolMetadata("/image-filters");
export const metadata = toolSeo.metadata;

export default function ImageFiltersPage() {
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
      <ImageFiltersClient />
    </>
  );
}
