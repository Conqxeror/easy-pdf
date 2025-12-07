import { getToolMetadata } from "@/lib/toolSeoHelper";
import LegalAnalyzerClient from "./components/LegalAnalyzerClient";

const toolSeo = getToolMetadata("/legal-analyzer");
export const metadata = toolSeo.metadata;

export default function LegalAnalyzerPage() {
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
      <LegalAnalyzerClient />
    </>
  );
}
