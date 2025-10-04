"use client";

import React, { useState } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import EnhancedToolPageLayout from "@/components/ui/EnhancedToolPageLayout";
import { toolsData } from '@/lib/toolData';

export default function PageNumbersClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing] = useState(false);

  // Get tool data for this specific tool
  const toolData = toolsData.find(tool => tool.href === '/page-numbers');

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setError("");
  };

  // Define tool content
  const toolName = toolData?.title || "Add Page Numbers";
  const toolDescription = toolData?.description || "Insert customizable page numbers, headers, or footers into your PDF. Our free online PDF page numbering tool allows you to add sequential page numbers, customize formatting, and position page numbers exactly where you need them. All processing happens directly in your browser, ensuring your documents remain private and secure.";
  
  const steps = [
    "Upload your PDF file by dragging it into the dropzone or clicking to select a file from your device.",
    "Choose where to place your page numbers: Header (top of page), Footer (bottom of page), or Margins (side of page).",
    "Select your numbering format: Simple numbers (1, 2, 3...), Roman numerals (I, II, III...), or custom text with page number placeholders.",
    "Customize the appearance including font, size, color, and alignment (left, center, right) to match your document style.",
    "Specify which pages to number: All pages, specific page ranges, or start numbering from a specific page.",
    "Click the 'Add Page Numbers' button to apply your customized page numbering to your document.",
    "Download your PDF file with professional page numbers, headers, or footers applied.",
  ];
  
  const faqs = [
    {
      question: "Why should I add page numbers to my PDF?",
      answer: "Page numbers improve document navigation, especially for long documents. They help readers reference specific sections, create professional-looking documents, and meet formatting requirements for academic papers, business reports, and legal documents."
    },
    {
      question: "Is it free to add page numbers to PDFs?",
      answer: "Yes, our PDF page numbering tool is completely free to use. You can add page numbers, headers, and footers to as many PDF files as you need without any hidden costs or limitations."
    },
    {
      question: "Are my files secure when adding page numbers?",
      answer: "Absolutely. All PDF page numbering happens directly in your web browser. Your files are never uploaded or stored on any server, ensuring your documents remain confidential."
    },
    {
      question: "What numbering formats are available?",
      answer: "Our tool supports various numbering formats including standard numbers (1, 2, 3...), Roman numerals (I, II, III...), alphabetic (A, B, C...), and custom text with page number placeholders for more complex numbering schemes."
    },
    {
      question: "Can I skip numbering certain pages?",
      answer: "Yes, you can specify page ranges for numbering. This is particularly useful for documents that begin with a cover page or table of contents where you might want to start numbering later in the document."
    }
  ];
  
  const useCases = [
    {
      title: "Academic Documents",
      description: "Add proper page numbering to research papers, theses, dissertations, and academic reports to meet institutional formatting requirements."
    },
    {
      title: "Business Reports",
      description: "Create professional business documents with page numbers, headers, and footers that include company information, document titles, and page references."
    },
    {
      title: "Legal Documents",
      description: "Add sequential page numbering to contracts, agreements, and legal briefs to facilitate referencing and maintain document integrity for legal proceedings."
    },
    {
      title: "Publication Materials",
      description: "Prepare manuscripts, newsletters, and magazines with consistent page numbering, headers, and footers for professional publication quality."
    }
  ];

  return (
    <EnhancedToolPageLayout
      title="Add Page Numbers"
      subtitle="Insert customizable page numbers, headers, or footers into your PDF documents with our free online tool."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="page-numbers"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Add Page Numbers', href: '/page-numbers' }
      ]}
      features={toolData?.features || []}
      useCases={useCases}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="application/pdf"
          multiple={false}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Choose a PDF File"
          description="Drag & drop or click to select a PDF file (Max 50MB)"
          maxSize={50 * 1024 * 1024}
          isLoading={isProcessing}
        />

        {error && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}

        <div className="flex justify-center">
          <Button
            onClick={() => {}}
            disabled={isProcessing || !file}
            size="lg"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></span>
                Adding Page Numbers...
              </span>
            ) : (
              "Add Page Numbers to PDF"
            )}
          </Button>
        </div>
      </div>
    </EnhancedToolPageLayout>
  );
}