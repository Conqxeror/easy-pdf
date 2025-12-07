import { getToolMetadata } from "@/lib/toolSeoHelper";
import FaceBlurClient from "./components/FaceBlurClient.optimized";

const toolSeo = getToolMetadata("/face-blur");
export const metadata = toolSeo.metadata;

export default function FaceBlurPage() {
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
      <FaceBlurClient />
    </>
  );
}
