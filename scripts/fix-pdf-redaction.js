#!/usr/bin/env node

// Script to fix specific issues with PDF redaction tool
const fs = require('fs');
const path = require('path');

// Fix PDF redaction page
const pdfRedactionPagePath = path.join('src', 'app', 'pdf-redaction', 'page.js');

if (fs.existsSync(pdfRedactionPagePath)) {
  const content = `import React from 'react';
import { toolsData } from '@/lib/toolData';

// Dynamically import the client component
import dynamic from 'next/dynamic';

const PdfRedactionClient = dynamic(() => import('./components/PdfRedactionClient'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl border border-gray-200">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p>Loading PDF processing tools...</p>
    </div>
  )
});

// Get tool data for this specific tool
const currentToolData = toolsData.find(tool => tool.href === '/pdf-redaction');

export const metadata = {
  title: currentToolData?.seoTitle || "PDF Redaction Tool - Securely Remove Sensitive Information",
  description: currentToolData?.seoDescription || "Permanently remove sensitive information from PDF documents with verification.",
};

export default function PdfRedactionPage() {
  return <PdfRedactionClient />;
}
`;
  
  fs.writeFileSync(pdfRedactionPagePath, content);
  console.log('✓ Fixed PDF redaction page');
}

// Remove invalid client component file if it exists
const invalidClientPath = path.join('src', 'app', 'pdf-redaction', 'components', 'PDFRedactionTool-SecurelyRemoveSensitiveInformationClient.js');
if (fs.existsSync(invalidClientPath)) {
  fs.unlinkSync(invalidClientPath);
  console.log('✓ Removed invalid client component file');
}

console.log('PDF redaction tool fixes completed!');