import { getToolMetadata } from "@/lib/toolSeoHelper";
import BarcodeGeneratorClient from "./components/BarcodeGeneratorClient";

const toolSeo = getToolMetadata("/barcode-generator");
export const metadata = toolSeo.metadata;

export default function BarcodeGeneratorPage() {
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
      <BarcodeGeneratorClient />
    </>
  );
}
