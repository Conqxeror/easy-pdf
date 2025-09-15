"use client";

import React, { useState } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import EnhancedToolPageLayout from "@/components/ui/EnhancedToolPageLayout";
import { toolsData } from '@/lib/toolData';

export default function JpgToPdfClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing] = useState(false);

  // Get tool data for this specific tool
  const toolData = toolsData.find(tool => tool.href === '/jpg-to-pdf');

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setError("");
  };

  // Define tool content
  const toolName = toolData?.title || "JPG to PDF Converter";
  const toolDescription = toolData?.description || "Convert your JPG, PNG, or other images into a PDF document with our free online tool. Our converter processes your images directly in your browser, ensuring your privacy and providing instant results. Combine multiple images into one PDF quickly and securely.";
  
  const steps = [
    "Upload your image files (JPG, PNG, GIF, WEBP) by dragging them into the dropzone or clicking to select files.",
    "Review the selected images. You can remove any unwanted images before conversion.",
    "Click the 'Convert to PDF' button to start the conversion process.",
    "Download your newly created PDF document containing all your images.",
  ];
  
  const faqs = [
    {
      question: "Is it free to convert JPG to PDF?",
      answer: "Yes, our JPG to PDF converter is completely free to use. You can convert as many image files as you need without any hidden costs or limitations."
    },
    {
      question: "Are my files secure when converting JPG to PDF?",
      answer: "Absolutely. Your privacy is our top priority. All JPG to PDF conversion happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential."
    },
    {
      question: "What image formats are supported?",
      answer: "Our tool supports JPG, PNG, GIF, and WEBP image formats. You can combine different image types into a single PDF."
    },
    {
      question: "Can I combine multiple images into one PDF?",
      answer: "Yes, you can upload multiple image files, and our tool will combine them into a single PDF document, with each image appearing on a new page."
    },
    {
      question: "Is there a file size limit for JPG to PDF conversion?",
      answer: "While there isn't a strict limit on the number of images, the total size of all uploaded images should ideally not exceed 50MB for optimal performance, as all processing occurs client-side."
    }
  ];
  
  const useCases = [
    {
      title: "Business Documents",
      description: "Combine multiple receipts, invoices, or business documents into a single PDF for easy sharing and storage."
    },
    {
      title: "Academic Submissions",
      description: "Create a single PDF from multiple assignment pages or research images for submission to educational institutions."
    },
    {
      title: "Photography Portfolios",
      description: "Compile your best photos into a single portfolio PDF to share with clients or for online presentations."
    },
    {
      title: "Personal Records",
      description: "Digitize physical documents by converting photos of them into organized PDF files for personal record keeping."
    }
  ];

  return (
    <EnhancedToolPageLayout
      title="JPG to PDF Converter"
      subtitle="Convert your JPG, PNG, and other image files into a single PDF document."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="jpg-to-pdf"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'JPG to PDF', href: '/jpg-to-pdf' }
      ]}
      features={toolData?.features || []}
      useCases={useCases}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="image/jpeg, image/png, image/gif, image/webp"
          multiple={true}
          onFiles={handleFiles}
          error={error}
          setError={setError}
          label="Choose Image Files"
          description="Drag & drop or click to select JPG, PNG, GIF, or WEBP files (Max 50MB total)"
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
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Converting...
              </span>
            ) : (
              "Convert to PDF"
            )}
          </Button>
        </div>
      </div>
    </EnhancedToolPageLayout>
  );
}