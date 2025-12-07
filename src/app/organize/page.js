import { getToolMetadata } from "@/lib/toolSeoHelper";
import OrganizeClient from "./components/OrganizeClient";

const toolSeo = getToolMetadata("/organize");
export const metadata = toolSeo.metadata;

export default function OrganizePage() {
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
      <OrganizeClient />
    </>
  );
}
