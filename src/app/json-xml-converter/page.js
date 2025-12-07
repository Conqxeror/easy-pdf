import { getToolMetadata } from "@/lib/toolSeoHelper";
import JsonXmlConverterClient from "./components/JsonXmlConverterClient";

const toolSeo = getToolMetadata("/json-xml-converter");
export const metadata = toolSeo.metadata;

export default function JsonXmlConverterPage() {
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
      <JsonXmlConverterClient />
    </>
  );
}
