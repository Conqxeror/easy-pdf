import { getToolMetadata } from "@/lib/toolSeoHelper";
import UnlockClient from "./components/UnlockClient";

const toolSeo = getToolMetadata("/unlock");
export const metadata = toolSeo.metadata;

export default function UnlockPage() {
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
      <UnlockClient />
    </>
  );
}
