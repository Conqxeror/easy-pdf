import { getToolMetadata } from "@/lib/toolSeoHelper";
import HtmlMinifierClient from "./components/HtmlMinifierClient";

const toolSeo = getToolMetadata("/html-minifier");
export const metadata = toolSeo.metadata;

export default function HtmlMinifierPage() {
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
      <HtmlMinifierClient />
    </>
  );
}
