import { getToolMetadata } from "@/lib/toolSeoHelper";
import ColorConverterClient from "./components/ColorConverterClient";

const toolSeo = getToolMetadata("/color-converter");
export const metadata = toolSeo.metadata;

export default function ColorConverterPage() {
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
      <ColorConverterClient />
    </>
  );
}
