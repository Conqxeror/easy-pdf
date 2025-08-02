import ToolPageContent from "@/components/ui/ToolPageContent";

export default function WordToPdf() {
  return (
    <ToolPageContent
      toolName="Word to PDF"
      toolDescription="Convert your Word files to PDF format."
      currentTool="word-to-pdf"
      steps={[
        "Upload your Word file.",
        "Click the 'Convert to PDF' button.",
        "Download your converted PDF."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Word to PDF Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}