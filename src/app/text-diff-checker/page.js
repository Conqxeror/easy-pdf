import { getToolMetadata } from "@/lib/toolSeoHelper";
import TextDiffCheckerClient from "./components/TextDiffCheckerClient";

const toolSeo = getToolMetadata("/text-diff-checker");
export const metadata = toolSeo.metadata;

export default function TextDiffCheckerPage() {
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
      <TextDiffCheckerClient />
    </>
  );
}
