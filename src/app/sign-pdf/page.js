import ToolPageContent from "@/components/ui/ToolPageContent";

export default function SignPDF() {
  return (
    <ToolPageContent
      toolName="Sign PDF"
      toolDescription="Sign and annotate PDF files."
      currentTool="sign-pdf"
      steps={[
        "Upload your PDF file.",
        "Draw or type your signature.",
        "Place your signature.",
        "Download your signed PDF."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Sign PDF Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}