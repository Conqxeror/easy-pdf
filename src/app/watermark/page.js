import { getToolMetadata } from "@/lib/toolSeoHelper";
import WatermarkClient from "./components/WatermarkClient";

const toolSeo = getToolMetadata("/watermark");
export const metadata = toolSeo.metadata;

export default function WatermarkPage() {
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
      <WatermarkClient />
    </>
  );
}
