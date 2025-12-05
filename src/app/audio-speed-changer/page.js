import React from 'react';
import AudioSpeedChangerClient from './components/AudioSpeedChangerClient';
import { getToolMetadata } from '@/lib/toolSeoHelper';

const toolHref = '/audio-speed-changer';
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function AudioSpeedChangerPage() {
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
      <AudioSpeedChangerClient />
    </>
  );
}