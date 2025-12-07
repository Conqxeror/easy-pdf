import { getToolMetadata } from "@/lib/toolSeoHelper";
import CssMinifierClient from "./components/CssMinifierClient";

const toolSeo = getToolMetadata("/css-minifier");
export const metadata = toolSeo.metadata;

export default function CssMinifierPage() {
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
      <CssMinifierClient />
    </>
  );
}
