import { getToolMetadata } from "@/lib/toolSeoHelper";
import RotateClient from "./components/RotateClient";

const toolSeo = getToolMetadata("/rotate");
export const metadata = toolSeo.metadata;

export default function RotatePage() {
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
      <RotateClient />
    </>
  );
}
