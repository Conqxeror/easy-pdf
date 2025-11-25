import { getToolMetadata } from "@/lib/toolSeoHelper";
import MergePageClient from "./components/MergePageClient";

const toolSeo = getToolMetadata("/merge");
export const metadata = toolSeo.metadata;

export default function MergePage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolSeo.structuredData),
        }}
      />
      {/* HowTo Schema for rich snippets */}
      {toolSeo.howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(toolSeo.howToSchema),
          }}
        />
      )}
      <MergePageClient />
    </>
  );
}
