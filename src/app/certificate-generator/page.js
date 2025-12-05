import React from "react";
import CertificateGeneratorClient from "./components/CertificateGeneratorClient";
import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolHref = "/certificate-generator";
const toolSeo = getToolMetadata(toolHref);

export const metadata = toolSeo.metadata;

export default function CertificateGeneratorPage() {
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
      <CertificateGeneratorClient />
    </>
  );
}
