import { getToolMetadata } from "@/lib/toolSeoHelper";
import RegexTesterClient from "./components/RegexTesterClient";

const toolSeo = getToolMetadata("/regex-tester");
export const metadata = toolSeo.metadata;

export default function RegexTesterPage() {
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
      <RegexTesterClient />
    </>
  );
}
