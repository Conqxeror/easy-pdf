import ToolPageContent from "@/components/ui/ToolPageContent";

export default function WebToPdf() {
  return (
    <ToolPageContent
      toolName="Web to PDF"
      toolDescription="Convert web pages to PDF format."
      currentTool="web-to-pdf"
      steps={[
        "Enter the URL of the web page.",
        "Click the 'Convert to PDF' button.",
        "Download your converted PDF."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Web to PDF Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}