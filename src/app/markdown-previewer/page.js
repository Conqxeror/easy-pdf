import { getToolMetadata } from "@/lib/toolSeoHelper";
import MarkdownPreviewerClient from "./components/MarkdownPreviewerClient";

const toolSeo = getToolMetadata("/markdown-previewer");
export const metadata = toolSeo.metadata;

export default function MarkdownPreviewerPage() {
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
      <MarkdownPreviewerClient />
    </>
  );
}
