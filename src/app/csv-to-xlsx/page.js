import CsvToXlsxClient from "./components/CsvToXlsxClient";
import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolHref = "/csv-to-xlsx";
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function CsvToXlsxPage() {
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
      <CsvToXlsxClient />
    </>
  );
}
