import PDFRedactionClient from './components/PDFRedactionClient';
import ToolPageLayout from "@/components/ui/ToolPageLayout";

export default function PDFRedaction() {
  const toolName = "PDF Redaction";
  const toolDescription = "Permanently remove or mask sensitive information from PDF documents right in your browser.";
  const steps = [
    "Upload or drop your PDF using the file selector or drag & drop area.",
    "Use the 'Search & Mark' tab to find text patterns (emails, SSNs, numbers).",
    "Add manual redaction areas for images or custom regions.",
    "Review your selections and click 'Apply Redactions' to generate the redacted PDF.",
    "Download the redacted PDF and verify the output locally."
  ];
  const faqs = [
    { question: "Is redaction reversible?", answer: "No — redaction permanently removes the selected content from the output PDF. Always keep a backup of the original." },
    { question: "Does this upload files?", answer: "No. All processing happens client-side in your browser; nothing is sent to our servers by default." },
    { question: "Can I redact images as well as text?", answer: "Yes — use the Manual Areas tab to define rectangles that cover images or any visual content." },
    { question: "Is this suitable for compliance needs?", answer: "The tool is designed to help with GDPR/HIPAA-style redaction workflows, but for high-assurance legal requirements, validate results with your compliance team." },
    { question: "How do I verify redactions?", answer: "Open the redacted PDF and visually inspect pages; for critical use-cases, use dedicated PDF forensics tools to verify removal." }
  ];

  return (
    <ToolPageLayout
      title="Redact Sensitive Information from PDFs"
      subtitle="Permanently remove text, images, and metadata from PDF files locally in your browser."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="pdf-redaction"
      primaryActionHref="/merge"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'PDF Redaction', href: '/pdf-redaction' }
      ]}
    >
      <PDFRedactionClient />
    </ToolPageLayout>
  );
}