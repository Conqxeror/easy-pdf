import { getToolMetadata } from "@/lib/toolSeoHelper";
import TimezoneConverterClient from "./components/TimezoneConverterClient";

const toolSeo = getToolMetadata("/timezone-converter");
export const metadata = toolSeo.metadata;

export default function TimezoneConverterPage() {
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
      <TimezoneConverterClient />
    </>
  );
}
