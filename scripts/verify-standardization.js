#!/usr/bin/env node

// Script to verify all tool pages have been standardized
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

console.log('Verifying standardized tool pages...\n');

let successCount = 0;
let errorCount = 0;

toolDirectories.forEach(toolDir => {
  const toolPath = path.join('src', 'app', toolDir);
  const pageFilePath = path.join(toolPath, 'page.js');
  const componentsPath = path.join(toolPath, 'components');
  
  // Check if the tool directory exists
  if (!fs.existsSync(toolPath)) {
    console.log(`❌ ${toolDir} - Directory not found`);
    errorCount++;
    return;
  }
  
  // Check if page.js exists
  if (!fs.existsSync(pageFilePath)) {
    console.log(`❌ ${toolDir} - page.js not found`);
    errorCount++;
    return;
  }
  
  // Check if components directory exists
  if (!fs.existsSync(componentsPath)) {
    console.log(`❌ ${toolDir} - Components directory not found`);
    errorCount++;
    return;
  }
  
  // Check if there's at least one client component
  const componentFiles = fs.readdirSync(componentsPath).filter(file => file.endsWith('Client.js'));
  if (componentFiles.length === 0) {
    console.log(`❌ ${toolDir} - No client component found`);
    errorCount++;
    return;
  }
  
  // Read page content to verify it uses dynamic imports
  const pageContent = fs.readFileSync(pageFilePath, 'utf8');
  if (!pageContent.includes('dynamic from \'next/dynamic\'') || 
      !pageContent.includes('toolsData.find')) {
    console.log(`❌ ${toolDir} - Page not properly standardized`);
    errorCount++;
    return;
  }
  
  console.log(`✅ ${toolDir} - Properly standardized`);
  successCount++;
});

console.log(`\n\nVerification complete:`);
console.log(`✅ Successfully standardized: ${successCount}`);
console.log(`❌ Issues found: ${errorCount}`);
console.log(`📊 Total tool pages checked: ${toolDirectories.length}`);

if (errorCount === 0) {
  console.log('\n🎉 All tool pages have been successfully standardized!');
} else {
  console.log('\n⚠️  Some tool pages may need manual attention.');
}