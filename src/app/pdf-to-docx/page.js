import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfToDocxClient from "./components/PdfToDocxClient";

const toolSeo = getToolMetadata("/pdf-to-docx");
export const metadata = toolSeo.metadata;

export default function PdfToDocxPage() {
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
      <PdfToDocxClient />
    </>
  );
}
