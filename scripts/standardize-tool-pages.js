#!/usr/bin/env node

// This script helps standardize tool pages across the application
// It creates the necessary directory structure and files for a consistent approach

const fs = require('fs');
const path = require('path');

// Tool page template
const createToolPage = (toolName, toolPath) => {
  return `import React from 'react';
import { toolsData } from '@/lib/toolData';

// Dynamically import the client component
import dynamic from 'next/dynamic';

const ${toolName.replace(/\s+/g, '')}Client = dynamic(() => import('./components/${toolName.replace(/\s+/g, '')}Client'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl border border-gray-200">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p>Loading PDF processing tools...</p>
    </div>
  )
});

// Get tool data for this specific tool
const currentToolData = toolsData.find(tool => tool.href === '/${toolPath}');

export const metadata = {
  title: currentToolData?.seoTitle || "${toolName} - PDF Tool",
  description: currentToolData?.seoDescription || "Process your PDF documents with our free online tool.",
};

export default function ${toolName.replace(/\s+/g, '')}Page() {
  return <${toolName.replace(/\s+/g, '')}Client />;
}
`;
};

// Client component template
const createClientComponent = (toolName, toolPath) => {
  return `"use client";

import React, { useState } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import StandardToolPageTemplate from "@/components/ui/StandardToolPageTemplate";
import { toolsData } from '@/lib/toolData';

export default function ${toolName.replace(/\s+/g, '')}Client() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get tool data for this specific tool
  const toolData = toolsData.find(tool => tool.href === '/${toolPath}');

  const handleFiles = (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setError("");
  };

  // Define tool content
  const toolName = toolData?.title || "${toolName}";
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
    <StandardToolPageTemplate
      title="${toolName}"
      subtitle="Process your PDF documents with our free online tool."
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="${toolPath}"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: '${toolName}', href: '/${toolPath}' }
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
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Processing...
              </span>
            ) : (
              "Process PDF"
            )}
          </Button>
        </div>
      </div>
    </StandardToolPageTemplate>
  );
}
`;
};

// Usage instructions
console.log("To standardize a tool page:");
console.log("1. Create a components directory in the tool's folder");
console.log("2. Create a client component using the template above");
console.log("3. Update the page.js file to use dynamic imports");
console.log("4. Ensure the toolData in lib/toolData.js has the correct features");
console.log("");
console.log("Example usage for a new tool:");
console.log("mkdir src/app/new-tool/components");
console.log("# Create src/app/new-tool/page.js with the page template");
console.log("# Create src/app/new-tool/components/NewToolClient.js with the client template");