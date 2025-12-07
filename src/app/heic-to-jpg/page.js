import { getToolMetadata } from "@/lib/toolSeoHelper";
import HeicToJpgClient from "./components/HeicToJpgClient";

const toolSeo = getToolMetadata("/heic-to-jpg");
export const metadata = toolSeo.metadata;

export default function HeicToJpgPage() {
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
      <HeicToJpgClient />
    </>
  );
}
