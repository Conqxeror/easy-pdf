#!/usr/bin/env node

// Script to fix PDF redaction client file casing
const fs = require('fs');
const path = require('path');

const oldPath = path.join('src', 'app', 'pdf-redaction', 'components', 'PDFRedactionClient.js');
const newPath = path.join('src', 'app', 'pdf-redaction', 'components', 'PdfRedactionClient.js');

if (fs.existsSync(oldPath)) {
  // Read the content
  const content = fs.readFileSync(oldPath, 'utf8');
  
  // Update the component name in the content
  const updatedContent = content.replace(
    /export default function PDFRedactionClient\(\) \{/,
    'export default function PdfRedactionClient() {'
  );
  
  // Write to the new file
  fs.writeFileSync(newPath, updatedContent);
  
  // Remove the old file
  fs.unlinkSync(oldPath);
  
  console.log('✓ Renamed PDFRedactionClient.js to PdfRedactionClient.js and updated component name');
} else {
  console.log('PDFRedactionClient.js not found');
}