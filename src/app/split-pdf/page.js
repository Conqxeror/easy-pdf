import ToolPageContent from "@/components/ui/ToolPageContent";

export default function SplitPDF() {
  return (
    <ToolPageContent
      toolName="Split PDF"
      toolDescription="Split PDF files into separate pages."
      currentTool="split-pdf"
      steps={[
        "Upload your PDF file.",
        "Select pages to split.",
        "Click 'Split PDF'.",
        "Download your split PDF."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Split PDF Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}