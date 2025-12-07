import { getToolMetadata } from "@/lib/toolSeoHelper";
import PageNumbersClient from "./components/PageNumbersClient";

const toolSeo = getToolMetadata("/page-numbers");
export const metadata = toolSeo.metadata;

export default function PageNumbersPage() {
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
      <PageNumbersClient />
    </>
  );
}
