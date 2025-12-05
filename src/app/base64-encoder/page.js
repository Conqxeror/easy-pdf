import React from "react";
import Base64EncoderClient from "./components/Base64EncoderClient";
import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolHref = "/base64-encoder";
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function Base64EncoderPage() {
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
      <Base64EncoderClient />
    </>
  );
}
