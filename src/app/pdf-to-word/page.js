"use client";

import MetaHead from "@/components/ui/MetaHead";
import Alert from "@/components/ui/alert";

export default function PdfToWordPage() {
  return (
    <>
      <MetaHead
        title="PDF to Word/Excel - easy-pdf"
        description="Convert PDF to Word or Excel documents (advanced, server required)."
        url="/pdf-to-word"
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
