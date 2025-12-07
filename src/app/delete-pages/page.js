import { getToolMetadata } from "@/lib/toolSeoHelper";
import DeletePagesClient from "./components/DeletePagesClient";

const toolSeo = getToolMetadata("/delete-pages");
export const metadata = toolSeo.metadata;

export default function DeletePagesPage() {
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
      <DeletePagesClient />
    </>
  );
}
