import { getToolMetadata } from "@/lib/toolSeoHelper";
import FileChecksumClient from "./components/FileChecksumClient";

const toolSeo = getToolMetadata("/file-checksum");
export const metadata = toolSeo.metadata;

export default function FileChecksumPage() {
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
      <FileChecksumClient />
    </>
  );
}
