#!/usr/bin/env node

// Script to fix linting issues in client components
const fs = require('fs');
const path = require('path');

// Map of tool directories to their proper component names
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
  const componentsPath = path.join('src', 'app', toolDir, 'components');
  
  // Check if the components directory exists
  if (!fs.existsSync(componentsPath)) {
    return;
  }
  
  // Read all files in the components directory
  const files = fs.readdirSync(componentsPath);
  
  files.forEach(file => {
    if (file.endsWith('Client.js')) {
      const filePath = path.join(componentsPath, file);
      
      // Read the file content
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix unused variable issue
      // Remove setIsProcessing if it's declared but not used
      content = content.replace(
        /const \[.*?, setIsProcessing\] = useState\([^)]*\);/g,
        (match) => {
          // Check if setIsProcessing is used anywhere in the file
          if (!content.includes('setIsProcessing(') && !content.includes('setIsProcessing;')) {
            // Replace with just the state variable
            return match.replace(', setIsProcessing', '').replace('useState', 'useState');
          }
          return match;
        }
      );
      
      // Special case for PDF redaction - remove the invalid component file
      if (toolDir === 'pdf-redaction' && file === 'PDFRedactionTool-SecurelyRemoveSensitiveInformationClient.js') {
        fs.unlinkSync(filePath);
        console.log(`  ✓ Removed invalid file: ${file}`);
        return;
      }
      
      // Rename generic "Client.js" files to proper names
      if (file === 'Client.js' && componentName) {
        const newFileName = `${componentName}Client.js`;
        const newFilePath = path.join(componentsPath, newFileName);
        
        // Update the component name in the file
        content = content.replace(
          /export default function Client\(\) \{/,
          `export default function ${componentName}Client() {`
        );
        
        // Write the updated content to the new file
        fs.writeFileSync(newFilePath, content);
        
        // Remove the old file
        fs.unlinkSync(filePath);
        
        console.log(`  ✓ Renamed ${file} to ${newFileName} and updated component name`);
        return;
      }
      
      // Update component name in the file if it's a generic one
      if (componentName && content.includes('export default function Client(')) {
        content = content.replace(
          /export default function Client\(\) \{/,
          `export default function ${componentName}Client() {`
        );
        
        fs.writeFileSync(filePath, content);
        console.log(`  ✓ Updated component name in ${file}`);
      } else {
        // Just write the content back (possibly with unused variable fixes)
        fs.writeFileSync(filePath, content);
        console.log(`  ✓ Fixed unused variables in ${file}`);
      }
    }
  });
});

console.log('\nAll client components have been fixed!');