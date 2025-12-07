import { getToolMetadata } from "@/lib/toolSeoHelper";
import AesEncryptClient from "./components/AesEncryptClient";

const toolSeo = getToolMetadata("/aes-encrypt");
export const metadata = toolSeo.metadata;

export default function AesEncryptPage() {
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
      <AesEncryptClient />
    </>
  );
}
