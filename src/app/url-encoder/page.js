import { getToolMetadata } from "@/lib/toolSeoHelper";
import UrlEncoderClient from "./components/UrlEncoderClient";

const toolSeo = getToolMetadata("/url-encoder");
export const metadata = toolSeo.metadata;

export default function UrlEncoderPage() {
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
      <UrlEncoderClient />
    </>
  );
}
