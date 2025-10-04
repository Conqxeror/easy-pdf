"use client";

import React, { useState } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import EnhancedToolPageLayout from "@/components/ui/EnhancedToolPageLayout";
import { toolsData } from '@/lib/toolData';

export default function PdfDigitalSignatureClient() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing] = useState(false);

  // Get tool data for this specific tool
  const toolData = toolsData.find(tool => tool.href === '/pdf-digital-signature');

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setError("");
  };

  // Define tool content
  const toolName = toolData?.title || "Pdf Digital Signature";
  const toolDescription = toolData?.description || "Process your PDF documents with our free online tool. All processing happens directly in your browser for maximum privacy and security.";
  
  const steps = [
    "Upload your PDF file by dragging it into the dropzone or clicking to select a file.",
    "Configure any options specific to this tool if available.",
    "Click the process button to start the operation.",
    "Download your processed file when complete.",
  ];
  
  const faqs = [
    {
      question: "Is this tool free to use?",
      answer: "Yes, all our PDF tools are completely free to use with no hidden costs or limitations."
    },
    {
      question: "Are my files secure when using this tool?",
      answer: "Absolutely. All processing happens directly in your browser. Your files are never uploaded to any server, ensuring complete privacy."
    },
    {
      question: "Is there a file size limit?",
      answer: "Yes, the maximum file size is 50MB. For larger files, processing might be slower due to client-side operations."
    }
  ];
  
  const useCases = [
    {
      title: "Document Processing",
      description: "Process PDF documents for various use cases with our privacy-focused tools."
    },
    {
      title: "File Management",
      description: "Manage your PDF files efficiently with our browser-based processing tools."
    }
  ];

  return (
    <EnhancedToolPageLayout
      title="Pdf Digital Signature"
      subtitle="Process your PDF documents with our free online tool."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="pdf-digital-signature"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Pdf Digital Signature', href: '/pdf-digital-signature' }
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
                Processing...
              </span>
            ) : (
              "Process PDF"
            )}
          </Button>
        </div>
      </div>
    </EnhancedToolPageLayout>
  );
}
