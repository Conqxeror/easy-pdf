import { getToolMetadata } from "@/lib/toolSeoHelper";
import ReorderClient from "./components/ReorderClient";

const toolSeo = getToolMetadata("/reorder");
export const metadata = toolSeo.metadata;

export default function ReorderPage() {
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
      <ReorderClient />
    </>
  );
}
