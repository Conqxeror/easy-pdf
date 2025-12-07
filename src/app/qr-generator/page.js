import { getToolMetadata } from "@/lib/toolSeoHelper";
import QRCodeGeneratorClient from "./components/QRCodeGeneratorClient";

const toolSeo = getToolMetadata("/qr-generator");
export const metadata = toolSeo.metadata;

export default function QRCodeGeneratorPage() {
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
      <QRCodeGeneratorClient />
    </>
  );
}
