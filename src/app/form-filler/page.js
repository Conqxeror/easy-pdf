import FormFillerClient from "./components/FormFillerClient";
import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolHref = "/form-filler";
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function FormFillerPage() {
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
      <FormFillerClient />
    </>
  );
}
