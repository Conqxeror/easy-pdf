import { getToolMetadata } from "@/lib/toolSeoHelper";
import UrlShortenerClient from "./components/UrlShortenerClient";

const toolSeo = getToolMetadata("/url-shortener");
export const metadata = toolSeo.metadata;

export default function UrlShortenerPage() {
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
      <UrlShortenerClient />
    </>
  );
}
