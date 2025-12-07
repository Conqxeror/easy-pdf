import { getToolMetadata } from "@/lib/toolSeoHelper";
import SignClient from "./components/SignClient";

const toolSeo = getToolMetadata("/sign");
export const metadata = toolSeo.metadata;

export default function SignPage() {
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
      <SignClient />
    </>
  );
}
