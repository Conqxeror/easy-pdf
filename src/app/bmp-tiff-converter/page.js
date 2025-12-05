import React from "react";
import BmpTiffConverterClient from "./components/BmpTiffConverterClient";
import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolHref = "/bmp-tiff-converter";
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function BmpTiffConverterPage() {
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
      <BmpTiffConverterClient />
    </>
  );
}
