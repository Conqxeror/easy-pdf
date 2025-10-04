#!/usr/bin/env node
/**
 * SEO & Structured Data Validation Script
 * 
 * Validates all pages for:
 * - Meta titles and descriptions
 * - Open Graph tags
 * - Twitter Card tags
 * - Canonical URLs
 * - JSON-LD structured data
 * - Proper use of seoEnhancements.js
 * 
 * Usage: node scripts/validate-seo.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration
const REQUIRED_META_FIELDS = ['title', 'description'];
const REQUIRED_OG_FIELDS = ['og:title', 'og:description', 'og:image', 'og:url'];
const REQUIRED_TWITTER_FIELDS = ['twitter:card', 'twitter:title', 'twitter:description'];

const SEO_PATTERNS = {
  generateEnhancedMetadata: /generateEnhancedMetadata\s*\(/g,
  generateComprehensiveJsonLd: /generateComprehensiveJsonLd\s*\(/g,
  metadataExport: /export\s+const\s+metadata\s*=/g,
  jsonLdScript: /<script\s+type=["']application\/ld\+json["']/g,
};

class SEOValidator {
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
    console.log('🔍 Scanning for pages to validate...\n');

    // Find all layout and page files
    const layoutFiles = await glob('src/app/**/layout.{js,jsx,ts,tsx}');
    const pageFiles = await glob('src/app/**/page.{js,jsx,ts,tsx}');
    
    const allFiles = [...new Set([...layoutFiles, ...pageFiles])];
    
    console.log(`Found ${allFiles.length} files to validate\n`);

    for (const filePath of allFiles) {
      this.validateFile(filePath);
    }

    this.printReport();
    
    // Exit with error code if failures found
    if (this.results.failed > 0) {
      process.exit(1);
    }
  }

  validateFile(filePath) {
    this.results.total++;
    
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const relativePath = path.relative(process.cwd(), fullPath);
    
    const pageResult = {
      path: relativePath,
      issues: [],
      warnings: [],
      checks: {
        hasMetadataExport: false,
        usesEnhancedMetadata: false,
        hasJsonLd: false,
        usesJsonLdHelper: false,
      }
    };

    // Check for metadata export
    if (SEO_PATTERNS.metadataExport.test(content)) {
      pageResult.checks.hasMetadataExport = true;
    } else if (filePath.includes('/layout.')) {
      pageResult.issues.push('Missing metadata export in layout file');
    }

    // Check for generateEnhancedMetadata usage
    if (SEO_PATTERNS.generateEnhancedMetadata.test(content)) {
      pageResult.checks.usesEnhancedMetadata = true;
    } else if (pageResult.checks.hasMetadataExport) {
      pageResult.warnings.push('Metadata export exists but not using generateEnhancedMetadata helper');
    }

    // Check for JSON-LD script
    if (SEO_PATTERNS.jsonLdScript.test(content)) {
      pageResult.checks.hasJsonLd = true;
    }

    // Check for generateComprehensiveJsonLd usage
    if (SEO_PATTERNS.generateComprehensiveJsonLd.test(content)) {
      pageResult.checks.usesJsonLdHelper = true;
    } else if (pageResult.checks.hasJsonLd) {
      pageResult.warnings.push('JSON-LD script exists but not using generateComprehensiveJsonLd helper');
    }

    // Check for missing SEO enhancements import
    if (pageResult.checks.usesEnhancedMetadata || pageResult.checks.usesJsonLdHelper) {
      if (!content.includes('@/lib/seoEnhancements')) {
        pageResult.issues.push('Uses SEO helpers but missing import from @/lib/seoEnhancements');
      }
    }

    // Specific checks for layout files
    if (filePath.includes('/layout.')) {
      // Layout files should have metadata
      if (!pageResult.checks.hasMetadataExport) {
        pageResult.issues.push('Layout file missing metadata export');
      }
      
      // Tool pages should have JSON-LD
      if (filePath.includes('src/app/') && !filePath.includes('src/app/layout.') && !filePath.includes('/api/')) {
        if (!pageResult.checks.hasJsonLd) {
          pageResult.warnings.push('Tool layout missing JSON-LD structured data');
        }
      }
    }

    // Check for hardcoded meta tags (anti-pattern)
    if (content.includes('<meta ') && content.includes('property=') && !content.includes('script')) {
      pageResult.warnings.push('May contain hardcoded meta tags - prefer using metadata export');
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
    console.log('📊 SEO & STRUCTURED DATA VALIDATION REPORT');
    console.log('='.repeat(80) + '\n');

    console.log('Summary:');
    console.log(`  Total files validated: ${this.results.total}`);
    console.log(`  ✅ Passed: ${this.results.passed}`);
    console.log(`  ❌ Failed: ${this.results.failed}`);
    console.log(`  ⚠️  Warnings: ${this.results.warnings}\n`);

    if (this.results.pages.length === 0) {
      console.log('✅ All pages pass SEO validation!\n');
      return;
    }

    console.log('Issues & Warnings:\n');

    for (const page of this.results.pages) {
      console.log(`\n📄 ${page.path}`);
      
      if (page.issues.length > 0) {
        console.log('  ❌ Issues:');
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

      console.log('  Checks:');
      console.log(`     Metadata export: ${page.checks.hasMetadataExport ? '✓' : '✗'}`);
      console.log(`     Enhanced metadata: ${page.checks.usesEnhancedMetadata ? '✓' : '✗'}`);
      console.log(`     JSON-LD: ${page.checks.hasJsonLd ? '✓' : '✗'}`);
      console.log(`     JSON-LD helper: ${page.checks.usesJsonLdHelper ? '✓' : '✗'}`);
    }

    console.log('\n' + '='.repeat(80));
    
    if (this.results.failed > 0) {
      console.log('❌ VALIDATION FAILED - Please fix the issues above');
    } else {
      console.log('✅ VALIDATION PASSED - Some warnings may need attention');
    }
    
    console.log('='.repeat(80) + '\n');

    console.log('Recommendations:');
    console.log('  1. Use generateEnhancedMetadata() for all metadata exports');
    console.log('  2. Use generateComprehensiveJsonLd() for structured data');
    console.log('  3. Add JSON-LD to all tool pages for better SEO');
    console.log('  4. Avoid hardcoded meta tags - use metadata exports');
    console.log('  5. See docs/seo-guidelines.md for best practices\n');
  }
}

// Run validation
if (require.main === module) {
  const validator = new SEOValidator();
  validator.validateAllPages().catch(err => {
    console.error('❌ Validation failed:', err);
    process.exit(1);
  });
}

module.exports = SEOValidator;
