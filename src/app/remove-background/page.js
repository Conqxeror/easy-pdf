import { getToolMetadata } from "@/lib/toolSeoHelper";
import RemoveBackgroundClient from "./components/RemoveBackgroundClient";

const toolSeo = getToolMetadata("/remove-background");
export const metadata = toolSeo.metadata;

export default function RemoveBackgroundPage() {
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
      <RemoveBackgroundClient />
    </>
  );
}
