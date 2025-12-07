import { getToolMetadata } from "@/lib/toolSeoHelper";
import TxtToPdfClient from "./components/TxtToPdfClient";

const toolSeo = getToolMetadata("/txt-to-pdf");
export const metadata = toolSeo.metadata;

export default function TxtToPdfPage() {
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
      <TxtToPdfClient />
    </>
  );
}
