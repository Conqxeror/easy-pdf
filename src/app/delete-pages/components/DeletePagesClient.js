"use client";

import React, { useState } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import EnhancedToolPageLayout from "@/components/ui/EnhancedToolPageLayout";
import { toolsData } from '@/lib/toolData';

export default function DeletePagesClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing] = useState(false);

  // Get tool data for this specific tool
  const toolData = toolsData.find(tool => tool.href === '/delete-pages');

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setError("");
  };

  // Define tool content
  const toolName = toolData?.title || "Delete PDF Pages";
  const toolDescription = toolData?.description || "Remove unwanted pages from your PDF document easily. Our free online PDF page deleter helps you trim your documents by removing blank pages, sensitive information, or unnecessary sections. All processing happens directly in your browser, ensuring your files remain private and secure.";
  
  const steps = [
    "Upload your PDF file by dragging it into the dropzone or clicking to select a file from your device.",
    "Select which pages to delete: Choose individual pages by clicking on their thumbnails, or enter page ranges (e.g., 3-7) for bulk deletion.",
    "Preview your selection to ensure you're deleting the correct pages. You can deselect pages if needed.",
    "Click the 'Delete Pages' button to remove the selected pages from your document.",
    "Download your newly trimmed PDF file with the unwanted pages removed.",
  ];
  
  const faqs = [
    {
      question: "Is it free to delete pages from PDFs?",
      answer: "Yes, our PDF page deletion tool is completely free to use. You can remove pages from as many PDF files as you need without any hidden costs or limitations."
    },
    {
      question: "Are my files secure when deleting pages?",
      answer: "Absolutely. All PDF page deletion happens directly in your web browser. Your files are never uploaded or stored on any server, ensuring your documents remain confidential."
    },
    {
      question: "Can I delete multiple pages at once?",
      answer: "Yes, you can delete multiple individual pages or entire page ranges. Simply select the pages you want to remove or enter page ranges (e.g., 3-7, 10-15) for bulk deletion."
    },
    {
      question: "Can I undo page deletions?",
      answer: "Before confirming the deletion, you can review your selected pages and deselect any you want to keep. Once you confirm and download the file, the deleted pages are permanently removed from your downloaded copy."
    },
    {
      question: "Is there a limit to how many pages I can delete?",
      answer: "No, you can delete as many pages as needed from your PDF. The only limitation is the file size (up to 50MB) and the practical considerations of working with very large documents."
    }
  ];
  
  const useCases = [
    {
      title: "Document Cleanup",
      description: "Remove blank pages, test pages, or unwanted sections from scanned documents, reports, or manuals to create cleaner, more focused documents."
    },
    {
      title: "Privacy Protection",
      description: "Delete pages containing sensitive personal information, confidential business data, or private communications before sharing documents with others."
    },
    {
      title: "File Optimization",
      description: "Trim large PDF files by removing unnecessary pages to reduce file size for easier sharing via email or uploading to websites with size restrictions."
    },
    {
      title: "Content Curation",
      description: "Create custom versions of documents by removing irrelevant sections, leaving only the content that's appropriate for specific audiences or purposes."
    }
  ];

  return (
    <EnhancedToolPageLayout
      title="Delete PDF Pages"
      subtitle="Remove unwanted pages from your PDF document easily. Trim your documents with our free online page deletion tool."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="delete-pages"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Delete PDF Pages', href: '/delete-pages' }
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
                Deleting Pages...
              </span>
            ) : (
              "Delete Pages from PDF"
            )}
          </Button>
        </div>
      </div>
    </EnhancedToolPageLayout>
  );
}