import { getToolMetadata } from "@/lib/toolSeoHelper";
import PdfVersionComparisonClient from "./components/PdfVersionComparisonClient";

const toolSeo = getToolMetadata("/pdf-version-comparison");
export const metadata = toolSeo.metadata;

export default function PdfVersionComparisonPage() {
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
      <PdfVersionComparisonClient />
    </>
  );
}
