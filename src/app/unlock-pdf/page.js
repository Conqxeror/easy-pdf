import ToolPageContent from "@/components/ui/ToolPageContent";

export default function UnlockPDF() {
  return (
    <ToolPageContent
      toolName="Unlock PDF"
      toolDescription="Remove password from PDF files."
      currentTool="unlock-pdf"
      steps={[
        "Upload your password-protected PDF file.",
        "Enter the password.",
        "Click 'Unlock PDF'.",
        "Download your unlocked PDF."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Unlock PDF Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}