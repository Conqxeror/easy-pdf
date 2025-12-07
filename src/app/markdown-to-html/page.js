import { getToolMetadata } from "@/lib/toolSeoHelper";
import MarkdownToHtmlClient from "./components/MarkdownToHtmlClient";

const toolSeo = getToolMetadata("/markdown-to-html");
export const metadata = toolSeo.metadata;

export default function MarkdownToHtmlPage() {
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
      <MarkdownToHtmlClient />
    </>
  );
}
