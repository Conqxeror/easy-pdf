"use client";

import { Metadata } from 'next';

import { Alert } from "@/components/ui/alert";
import ToolPageContent from "@/components/ui/ToolPageContent";



export default function PdfToWordPage() {
  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">PDF to Word/Excel</h1>
        <Alert variant="destructive">
          This feature requires server-side processing and is not available in
          the client-only version.
        </Alert>
      </div>
      <ToolPageContent
        toolName="PDF to Word Converter"
        toolDescription="Easily convert your PDF files into editable Word documents. Our tool accurately retains the layout, formatting, and tables from your original PDF, making it simple to edit and reuse your content."
        steps={[
          "Upload your PDF file by dragging it into the dropzone or clicking to select a file.",
          "Choose your desired output format (e.g., .docx, .doc).",
          'Click the "Convert to Word" button to start the conversion.',
          "Download your editable Word document instantly.",
        ]}
        faqs={[
          {
            question: "How accurate is the PDF to Word conversion?",
            answer:
              "Our converter uses advanced technology to ensure high accuracy in retaining the original layout, fonts, and images. However, complex PDFs may have minor variations.",
          },
          {
            question: "Can I convert scanned PDFs?",
            answer:
              "Yes, our tool supports OCR (Optical Character Recognition) for scanned PDFs, allowing you to convert them into editable Word documents. The accuracy depends on the quality of the scan.",
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

