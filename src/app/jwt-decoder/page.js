import { getToolMetadata } from "@/lib/toolSeoHelper";
import JwtDecoderClient from "./components/JwtDecoderClient";

const toolSeo = getToolMetadata("/jwt-decoder");
export const metadata = toolSeo.metadata;

export default function JwtDecoderPage() {
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
      <JwtDecoderClient />
    </>
  );
}
