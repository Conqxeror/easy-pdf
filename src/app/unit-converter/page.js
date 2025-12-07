import { getToolMetadata } from "@/lib/toolSeoHelper";
import UnitConverterClient from "./components/UnitConverterClient";

const toolSeo = getToolMetadata("/unit-converter");
export const metadata = toolSeo.metadata;

export default function UnitConverterPage() {
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
      <UnitConverterClient />
    </>
  );
}
