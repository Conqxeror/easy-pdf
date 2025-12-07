import { getToolMetadata } from "@/lib/toolSeoHelper";
import ReportGeneratorClient from "./components/ReportGeneratorClient";

const toolSeo = getToolMetadata("/report-generator");
export const metadata = toolSeo.metadata;

export default function ReportGeneratorPage() {
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
      <ReportGeneratorClient />
    </>
  );
}
