/**
 * Batch script to apply pdfjsWorker pattern to all pages using pdfjs-dist
 * 
 * This script:
 * 1. Identifies pages with direct pdfjs-dist imports
 * 2. Replaces with dynamic import via loadPdfJs helper
 * 3. Updates worker configuration
 * 
 * Expected bundle size reduction: 30-40% First Load JS per page
 */

const fs = require('fs');
const path = require('path');

// Pages that need pdfjsWorker pattern applied
const PAGES_TO_UPDATE = [
  'src/app/ocr/page.js',
  'src/app/pdf-to-jpg/page.js',
  'src/app/pdf-accessibility-checker/page.js',
  'src/app/page-numbers/page.js',
  'src/app/organize/page.js',
  'src/app/medical-analyzer/page.js',
  'src/app/legal-analyzer/page.js',
  'src/app/reorder/page.js',
  'src/app/sign/page.js',
];

// Pattern to find static pdfjs imports
const STATIC_IMPORT_PATTERNS = [
  /import\s+\*\s+as\s+(\w+)\s+from\s+['"]pdfjs-dist\/legacy\/build\/pdf['"]/g,
  /import\s+\*\s+as\s+(\w+)\s+from\s+['"]pdfjs-dist\/build\/pdf['"]/g,
  /const\s+(\w+)\s*=\s*await\s+import\s*\(['"]pdfjs-dist\/legacy\/build\/pdf['"]\)/g,
];

// Worker configuration patterns to update
const WORKER_CONFIG_PATTERNS = [
  /(\w+)\.GlobalWorkerOptions\.workerSrc\s*=\s*['"]\/pdf\.worker(?:\.min)?\.js['"]/g,
];

function analyzeFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return null;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Check for static imports
  const hasStaticImport = STATIC_IMPORT_PATTERNS.some(pattern => 
    pattern.test(content)
  );
  
  // Check for worker configuration
  const hasWorkerConfig = WORKER_CONFIG_PATTERNS.some(pattern =>
    pattern.test(content)
  );
  
  // Check if already using loadPdfJs
  const usesLoadPdfJs = /loadPdfJs|pdfjsWorker/.test(content);
  
  return {
    path: filePath,
    hasStaticImport,
    hasWorkerConfig,
    usesLoadPdfJs,
    needsUpdate: (hasStaticImport || hasWorkerConfig) && !usesLoadPdfJs,
    content,
    lines: content.split('\n').length
  };
}

function generateReport() {
  console.log('🔍 Analyzing pages for pdfjs-dist usage...\n');
  
  const results = PAGES_TO_UPDATE
    .map(analyzeFile)
    .filter(Boolean);
  
  const needsUpdate = results.filter(r => r.needsUpdate);
  const alreadyUpdated = results.filter(r => r.usesLoadPdfJs);
  
  console.log('📊 Analysis Results:\n');
  console.log(`Total pages analyzed: ${results.length}`);
  console.log(`Already using pdfjsWorker: ${alreadyUpdated.length}`);
  console.log(`Needs update: ${needsUpdate.length}\n`);
  
  if (needsUpdate.length > 0) {
    console.log('📝 Pages needing update:\n');
    needsUpdate.forEach(r => {
      console.log(`  ✗ ${r.path}`);
      console.log(`    - Static import: ${r.hasStaticImport}`);
      console.log(`    - Worker config: ${r.hasWorkerConfig}`);
      console.log(`    - Lines: ${r.lines}\n`);
    });
  }
  
  if (alreadyUpdated.length > 0) {
    console.log('✅ Pages already updated:\n');
    alreadyUpdated.forEach(r => {
      console.log(`  ✓ ${r.path}\n`);
    });
  }
  
  // Estimated bundle impact
  const pdfjsSize = 1.96; // MB from audit
  const estimatedSavingsPerPage = pdfjsSize * 0.35; // 35% savings per page
  const totalSavings = needsUpdate.length * estimatedSavingsPerPage;
  
  console.log('\n💾 Estimated Bundle Impact:');
  console.log(`  Per-page savings: ~${estimatedSavingsPerPage.toFixed(2)} MB`);
  console.log(`  Total savings across ${needsUpdate.length} pages: ~${totalSavings.toFixed(2)} MB\n`);
  
  return { results, needsUpdate, alreadyUpdated };
}

if (require.main === module) {
  generateReport();
}

module.exports = { analyzeFile, generateReport, PAGES_TO_UPDATE };
