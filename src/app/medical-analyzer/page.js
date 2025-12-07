import { getToolMetadata } from "@/lib/toolSeoHelper";
import MedicalAnalyzerClient from "./components/MedicalAnalyzerClient";

const toolSeo = getToolMetadata("/medical-analyzer");
export const metadata = toolSeo.metadata;

export default function MedicalAnalyzerPage() {
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
      <MedicalAnalyzerClient />
    </>
  );
}
