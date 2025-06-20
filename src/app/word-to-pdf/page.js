"use client";

import MetaHead from "@/components/ui/MetaHead";
import Alert from "@/components/ui/alert";

export default function WordToPdfPage() {
  return (
    <>
      <MetaHead
        title="Word/Excel to PDF - easy-pdf"
        description="Convert Word or Excel documents to PDF (advanced, server required)."
        url="/word-to-pdf"
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
