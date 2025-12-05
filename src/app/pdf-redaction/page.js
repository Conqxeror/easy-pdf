import React from 'react';
import PDFRedactionClient from './components/PDFRedactionClient';
import { getToolMetadata } from '@/lib/toolSeoHelper';

const toolHref = '/pdf-redaction';
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function PDFRedaction() {
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
      <PDFRedactionClient />
    </>
  );
}
