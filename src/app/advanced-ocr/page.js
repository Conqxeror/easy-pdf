import React from "react";
import AdvancedOCRClient from "./components/AdvancedOcrClient.optimized";
import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolHref = "/advanced-ocr";
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function AdvancedOCRPage() {
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
      <AdvancedOCRClient />
    </>
  );
}
