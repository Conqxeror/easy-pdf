import ToolPageContent from "@/components/ui/ToolPageContent";

export default function PdfToWord() {
  return (
    <ToolPageContent
      toolName="PDF to Word"
      toolDescription="Convert your PDF files to Word format."
      currentTool="pdf-to-word"
      steps={[
        "Upload your PDF file.",
        "Click the 'Convert to Word' button.",
        "Download your converted Word file."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">PDF to Word Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}