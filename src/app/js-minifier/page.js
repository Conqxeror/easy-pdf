import { getToolMetadata } from "@/lib/toolSeoHelper";
import JsMinifierClient from "./components/JsMinifierClient";

const toolSeo = getToolMetadata("/js-minifier");
export const metadata = toolSeo.metadata;

export default function JsMinifierPage() {
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
      <JsMinifierClient />
    </>
  );
}
