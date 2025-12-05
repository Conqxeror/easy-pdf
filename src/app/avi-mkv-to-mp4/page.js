import React from "react";
import AviMkvToMp4Client from "./components/AviMkvToMp4Client";

import { getToolMetadata } from '@/lib/toolSeoHelper';

const toolHref = '/avi-mkv-to-mp4';
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function AviMkvToMp4Page() {
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
      <AviMkvToMp4Client />
    </>
  );
}
