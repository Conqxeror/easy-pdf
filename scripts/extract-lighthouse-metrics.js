/**
 * Extract key Lighthouse metrics from JSON files
 * Usage: node scripts/extract-lighthouse-metrics.js docs/logs/lh_*.json
 */

const fs = require('fs');
const path = require('path');

function extractMetrics(jsonPath) {
  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Check for runtime errors
    if (data.runtimeError && data.runtimeError.code === 'CHROME_INTERSTITIAL_ERROR') {
      return {
        url: data.requestedUrl,
        error: 'CHROME_INTERSTITIAL_ERROR',
        valid: false
      };
    }

    // Extract performance metrics
    const metrics = {
      url: data.requestedUrl || data.finalUrl,
      valid: true,
      performanceScore: data.categories?.performance?.score ? Math.round(data.categories.performance.score * 100) : null,
      accessibilityScore: data.categories?.accessibility?.score ? Math.round(data.categories.accessibility.score * 100) : null,
      seoScore: data.categories?.seo?.score ? Math.round(data.categories.seo.score * 100) : null,
      fcp: data.audits?.['first-contentful-paint']?.numericValue ? Math.round(data.audits['first-contentful-paint'].numericValue) : null,
      lcp: data.audits?.['largest-contentful-paint']?.numericValue ? Math.round(data.audits['largest-contentful-paint'].numericValue) : null,
      tbt: data.audits?.['total-blocking-time']?.numericValue ? Math.round(data.audits['total-blocking-time'].numericValue) : null,
      tti: data.audits?.['interactive']?.numericValue ? Math.round(data.audits['interactive'].numericValue) : null,
      speedIndex: data.audits?.['speed-index']?.numericValue ? Math.round(data.audits['speed-index'].numericValue) : null,
      cls: data.audits?.['cumulative-layout-shift']?.numericValue ?? null
    };

    return metrics;
  } catch (error) {
    return {
      url: path.basename(jsonPath),
      error: error.message,
      valid: false
    };
  }
}

// Process all JSON files passed as arguments
const files = process.argv.slice(2);
const results = files.map(extractMetrics);

// Print results as a formatted table
console.log('\n# Lighthouse Metrics Summary\n');
results.forEach(result => {
  if (!result.valid) {
    console.log(`## ${result.url}`);
    console.log(`**Error:** ${result.error}\n`);
    return;
  }

  console.log(`## ${result.url}`);
  console.log(`- Performance: ${result.performanceScore ?? 'N/A'}`);
  console.log(`- Accessibility: ${result.accessibilityScore ?? 'N/A'}`);
  console.log(`- SEO: ${result.seoScore ?? 'N/A'}`);
  console.log(`- FCP: ${result.fcp ? `${(result.fcp / 1000).toFixed(2)}s` : 'N/A'}`);
  console.log(`- LCP: ${result.lcp ? `${(result.lcp / 1000).toFixed(2)}s` : 'N/A'}`);
  console.log(`- TBT: ${result.tbt !== null ? `${result.tbt}ms` : 'N/A'}`);
  console.log(`- TTI: ${result.tti ? `${(result.tti / 1000).toFixed(2)}s` : 'N/A'}`);
  console.log(`- Speed Index: ${result.speedIndex ? `${(result.speedIndex / 1000).toFixed(2)}s` : 'N/A'}`);
  console.log(`- CLS: ${result.cls !== null ? result.cls.toFixed(3) : 'N/A'}`);
  console.log('');
});

// Export as JSON for programmatic use
console.log('\n---\n');
console.log(JSON.stringify(results, null, 2));
