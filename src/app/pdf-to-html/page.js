import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfToHtmlClient from "./components/PdfToHtmlClient";

const toolSeo = getToolMetadata("/pdf-to-html");
export const metadata = toolSeo.metadata;

export default function PdfToHtmlPage() {
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
      <PdfToHtmlClient />
    </>
  );
}
