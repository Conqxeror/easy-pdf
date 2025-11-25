import { getToolMetadata } from "@/lib/toolSeoHelper";
import CompressClient from "./components/CompressClient";

const toolSeo = getToolMetadata("/pdf/compress");
export const metadata = toolSeo.metadata;

export default function CompressPage() {
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
      <CompressClient />
    </>
  );
}
