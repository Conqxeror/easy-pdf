import { getToolMetadata } from "@/lib/toolSeoHelper";
import PasswordStrengthClient from "./components/PasswordStrengthClient";

const toolSeo = getToolMetadata("/password-strength");
export const metadata = toolSeo.metadata;

export default function PasswordStrengthPage() {
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
      <PasswordStrengthClient />
    </>
  );
}
