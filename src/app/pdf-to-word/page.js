"use client";

import MetaHead from "@/components/ui/MetaHead";
import { Alert } from "@/components/ui/alert";

export default function PdfToWordPage() {
  return (
    <>
      <MetaHead
        title="PDF to Word Online - Free PDF Converter | easy-pdf"
        description="Convert PDF to Word or Excel documents online for free. 100% client-side, privacy-first PDF tool."
        url="/pdf-to-word"
        keywords="PDF to Word, PDF to Excel, convert PDF, PDF tools, online PDF, free PDF, PDF toolkit"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "PDF to Word Online",
          description:
            "Convert PDF to Word or Excel documents online for free. 100% client-side, privacy-first PDF tool.",
          url: "https://easy-pdf-murex.vercel.app/pdf-to-word",
        }}
      />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">PDF to Word/Excel</h1>
        <Alert variant="destructive">
          This feature requires server-side processing and is not available in
          the client-only version.
        </Alert>
      </div>
    </>
  );
}
