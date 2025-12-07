import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfDigitalSignatureClient from "./components/PdfDigitalSignatureClient";

const toolSeo = getToolMetadata("/pdf-digital-signature");
export const metadata = toolSeo.metadata;

export default function PDFDigitalSignaturePage() {
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
      <PdfDigitalSignatureClient />
    </>
  );
}
