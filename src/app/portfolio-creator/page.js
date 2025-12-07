import { getToolMetadata } from "@/lib/toolSeoHelper";
import PortfolioCreatorClient from "./components/PortfolioCreatorClient";

const toolSeo = getToolMetadata("/portfolio-creator");
export const metadata = toolSeo.metadata;

export default function PortfolioCreatorPage() {
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
      <PortfolioCreatorClient />
    </>
  );
}
