import ToolPageContent from "@/components/ui/ToolPageContent";

export default function PdfToText() {
  return (
    <ToolPageContent
      toolName="PDF to Text"
      toolDescription="Convert your PDF files to Text format."
      currentTool="pdf-to-text"
      steps={[
        "Upload your PDF file.",
        "Click the 'Convert to Text' button.",
        "Download your converted Text file."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">PDF to Text Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}