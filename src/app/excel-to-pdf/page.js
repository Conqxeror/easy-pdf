import ToolPageContent from "@/components/ui/ToolPageContent";

export default function ExcelToPDF() {
  return (
    <ToolPageContent
      toolName="Excel to PDF"
      toolDescription="Convert your Excel files to PDF format."
      currentTool="excel-to-pdf"
      steps={[
        "Upload your Excel file.",
        "Click the 'Convert to PDF' button.",
        "Download your converted PDF."
      ]}
      faqs={[
        { question: "Is it free?", answer: "Yes." },
        { question: "Is it secure?", answer: "Yes, client-side processing." }
      ]}
    >
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Excel to PDF Converter Coming Soon!</h2>
        <p>This tool is under development. Please check back later.</p>
      </div>
    </ToolPageContent>
  );
}