"use client";

import React, { useState } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { toolsData } from '@/lib/toolData';

export default function OrganizeClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing] = useState(false);

  // Get tool data for this specific tool
  const toolData = toolsData.find(tool => tool.href === '/organize');

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setError("");
  };

  // Define tool content
  const toolName = toolData?.title || "Organize PDF";
  const toolDescription = toolData?.description || "Combine reordering and deletion to organize your PDF pages. Our free online PDF organizer makes it easy to manage your documents with a comprehensive visual interface. All processing happens directly in your browser, ensuring your files remain private and secure.";
  
  const steps = [
    "Upload your PDF file by dragging it into the dropzone or clicking to select a file from your device.",
    "Once uploaded, you'll see a thumbnail preview of each page. Use the visual interface to reorder pages by dragging and dropping them to new positions.",
    "Delete unwanted pages by selecting them and clicking the delete button, or mark multiple pages for removal.",
    "Add page numbers, headers, or footers to your organized document for better navigation and professional appearance.",
    "Click the 'Organize PDF' button to apply all your changes and create your newly organized document.",
    "Download your reorganized PDF file with pages in their new order and unwanted pages removed.",
  ];
  
  const faqs = [
    {
      question: "Is it free to organize PDF pages?",
      answer: "Yes, our PDF organizer is completely free to use. You can reorder pages, delete unwanted content, and manage your PDF documents without any hidden costs or limitations."
    },
    {
      question: "Are my files secure when organizing PDFs?",
      answer: "Absolutely. All PDF organization happens directly in your web browser. Your files are never uploaded or stored on any server, ensuring your documents remain confidential."
    },
    {
      question: "Can I undo changes while organizing?",
      answer: "Yes, our tool provides an intuitive interface with undo/redo functionality. You can easily revert any changes you make during the organization process."
    },
    {
      question: "What organization features are available?",
      answer: "Our comprehensive PDF organizer includes page reordering with drag-and-drop, selective page deletion, page numbering, header/footer insertion, and rotation tools."
    },
    {
      question: "Is there a file size limit?",
      answer: "Yes, the maximum file size for PDF organization is 50MB. For larger files, processing might be slower due to client-side operations."
    }
  ];
  
  const useCases = [
    {
      title: "Document Restructuring",
      description: "Reorganize complex documents by rearranging sections, removing irrelevant pages, and adding proper page numbering for improved flow."
    },
    {
      title: "Report Compilation",
      description: "Combine multiple sources into a single cohesive report by reordering pages, deleting duplicates, and adding professional headers and footers."
    },
    {
      title: "Academic Papers",
      description: "Organize research materials, thesis sections, and supporting documents into a structured format with proper page sequencing and navigation aids."
    },
    {
      title: "Business Documents",
      description: "Prepare professional presentations and proposals by arranging content logically, removing drafts, and adding consistent page numbering and branding."
    }
  ];

  return (
    <ToolPageLayout
      title="Organize PDF"
      subtitle="Combine reordering and deletion to organize your PDF pages with our comprehensive visual management tool."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="organize"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Organize PDF', href: '/organize' }
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
                Organizing...
              </span>
            ) : (
              "Organize PDF"
            )}
          </Button>
        </div>
      </div>
    </ToolPageLayout>
  );
}