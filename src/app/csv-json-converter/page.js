import CsvJsonConverterClient from "./components/CsvJsonConverterClient";
import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolHref = "/csv-json-converter";
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function CsvJsonConverterPage() {
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
      <CsvJsonConverterClient />
    </>
  );
}
