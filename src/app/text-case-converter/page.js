import { getToolMetadata } from "@/lib/toolSeoHelper";
import TextCaseConverterClient from "./components/TextCaseConverterClient";

const toolSeo = getToolMetadata("/text-case-converter");
export const metadata = toolSeo.metadata;

export default function TextCaseConverterPage() {
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
      <TextCaseConverterClient />
    </>
  );
}
