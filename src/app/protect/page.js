import { getToolMetadata } from "@/lib/toolSeoHelper";
import ProtectClient from "./components/ProtectClient";

const toolSeo = getToolMetadata("/protect");
export const metadata = toolSeo.metadata;

export default function ProtectPage() {
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
      <ProtectClient />
    </>
  );
}
