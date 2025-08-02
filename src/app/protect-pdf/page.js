import ToolPageContent from "@/components/ui/ToolPageContent";

export default function ProtectPDF() {
  return (
    <ToolPageContent
      toolName="Protect PDF"
      toolDescription="Add password protection to your PDF files."
      currentTool="protect-pdf"
      steps={[
        "Upload your PDF file.",
        "Enter a password.",
        "Click 'Protect PDF'.",
        "Download your protected PDF."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Protect PDF Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}