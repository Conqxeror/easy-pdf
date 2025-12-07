import { getToolMetadata } from "@/lib/toolSeoHelper";
import InvoiceGeneratorClient from "./components/InvoiceGeneratorClient";

const toolSeo = getToolMetadata("/invoice-generator");
export const metadata = toolSeo.metadata;

export default function InvoiceGeneratorPage() {
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
      <InvoiceGeneratorClient />
    </>
  );
}
