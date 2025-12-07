import { getToolMetadata } from "@/lib/toolSeoHelper";
import QRScannerClient from "./components/QRScannerClient";

const toolSeo = getToolMetadata("/qr-scanner");
export const metadata = toolSeo.metadata;

export default function QRScannerPage() {
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
      <QRScannerClient />
    </>
  );
}
