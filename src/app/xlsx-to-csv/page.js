import { getToolMetadata } from "@/lib/toolSeoHelper";
import XlsxToCsvClient from "./components/XlsxToCsvClient";

const toolSeo = getToolMetadata("/xlsx-to-csv");
export const metadata = toolSeo.metadata;

export default function XlsxToCsvPage() {
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
      <XlsxToCsvClient />
    </>
  );
}
