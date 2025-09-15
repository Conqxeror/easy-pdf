#!/usr/bin/env node

// Script to fix dynamic import issues in page files
const fs = require('fs');
const path = require('path');

// Map of tool directories to their component names
const toolComponentMap = {
  'advanced-ocr': 'AdvancedOcr',
  'certificate-generator': 'CertificateGenerator',
  'compress': 'Compress',
  'delete-pages': 'DeletePages',
  'form-filler': 'FormFiller',
  'invoice-generator': 'InvoiceGenerator',
  'jpg-to-pdf': 'JpgToPdf',
  'legal-analyzer': 'LegalAnalyzer',
  'medical-analyzer': 'MedicalAnalyzer',
  'merge': 'Merge',
  'ocr': 'Ocr',
  'organize': 'Organize',
  'page-numbers': 'PageNumbers',
  'pdf-to-jpg': 'PdfToJpg',
  'pdf-accessibility-checker': 'PdfAccessibilityChecker',
  'pdf-annotation-collaboration': 'PdfAnnotationCollaboration',
  'pdf-batch-processor': 'PdfBatchProcessor',
  'pdf-bookmark-manager': 'PdfBookmarkManager',
  'pdf-digital-signature': 'PdfDigitalSignature',
  'pdf-form-creator': 'PdfFormCreator',
  'pdf-metadata-editor': 'PdfMetadataEditor',
  'pdf-redaction': 'PdfRedaction',
  'pdf-table-extractor': 'PdfTableExtractor',
  'pdf-version-comparison': 'PdfVersionComparison',
  'portfolio-creator': 'PortfolioCreator',
  'protect': 'Protect',
  'qr-generator': 'QrGenerator',
  'reorder': 'Reorder',
  'report-generator': 'ReportGenerator',
  'rotate': 'Rotate',
  'sign': 'Sign',
  'split': 'Split',
  'unlock': 'Unlock',
  'watermark': 'Watermark'
};

// Process each tool directory
Object.keys(toolComponentMap).forEach(toolDir => {
  const componentName = toolComponentMap[toolDir];
  const pagePath = path.join('src', 'app', toolDir, 'page.js');
  
  if (fs.existsSync(pagePath)) {
    // Read the existing content to get the component name and tool path
    const existingContent = fs.readFileSync(pagePath, 'utf8');
    
    // Extract component name from existing content
    const componentMatch = existingContent.match(/const ([A-Za-z0-9]+)Client = dynamic/);
    const actualComponentName = componentMatch ? componentMatch[1] : componentName;
    
    // Extract tool path from existing content
    const toolPathMatch = existingContent.match(/toolsData\.find\(tool => tool\.href === '([^']+)'\)/);
    const toolPath = toolPathMatch ? toolPathMatch[1] : `/${toolDir}`;
    
    // Extract title from existing content
    const titleMatch = existingContent.match(/title: currentToolData\?\.seoTitle \|\| "([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : `${actualComponentName} - PDF Tool`;
    
    // Extract description from existing content
    const descriptionMatch = existingContent.match(/description: currentToolData\?\.seoDescription \|\| "([^"]+)"/);
    const description = descriptionMatch ? descriptionMatch[1] : "Process your PDF documents with our free online tool.";
    
    // Create the new content
    const newContent = `import React from 'react';
import { toolsData } from '@/lib/toolData';

// Dynamically import the client component
import dynamic from 'next/dynamic';

const ${actualComponentName}Client = dynamic(() => import('./components/${actualComponentName}Client'), {
  loading: () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl border border-gray-200">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p>Loading PDF processing tools...</p>
    </div>
  )
});

// Get tool data for this specific tool
const currentToolData = toolsData.find(tool => tool.href === '${toolPath}');

export const metadata = {
  title: currentToolData?.seoTitle || "${title}",
  description: currentToolData?.seoDescription || "${description}",
};

export default function ${actualComponentName}Page() {
  return <${actualComponentName}Client />;
}
`;
    
    fs.writeFileSync(pagePath, newContent);
    console.log(`✓ Fixed dynamic import in ${toolDir}/page.js`);
  }
});

console.log('All page files have been fixed!');