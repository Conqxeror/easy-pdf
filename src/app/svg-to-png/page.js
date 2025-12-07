import { getToolMetadata } from "@/lib/toolSeoHelper";
import SvgToPngClient from "./components/SvgToPngClient";

const toolSeo = getToolMetadata("/svg-to-png");
export const metadata = toolSeo.metadata;

export default function SvgToPngPage() {
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
      <SvgToPngClient />
    </>
  );
}
