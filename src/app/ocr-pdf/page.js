import ToolPageContent from "@/components/ui/ToolPageContent";

export default function OcrPDF() {
  return (
    <ToolPageContent
      toolName="OCR PDF"
      toolDescription="Extract text from PDF using OCR."
      currentTool="ocr-pdf"
      steps={[
        "Upload your PDF file.",
        "Select OCR options.",
        "Click 'Extract Text'.",
        "Download extracted text."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">OCR PDF Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}