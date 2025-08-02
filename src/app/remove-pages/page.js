import ToolPageContent from "@/components/ui/ToolPageContent";

export default function RemovePages() {
  return (
    <ToolPageContent
      toolName="Remove Pages"
      toolDescription="Remove unwanted pages from your PDF document."
      currentTool="remove-pages"
      steps={[
        "Upload your PDF file.",
        "Select pages to remove.",
        "Click 'Remove Pages'.",
        "Download your modified PDF."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Remove Pages Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}