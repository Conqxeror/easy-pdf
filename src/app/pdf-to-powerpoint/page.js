import ToolPageContent from "@/components/ui/ToolPageContent";

export default function PdfToPowerpoint() {
  return (
    <ToolPageContent
      toolName="PDF to PowerPoint"
      toolDescription="Convert your PDF files to PowerPoint format."
      currentTool="pdf-to-powerpoint"
      steps={[
        "Upload your PDF file.",
        "Click the 'Convert to PowerPoint' button.",
        "Download your converted PowerPoint file."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">PDF to PowerPoint Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}