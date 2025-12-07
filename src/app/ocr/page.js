import { getToolMetadata } from "@/lib/toolSeoHelper";
import OcrClient from "./components/OcrClient";

const toolSeo = getToolMetadata("/ocr");
export const metadata = toolSeo.metadata;

export default function OcrPage() {
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
      <OcrClient />
    </>
  );
}
