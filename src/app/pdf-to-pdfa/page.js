import ToolPageContent from "@/components/ui/ToolPageContent";

export default function PdfToPdfa() {
  return (
    <ToolPageContent
      toolName="PDF to PDF/A"
      toolDescription="Convert your PDF files to PDF/A format."
      currentTool="pdf-to-pdfa"
      steps={[
        "Upload your PDF file.",
        "Click the 'Convert to PDF/A' button.",
        "Download your converted PDF/A file."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">PDF to PDF/A Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}