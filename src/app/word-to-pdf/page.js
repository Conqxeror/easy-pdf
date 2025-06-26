"use client";

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
        toolName="Word to PDF Converter"
        toolDescription="Convert your Word documents to high-quality PDFs seamlessly. Our tool ensures that your formatting, images, and tables are preserved perfectly in the output PDF. It's fast, secure, and incredibly easy to use."
        steps={[
          "Upload your Word document (.doc or .docx) by dragging it into the dropzone or clicking to select a file.",
          "Adjust any conversion settings if necessary (e.g., page orientation, margins).",
          'Click the "Convert to PDF" button to begin the process.',
          "Download your newly created PDF file instantly.",
        ]}
        faqs={[
          {
            question: "Is it free to convert Word to PDF?",
            answer:
              "Yes, our Word to PDF converter is completely free to use. There are no hidden charges or limitations on the number of conversions.",
          },
          {
            question: "Will my formatting be preserved?",
            answer:
              "Absolutely. Our converter is designed to maintain the original formatting of your Word document, including fonts, images, and layout, ensuring a professional-looking PDF.",
          },
          {
            question: "Are my files secure?",
            answer:
              "Yes, your privacy and security are our top priorities. All files are processed on the client-side, which means your files are never uploaded to our servers.",
          },
        ]}
      />
    </>
  );
}

