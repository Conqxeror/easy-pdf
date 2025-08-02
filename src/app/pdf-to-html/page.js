import ToolPageContent from "@/components/ui/ToolPageContent";

export default function PdfToHtml() {
  return (
    <ToolPageContent
      toolName="PDF to HTML"
      toolDescription="Convert your PDF files to HTML format."
      currentTool="pdf-to-html"
      steps={[
        "Upload your PDF file.",
        "Click the 'Convert to HTML' button.",
        "Download your converted HTML file."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">PDF to HTML Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}