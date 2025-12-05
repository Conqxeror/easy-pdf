import React from 'react';
import AudioCompressorClient from './components/AudioCompressorClient';
import { getToolMetadata } from '@/lib/toolSeoHelper';

const toolHref = '/audio-compressor';
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function AudioCompressorPage() {
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
      <AudioCompressorClient />
    </>
  );
}