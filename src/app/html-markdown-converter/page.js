import { getToolMetadata } from "@/lib/toolSeoHelper";
import HtmlMarkdownConverterClient from "./components/HtmlMarkdownConverterClient";

const toolSeo = getToolMetadata("/html-markdown-converter");
export const metadata = toolSeo.metadata;

export default function HtmlMarkdownConverterPage() {
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
      <HtmlMarkdownConverterClient />
    </>
  );
}
