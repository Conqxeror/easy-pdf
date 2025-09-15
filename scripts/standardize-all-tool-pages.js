#!/usr/bin/env node

// Script to standardize all tool pages
const fs = require('fs');
const path = require('path');

// List of all tool directories
const toolDirectories = [
  'compress', 'delete-pages', 'form-filler', 'jpg-to-pdf', 'legal-analyzer', 
  'medical-analyzer', 'merge', 'ocr', 'organize', 'page-numbers', 'pdf-to-jpg', 
  'protect', 'reorder', 'rotate', 'sign', 'split', 'unlock', 'watermark',
  'advanced-ocr', 'certificate-generator', 'invoice-generator', 'portfolio-creator',
  'qr-generator', 'report-generator', 'pdf-accessibility-checker', 
  'pdf-annotation-collaboration', 'pdf-batch-processor', 'pdf-bookmark-manager',
  'pdf-digital-signature', 'pdf-form-creator', 'pdf-metadata-editor', 
  'pdf-redaction', 'pdf-table-extractor', 'pdf-version-comparison'
];

// Template for the main page file
const createPageTemplate = (toolName, toolPath) => {
  const cleanToolName = toolName.replace(/\s+/g, '');
  return `import React from 'react';
import { toolsData } from '@/lib/toolData';

// Dynamically import the client component
import dynamic from 'next/dynamic';

const ${cleanToolName}Client = dynamic(() => import('./components/${cleanToolName}Client'), {
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

export default function ${cleanToolName}Page() {
  return <${cleanToolName}Client />;
}
`;
};

// Template for the client component
const createClientComponentTemplate = (toolName, toolPath) => {
  const cleanToolName = toolName.replace(/\s+/g, '');
  return `"use client";

import React, { useState } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import StandardToolPageTemplate from "@/components/ui/StandardToolPageTemplate";
import { toolsData } from '@/lib/toolData';

export default function ${cleanToolName}Client() {
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

// Process each tool directory
toolDirectories.forEach(toolDir => {
  const toolPath = path.join('src', 'app', toolDir);
  const componentsPath = path.join(toolPath, 'components');
  
  // Check if the tool directory exists
  if (!fs.existsSync(toolPath)) {
    console.log(`Skipping ${toolDir} - directory not found`);
    return;
  }
  
  // Read the current page file to get the tool name
  const pageFilePath = path.join(toolPath, 'page.js');
  if (!fs.existsSync(pageFilePath)) {
    console.log(`Skipping ${toolDir} - page.js not found`);
    return;
  }
  
  // Try to extract tool name from existing page file
  const pageContent = fs.readFileSync(pageFilePath, 'utf8');
  const titleMatch = pageContent.match(/title:\s*["']([^"']*)["']/);
  const toolName = titleMatch ? titleMatch[1].replace(' | easy-pdf', '').trim() : toolDir.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  console.log(`Processing ${toolDir} - ${toolName}`);
  
  // Create components directory if it doesn't exist
  if (!fs.existsSync(componentsPath)) {
    fs.mkdirSync(componentsPath, { recursive: true });
  }
  
  // Create the new page file
  const newPageContent = createPageTemplate(toolName, toolDir);
  fs.writeFileSync(pageFilePath, newPageContent);
  
  // Create the client component
  const clientComponentPath = path.join(componentsPath, `${toolName.replace(/\s+/g, '')}Client.js`);
  const clientComponentContent = createClientComponentTemplate(toolName, toolDir);
  fs.writeFileSync(clientComponentPath, clientComponentContent);
  
  console.log(`  ✓ Updated ${toolDir}/page.js`);
  console.log(`  ✓ Created ${toolDir}/components/${toolName.replace(/\s+/g, '')}Client.js`);
});

console.log('\nAll tool pages have been standardized!');
console.log('Please review and customize each client component according to the specific tool functionality.');