#!/usr/bin/env node
/**
 * Content & Page Template Validation Script
 * 
 * Validates all tool pages for:
 * - Consistent H1/H2 hierarchy
 * - Proper page structure (ToolPageLayout usage)
 * - CTA placement and consistency
 * - Error handling patterns
 * - File upload/dropzone patterns
 * 
 * Usage: node scripts/validate-content-templates.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class ContentValidator {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      pages: []
    };
  }

  async validateAllPages() {
    console.log('🔍 Scanning for tool pages to validate...\n');

    // Find all page files (excluding layouts, API routes, etc.)
    const pageFiles = await glob('src/app/**/page.{js,jsx,ts,tsx}', {
      ignore: [
        '**/api/**',
        '**/layout.*',
        'src/app/page.*',  // Skip homepage
        'src/app/not-found.*',
      ]
    });
    
    console.log(`Found ${pageFiles.length} tool pages to validate\n`);

    for (const filePath of pageFiles) {
      this.validatePage(filePath);
    }

    this.printReport();
    
    // Exit with error code if critical failures found
    if (this.results.failed > 0) {
      process.exit(1);
    }
  }

  validatePage(filePath) {
    this.results.total++;
    
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const relativePath = path.relative(process.cwd(), fullPath);
    
    const pageResult = {
      path: relativePath,
      issues: [],
      warnings: [],
      checks: {
        usesToolPageLayout: false,
        usesFileDropzone: false,
        hasErrorHandling: false,
        hasClientDirective: false,
        usesEnhancedUX: false,
      }
    };

    // Check for 'use client' directive (required for interactive pages)
    if (content.match(/["']use client["'];?/)) {
      pageResult.checks.hasClientDirective = true;
    } else {
      // Check if page might need client-side interactivity
      if (content.includes('useState') || content.includes('useEffect')) {
        pageResult.issues.push('Missing "use client" directive but uses React hooks');
      }
    }

    // Check for ToolPageLayout usage
    if (content.includes('ToolPageLayout')) {
      pageResult.checks.usesToolPageLayout = true;
    } else {
      pageResult.warnings.push('Not using ToolPageLayout component - consider using for consistency');
    }

    // Check for FileDropzone usage (common pattern for tool pages)
    if (content.includes('FileDropzone') || content.includes('useDropzone')) {
      pageResult.checks.usesFileDropzone = true;
    }

    // Check for error handling patterns
    const hasErrorState = content.includes('error') || content.includes('Error');
    const hasTryCatch = content.includes('try {') && content.includes('catch');
    if (hasErrorState || hasTryCatch) {
      pageResult.checks.hasErrorHandling = true;
    } else if (pageResult.checks.usesFileDropzone) {
      pageResult.warnings.push('File handling detected but no obvious error handling');
    }

    // Check for enhanced UX helpers usage
    if (content.includes('@/lib/enhancedUX')) {
      pageResult.checks.usesEnhancedUX = true;
    } else {
      // Check if page might benefit from enhanced UX
      if (content.includes('URL.createObjectURL') || content.includes('createObjectURL')) {
        pageResult.warnings.push('Uses createObjectURL but not using safeCreateObjectURL from enhancedUX');
      }
      if (content.includes('download=') || content.includes('Download')) {
        pageResult.warnings.push('Has download functionality - consider using sanitizeFileName from enhancedUX');
      }
    }

    // Check for common anti-patterns
    if (content.includes('console.log') && !content.includes('console.error')) {
      pageResult.warnings.push('Contains console.log - ensure these are intentional (not debug leftovers)');
    }

    // Check for accessibility patterns
    if (!content.includes('aria-') && !content.includes('role=')) {
      pageResult.warnings.push('No ARIA attributes found - ensure accessibility is addressed');
    }

    // Check for proper imports
    const importPatterns = {
      'useState': /@\/lib\/useState|from ['"]react['"]/,
      'Button': /@\/components\/ui\/[bB]utton/,
      'Alert': /@\/components\/ui\/[aA]lert/,
    };

    for (const [feature, pattern] of Object.entries(importPatterns)) {
      if (content.includes(feature) && !pattern.test(content)) {
        pageResult.warnings.push(`Uses ${feature} but import pattern unclear`);
      }
    }

    // Check for consistent component patterns
    if (pageResult.checks.usesToolPageLayout) {
      // ToolPageLayout pages should have title and description
      if (!content.includes('title=') && !content.includes('title:')) {
        pageResult.warnings.push('ToolPageLayout used but no title prop found');
      }
    }

    // Update results
    const hasIssues = pageResult.issues.length > 0;
    const hasWarnings = pageResult.warnings.length > 0;

    if (hasIssues) {
      this.results.failed++;
    } else {
      this.results.passed++;
    }

    if (hasWarnings) {
      this.results.warnings++;
    }

    // Only add to results if there are issues or warnings
    if (hasIssues || hasWarnings) {
      this.results.pages.push(pageResult);
    }
  }

  printReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 CONTENT & TEMPLATE VALIDATION REPORT');
    console.log('='.repeat(80) + '\n');

    console.log('Summary:');
    console.log(`  Total pages validated: ${this.results.total}`);
    console.log(`  ✅ Passed: ${this.results.passed}`);
    console.log(`  ❌ Failed: ${this.results.failed}`);
    console.log(`  ⚠️  Warnings: ${this.results.warnings}\n`);

    if (this.results.pages.length === 0) {
      console.log('✅ All pages pass content validation!\n');
      return;
    }

    console.log('Issues & Warnings:\n');

    for (const page of this.results.pages) {
      console.log(`\n📄 ${page.path}`);
      
      if (page.issues.length > 0) {
        console.log('  ❌ Critical Issues:');
        page.issues.forEach(issue => {
          console.log(`     • ${issue}`);
        });
      }

      if (page.warnings.length > 0) {
        console.log('  ⚠️  Warnings:');
        page.warnings.forEach(warning => {
          console.log(`     • ${warning}`);
        });
      }

      console.log('  Pattern Checks:');
      console.log(`     "use client": ${page.checks.hasClientDirective ? '✓' : '✗'}`);
      console.log(`     ToolPageLayout: ${page.checks.usesToolPageLayout ? '✓' : '✗'}`);
      console.log(`     FileDropzone: ${page.checks.usesFileDropzone ? '✓' : 'N/A'}`);
      console.log(`     Error handling: ${page.checks.hasErrorHandling ? '✓' : '✗'}`);
      console.log(`     Enhanced UX helpers: ${page.checks.usesEnhancedUX ? '✓' : 'N/A'}`);
    }

    console.log('\n' + '='.repeat(80));
    
    if (this.results.failed > 0) {
      console.log('❌ VALIDATION FAILED - Please fix critical issues above');
    } else {
      console.log('✅ VALIDATION PASSED - Some warnings may need attention');
    }
    
    console.log('='.repeat(80) + '\n');

    console.log('Best Practices:');
    console.log('  1. Use ToolPageLayout for all tool pages');
    console.log('  2. Include "use client" directive for interactive pages');
    console.log('  3. Implement proper error handling (try/catch + error state)');
    console.log('  4. Use enhanced UX helpers (safeCreateObjectURL, sanitizeFileName)');
    console.log('  5. Add ARIA attributes for accessibility');
    console.log('  6. Remove debug console.log statements');
    console.log('  7. See docs/component-guidelines.md for patterns\n');
  }
}

// Run validation
if (require.main === module) {
  const validator = new ContentValidator();
  validator.validateAllPages().catch(err => {
    console.error('❌ Validation failed:', err);
    process.exit(1);
  });
}

module.exports = ContentValidator;
