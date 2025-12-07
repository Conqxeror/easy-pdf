import { getToolMetadata } from "@/lib/toolSeoHelper";
import M4aMp3ConverterClient from "./components/M4aMp3ConverterClient";

const toolSeo = getToolMetadata("/m4a-mp3-converter");
export const metadata = toolSeo.metadata;

export default function M4aMp3ConverterPage() {
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
      <M4aMp3ConverterClient />
    </>
  );
}
