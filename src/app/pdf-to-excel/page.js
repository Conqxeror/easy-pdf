import ToolPageContent from "@/components/ui/ToolPageContent";

export default function PdfToExcel() {
  return (
    <ToolPageContent
      toolName="PDF to Excel"
      toolDescription="Convert your PDF files to Excel format."
      currentTool="pdf-to-excel"
      steps={[
        "Upload your PDF file.",
        "Click the 'Convert to Excel' button.",
        "Download your converted Excel file."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">PDF to Excel Tool - Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}