import { getToolMetadata } from "@/lib/toolSeoHelper";
import ImageConverterClient from "./components/ImageConverterClient";

const toolSeo = getToolMetadata("/image-converter");
export const metadata = toolSeo.metadata;

export default function ImageConverterPage() {
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
      <ImageConverterClient />
    </>
  );
}
