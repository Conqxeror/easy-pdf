import { getToolMetadata } from "@/lib/toolSeoHelper";
import SplitClient from "./components/SplitClient";

const toolSeo = getToolMetadata("/pdf/split");
export const metadata = toolSeo.metadata;

export default function SplitPage() {
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
      <SplitClient />
    </>
  );
}
