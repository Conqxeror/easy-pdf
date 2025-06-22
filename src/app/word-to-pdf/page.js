"use client";

import MetaHead from "@/components/ui/MetaHead";
import { Alert } from "@/components/ui/alert";

export default function WordToPdfPage() {
  return (
    <>
      <MetaHead
        title="Word to PDF Online - Free PDF Converter | easy-pdf"
        description="Convert Word or Excel documents to PDF online for free. 100% client-side, privacy-first PDF tool."
        url="/word-to-pdf"
        keywords="Word to PDF, Excel to PDF, convert Word PDF, convert Excel PDF, PDF tools, online PDF, free PDF, PDF toolkit"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Word to PDF Online",
          description:
            "Convert Word or Excel documents to PDF online for free. 100% client-side, privacy-first PDF tool.",
          url: "https://easy-pdf-murex.vercel.app/word-to-pdf",
        }}
      />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Word/Excel to PDF</h1>
        <Alert variant="destructive">
          This feature requires server-side processing and is not available in
          the client-only version.
        </Alert>
      </div>
    </>
  );
}
