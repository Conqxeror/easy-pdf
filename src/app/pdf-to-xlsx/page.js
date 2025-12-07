import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfToXlsxClient from "./components/PdfToXlsxClient";

const toolSeo = getToolMetadata("/pdf-to-xlsx");
export const metadata = toolSeo.metadata;

export default function PdfToXlsxPage() {
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
      <PdfToXlsxClient />
    </>
  );
}
