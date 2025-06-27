"use client";

import { Metadata } from 'next';

import { Alert } from "@/components/ui/alert";
import ToolPageContent from "@/components/ui/ToolPageContent";



export default function WordToPdfPage() {
  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Word/Excel to PDF</h1>
        <Alert variant="destructive">
          This feature requires server-side processing and is not available in
          the client-only version.
        </Alert>
      </div>
      <ToolPageContent
        toolName="Word to PDF Converter (Coming Soon)"
        toolDescription="Converting Word documents to PDF is a complex task that often requires server-side processing to ensure perfect fidelity. As a privacy-first tool, we are committed to client-side processing, meaning your files never leave your device. We are actively exploring secure, client-side solutions for this feature. In the meantime, you can use our other powerful PDF tools."
        steps={[
          "Currently, direct client-side Word to PDF conversion is not available due to its complexity and our commitment to privacy (no server uploads).",
          "For now, you can convert your Word document to PDF using your word processor (e.g., Microsoft Word, Google Docs) and then use our other tools for further PDF manipulation.",
          "Stay tuned! We are researching and developing a secure, client-side solution for this feature.",
        ]}
        faqs={[
          {
            question: "Why isn't Word to PDF conversion available client-side?",
            answer:
              "Converting complex document formats like Word (.docx) to PDF accurately is very resource-intensive and typically requires server-side processing. To maintain our privacy-first approach (where your files never leave your device), we are still developing a robust client-side solution.",
          },
          {
            question: "Will this feature be added in the future?",
            answer:
              "Yes, we are actively working on a secure and efficient client-side Word to PDF converter. Our goal is to provide this functionality while adhering to our strict privacy standards.",
          },
          {
            question: "Are my files still secure if I use other tools?",
            answer:
              "Absolutely. All other tools on easy-pdf operate entirely client-side. Your documents are processed in your browser and are never uploaded to our servers, ensuring your privacy and security.",
          },
        ]}
      />
    </>
  );
}

