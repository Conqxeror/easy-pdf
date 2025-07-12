"use client";



import { Alert } from "@/components/ui/alert";
import ToolPageContent from "@/components/ui/ToolPageContent";



export default function PdfToWordPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-12 md:py-20 px-4">
        <div className="max-w-2xl w-full">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">
            PDF to Word/Excel
          </h1>
          <Alert variant="destructive" className="mt-6">
            This feature requires server-side processing and is not available in
            the client-only version.
          </Alert>
        </div>
        <ToolPageContent
          toolName="PDF to Word Converter (Coming Soon)"
          toolDescription="Converting PDF documents to editable Word files is a complex task that often requires server-side processing to ensure perfect fidelity, especially with complex layouts and fonts. As a privacy-first tool, we are committed to client-side processing, meaning your files never leave your device. We are actively exploring secure, client-side solutions for this feature. In the meantime, you can use our other powerful PDF tools."
          currentTool="pdf-to-word"
          steps={[
            "Currently, direct client-side PDF to Word conversion is not available due to its complexity and our commitment to privacy (no server uploads).",
            "For now, you can use other online or desktop converters for PDF to Word conversion, and then use our other tools for further PDF manipulation.",
            "Stay tuned! We are researching and developing a secure, client-side solution for this feature.",
          ]}
          faqs={[
            {
              question: "Why isn't PDF to Word conversion available client-side?",
              answer:
                "Converting PDF to editable Word documents accurately is very resource-intensive and typically requires server-side processing to handle complex layouts, images, and text extraction. To maintain our privacy-first approach (where your files never leave your device), we are still developing a robust client-side solution.",
            },
            {
              question: "Will this feature be added in the future?",
              answer:
                "Yes, we are actively working on a secure and efficient client-side PDF to Word converter. Our goal is to provide this functionality while adhering to our strict privacy standards.",
            },
            {
              question: "Are my files still secure if I use other tools?",
              answer:
                "Absolutely. All other tools on easy-pdf operate entirely client-side. Your documents are processed in your browser and are never uploaded to our servers, ensuring your privacy and security.",
            },
          ]}
        />
      </div>
    </>
  );
}