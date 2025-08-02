import ToolPageContent from "@/components/ui/ToolPageContent";

export default function MergePDF() {
  return (
    <ToolPageContent
      toolName="Merge PDF"
      toolDescription="Combine multiple PDF files into one seamless document."
      currentTool="merge-pdf"
      steps={[
        "Upload your PDF files.",
        "Arrange them in the desired order.",
        "Click the 'Merge PDF' button.",
        "Download your merged PDF."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Merge PDF Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}