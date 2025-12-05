import React from 'react';
import HtmlToPdfClient from "./components/HtmlToPdfClient";
import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolHref = '/html-to-pdf';
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function HtmlToPdfPage() {
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
      <HtmlToPdfClient />
    </>
  );
}
