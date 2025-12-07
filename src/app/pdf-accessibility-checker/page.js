import { getToolMetadata } from "@/lib/toolSeoHelper";
import PDFAccessibilityCheckerClient from "./components/PDFAccessibilityCheckerClient";

const toolSeo = getToolMetadata("/pdf-accessibility-checker");
export const metadata = toolSeo.metadata;

export default function PDFAccessibilityCheckerPage() {
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
      <PDFAccessibilityCheckerClient />
    </>
  );
}
