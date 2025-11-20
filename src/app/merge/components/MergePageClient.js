import MergeClient from './MergeClient';
import ToolPageLayout from "@/components/ui/ToolPageLayout";

export default function MergePDFs() {
  const toolName = "Merge PDFs";
  const toolDescription = "Merge multiple PDF files into one file entirely in your browser.";
  const steps = [
    "Upload your PDF files using the drag & drop area or file picker.",
    "Reorder uploaded files by dragging list items into the desired order.",
    "Preview the merged document in the built-in preview pane.",
    "Click 'Merge PDFs' to combine files into a single downloadable PDF.",
    "Use the split or reorder tools for fine-grained page adjustments after merging."
  ];
  const faqs = [
    { question: "Is my data uploaded to servers?", answer: "No — merging happens client-side in your browser. Files are processed locally and are not uploaded." },
    { question: "What file types are supported?", answer: "PDF files only. Make sure each file has a .pdf extension for best results." },
    { question: "What size limits are there?", answer: "Individual files up to 50MB are supported. For very large batches, merge in smaller groups to avoid memory limits in the browser." },
    { question: "Can I change the order after uploading?", answer: "Yes — drag any file in the list to change the order before merging." },
    { question: "Will the merged PDF preserve quality?", answer: "Yes — the tool preserves original PDF quality, fonts, and vector content where possible." }
  ];

  return (
    <ToolPageLayout
      title="Merge PDF Files"
      subtitle="Merge multiple PDF files into one seamlessly in your browser."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="merge"
      primaryActionHref="/split"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Merge PDF', href: '/merge' }
      ]}
    >
      <MergeClient />
    </ToolPageLayout>
  );
}
