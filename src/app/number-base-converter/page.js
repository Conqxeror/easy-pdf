import { getToolMetadata } from "@/lib/toolSeoHelper";
import NumberBaseConverterClient from "./components/NumberBaseConverterClient";

const toolSeo = getToolMetadata("/number-base-converter");
export const metadata = toolSeo.metadata;

export default function NumberBaseConverterPage() {
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
      <NumberBaseConverterClient />
    </>
  );
}
