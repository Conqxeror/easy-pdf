import { getToolMetadata } from "@/lib/toolSeoHelper";
import CurrencyConverterClient from "./components/CurrencyConverterClient";

const toolSeo = getToolMetadata("/currency-converter");
export const metadata = toolSeo.metadata;

export default function CurrencyConverterPage() {
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
      <CurrencyConverterClient />
    </>
  );
}
