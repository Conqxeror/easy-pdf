import { getToolMetadata } from "@/lib/toolSeoHelper";
import WavMp3ConverterClient from "./components/WavMp3ConverterClient";

const toolSeo = getToolMetadata("/wav-mp3-converter");
export const metadata = toolSeo.metadata;

export default function WavMp3ConverterPage() {
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
      <WavMp3ConverterClient />
    </>
  );
}
