import DocxToTextClient from "./components/DocxToTextClient";
import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolHref = "/docx-to-text";
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function DocxToTextPage() {
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
      <DocxToTextClient />
    </>
  );
}
