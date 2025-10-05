#!/usr/bin/env node

/**
 * Script to convert direct pdf-lib imports to dynamic imports
 * Run this script to complete the pdf-lib dynamic import migration
 * 
 * Usage: node scripts/convert-pdf-lib-imports.js
 */

const fs = require('fs');
const path = require('path');

// List of files that need pdf-lib dynamic import conversion
const filesToConvert = [
  'src/app/qr-generator/page.js',
  'src/app/portfolio-creator/page.js',
  'src/app/page-numbers/page.js',
  'src/app/organize/page.js',
  'src/app/jpg-to-pdf/page.js',
  'src/app/invoice-generator/page.js',
  'src/app/delete-pages/page.js',
  'src/app/certificate-generator/page.js',
  'src/app/form-filler/page.js',
];

console.log('🔄 Converting pdf-lib imports to dynamic imports...\n');

let converted = 0;
let skipped = 0;
let errors = 0;

filesToConvert.forEach((filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      skipped++;
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Step 1: Replace import statement
    const importPatterns = [
      {
        old: /import\s+{\s*PDFDocument\s*}\s+from\s+["']pdf-lib["'];?/g,
        new: 'import { loadPdfLib } from "@/lib/pdfjsWorker";'
      },
      {
        old: /import\s+{\s*PDFDocument,\s*rgb\s*}\s+from\s+["']pdf-lib["'];?/g,
        new: 'import { loadPdfLib } from "@/lib/pdfjsWorker";'
      },
      {
        old: /import\s+{\s*PDFDocument,\s*rgb,\s*StandardFonts\s*}\s+from\s+["']pdf-lib["'];?/g,
        new: 'import { loadPdfLib } from "@/lib/pdfjsWorker";'
      },
    ];

    importPatterns.forEach(({ old, new: newImport }) => {
      if (old.test(content)) {
        content = content.replace(old, newImport);
        modified = true;
      }
    });

    if (modified) {
      // Write back
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Converted: ${filePath}`);
      converted++;
    } else {
      console.log(`⏭️  Skipped (already converted): ${filePath}`);
      skipped++;
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    errors++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Converted: ${converted}`);
console.log(`   ⏭️  Skipped: ${skipped}`);
console.log(`   ❌ Errors: ${errors}`);

console.log(`\n⚠️  IMPORTANT: You still need to update function calls manually!`);
console.log(`   Add this line at the beginning of async functions that use PDFDocument:`);
console.log(`   const { PDFDocument, rgb, StandardFonts } = await loadPdfLib();`);
console.log(`\n   Example locations:`);
console.log(`   - Before: const pdfDoc = await PDFDocument.load(...)`);
console.log(`   - After:  const { PDFDocument } = await loadPdfLib();`);
console.log(`             const pdfDoc = await PDFDocument.load(...)`);
