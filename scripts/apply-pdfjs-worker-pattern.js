/**
 * Automated script to apply pdfjsWorker pattern to multiple pages
 * 
 * This script safely transforms pages by:
 * 1. Removing static pdfjs imports
 * 2. Adding loadPdfJs import
 * 3. Replacing pdfjs usage with dynamic loadPdfJs() calls
 * 4. Removing obsolete worker configuration
 */

const fs = require('fs');
const path = require('path');

const PAGES_TO_TRANSFORM = [
  'src/app/ocr/page.js',
  'src/app/pdf-accessibility-checker/page.js',
  'src/app/page-numbers/page.js',
  'src/app/organize/page.js',
  'src/app/medical-analyzer/page.js',
  'src/app/reorder/page.js',
  'src/app/sign/page.js',
  // pdf-to-jpg already done manually
];

function transformFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return { success: false, reason: 'File not found' };
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let changes = [];

  // 1. Remove static pdfjs imports and replace with loadPdfJs import
  const staticImportPatterns = [
    {
      pattern: /import\s+\*\s+as\s+(\w+)\s+from\s+['"]pdfjs-dist\/legacy\/build\/pdf['"];?\n?/g,
      replacement: 'import { loadPdfJs } from "@/lib/pdfjsWorker";\n',
      description: 'Replace static pdfjs import with loadPdfJs'
    },
    {
      pattern: /import\s+\*\s+as\s+(\w+)\s+from\s+['"]pdfjs-dist\/build\/pdf['"];?\n?/g,
      replacement: 'import { loadPdfJs } from "@/lib/pdfjsWorker";\n',
      description: 'Replace static pdfjs import with loadPdfJs'
    }
  ];

  staticImportPatterns.forEach(({ pattern, replacement, description }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changes.push(description);
    }
  });

  // 2. Remove worker configuration blocks
  const workerConfigPatterns = [
    {
      pattern: /\/\/\s*Configure\s+pdfjs\s+worker\s*\n\s*if\s*\([^)]+\)\s*{\s*\n\s*[^}]+\.GlobalWorkerOptions\.workerSrc\s*=\s*['"][^'"]+['"];?\s*\n\s*}\s*\n?/g,
      description: 'Remove standalone worker configuration block'
    },
    {
      pattern: /if\s*\(typeof\s+window\s*!==\s*['"]undefined['"]\s*&&\s+\w+\s*&&\s*\w+\.GlobalWorkerOptions\)\s*{\s*\n\s*\w+\.GlobalWorkerOptions\.workerSrc\s*=\s*['"][^'"]+['"];?\s*\n\s*}\s*\n?/g,
      description: 'Remove inline worker configuration'
    }
  ];

  workerConfigPatterns.forEach(({ pattern, description }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      changes.push(description);
    }
  });

  // 3. Transform inline pdfjs dynamic imports
  const inlineDynamicImportPattern = /const\s+(\w+)\s*=\s*await\s+import\s*\(['"]pdfjs-dist\/legacy\/build\/pdf['"]\);?\s*\n\s*\2\.GlobalWorkerOptions\.workerSrc\s*=\s*['"][^'"]+['"];?/g;
  
  if (inlineDynamicImportPattern.test(content)) {
    content = content.replace(
      inlineDynamicImportPattern,
      'const $1 = await loadPdfJs();'
    );
    changes.push('Replace inline dynamic import with loadPdfJs()');
  }

  // 4. Check if we need to add loadPdfJs import if it's not there
  if (!content.includes('loadPdfJs') && !content.includes('pdfjsWorker')) {
    // Find the import section and add our import
    const importSectionMatch = content.match(/^(import\s+.*\n)+/m);
    if (importSectionMatch) {
      const insertPosition = importSectionMatch[0].length;
      content = content.slice(0, insertPosition) + 
                'import { loadPdfJs } from "@/lib/pdfjsWorker";\n' +
                content.slice(insertPosition);
      changes.push('Add loadPdfJs import');
    }
  }

  // If no changes were made, return early
  if (content === originalContent) {
    return { 
      success: false, 
      reason: 'No transformations needed (already updated or no pdfjs usage)',
      changes: []
    };
  }

  // Write the transformed content
  fs.writeFileSync(fullPath, content, 'utf8');
  
  return {
    success: true,
    changes,
    originalLines: originalContent.split('\n').length,
    newLines: content.split('\n').length
  };
}

function transformAll() {
  console.log('🚀 Starting batch transformation of pdfjs usage...\n');
  
  const results = PAGES_TO_TRANSFORM.map(filePath => {
    console.log(`\n📄 Processing: ${filePath}`);
    const result = transformFile(filePath);
    
    if (result.success) {
      console.log('  ✅ Transformed successfully');
      result.changes.forEach(change => {
        console.log(`     • ${change}`);
      });
      console.log(`     Lines: ${result.originalLines} → ${result.newLines}`);
    } else {
      console.log(`  ⚠️  ${result.reason}`);
    }
    
    return { filePath, ...result };
  });

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('\n\n📊 Transformation Summary:');
  console.log(`  Total files processed: ${results.length}`);
  console.log(`  Successfully transformed: ${successful.length}`);
  console.log(`  Skipped/failed: ${failed.length}\n`);

  if (successful.length > 0) {
    console.log('✅ Successfully transformed files:');
    successful.forEach(r => {
      console.log(`  • ${r.filePath}`);
    });
  }

  if (failed.length > 0) {
    console.log('\n⚠️  Skipped files:');
    failed.forEach(r => {
      console.log(`  • ${r.filePath}: ${r.reason}`);
    });
  }

  console.log('\n⚠️  IMPORTANT: Manual review required for:');
  console.log('  1. Functions that use pdfjs must call loadPdfJs() before usage');
  console.log('  2. Store pdfjs instance: const pdfjs = await loadPdfJs();');
  console.log('  3. Then use: await pdfjs.getDocument(...).promise');
  console.log('\n  Run: npm run lint && npm run build\n');

  return results;
}

if (require.main === module) {
  transformAll();
}

module.exports = { transformFile, transformAll };
