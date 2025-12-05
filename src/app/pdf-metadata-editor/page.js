import React from 'react';
import PdfMetadataEditorClient from "./components/PdfMetadataEditorClient";
import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolHref = '/pdf-metadata-editor';
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function PdfMetadataEditorPage() {
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
      <PdfMetadataEditorClient />
    </>
  );
}
