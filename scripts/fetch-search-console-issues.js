/**
 * Fetch Google Search Console Issues
 * 
 * This script uses the Google Search Console API to fetch:
 * - URL inspection issues
 * - Index coverage issues  
 * - Mobile usability issues
 * - Rich results issues
 * - Core Web Vitals issues
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load service account credentials
const CREDENTIALS_PATH = path.join(__dirname, '..', 'client_secrets.json');
const SITE_URL = 'https://easypdf.ing'; // Update this to your actual site URL

async function authenticate() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/webmasters'
    ]
  });

  return auth;
}

async function fetchSearchConsoleIssues() {
  console.log('🔍 Authenticating with Google Search Console...\n');
  
  const auth = await authenticate();
  const searchConsole = google.searchconsole({ version: 'v1', auth });
  const webmasters = google.webmasters({ version: 'v3', auth });

  const allIssues = {
    timestamp: new Date().toISOString(),
    siteUrl: SITE_URL,
    issues: {
      indexCoverage: [],
      mobileUsability: [],
      urlInspection: [],
      sitemaps: [],
      searchAnalytics: []
    },
    summary: {}
  };

  try {
    // 1. Get list of sites
    console.log('📋 Fetching sites list...');
    const sitesResponse = await webmasters.sites.list();
    const sites = sitesResponse.data.siteEntry || [];
    
    console.log(`Found ${sites.length} site(s):`);
    sites.forEach(site => {
      console.log(`  - ${site.siteUrl} (${site.permissionLevel})`);
    });

    if (sites.length === 0) {
      console.log('\n⚠️ No sites found. Make sure the service account has access to Search Console.');
      return allIssues;
    }

    // Use the first available site or the specified one
    const targetSite = sites.find(s => s.siteUrl.includes('easypdf')) || sites[0];
    const siteUrl = targetSite.siteUrl;
    allIssues.siteUrl = siteUrl;
    
    console.log(`\n🎯 Using site: ${siteUrl}\n`);

    // 2. Fetch sitemaps
    console.log('🗺️ Fetching sitemaps...');
    try {
      const sitemapsResponse = await webmasters.sitemaps.list({ siteUrl });
      const sitemaps = sitemapsResponse.data.sitemap || [];
      
      for (const sitemap of sitemaps) {
        allIssues.issues.sitemaps.push({
          path: sitemap.path,
          lastSubmitted: sitemap.lastSubmitted,
          lastDownloaded: sitemap.lastDownloaded,
          isPending: sitemap.isPending,
          isSitemapsIndex: sitemap.isSitemapsIndex,
          warnings: sitemap.warnings,
          errors: sitemap.errors,
          contents: sitemap.contents
        });
        
        if (sitemap.errors > 0 || sitemap.warnings > 0) {
          console.log(`  ⚠️ ${sitemap.path}: ${sitemap.errors} errors, ${sitemap.warnings} warnings`);
        } else {
          console.log(`  ✅ ${sitemap.path}: OK`);
        }
      }
    } catch (err) {
      console.log(`  ❌ Error fetching sitemaps: ${err.message}`);
    }

    // 3. Search Analytics - Find pages with issues (low CTR, low impressions, etc.)
    console.log('\n📊 Fetching search analytics...');
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 28); // Last 28 days

      const analyticsResponse = await webmasters.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          dimensions: ['page'],
          rowLimit: 1000
        }
      });

      const rows = analyticsResponse.data.rows || [];
      console.log(`  Found ${rows.length} pages with search data`);

      // Identify pages with potential issues
      const pagesWithIssues = rows.filter(row => {
        // Flag pages with high impressions but low CTR (< 1%)
        return row.impressions > 100 && row.ctr < 0.01;
      }).map(row => ({
        url: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: (row.ctr * 100).toFixed(2) + '%',
        position: row.position.toFixed(1),
        issue: 'Low CTR despite high impressions - Consider improving title/description'
      }));

      allIssues.issues.searchAnalytics = pagesWithIssues;
      
      if (pagesWithIssues.length > 0) {
        console.log(`  ⚠️ ${pagesWithIssues.length} pages with potential CTR issues`);
      }

      // Also get overall stats
      allIssues.summary.searchAnalytics = {
        totalPages: rows.length,
        totalClicks: rows.reduce((sum, r) => sum + r.clicks, 0),
        totalImpressions: rows.reduce((sum, r) => sum + r.impressions, 0),
        averageCTR: rows.length > 0 
          ? (rows.reduce((sum, r) => sum + r.ctr, 0) / rows.length * 100).toFixed(2) + '%'
          : '0%',
        averagePosition: rows.length > 0
          ? (rows.reduce((sum, r) => sum + r.position, 0) / rows.length).toFixed(1)
          : 'N/A'
      };

    } catch (err) {
      console.log(`  ❌ Error fetching search analytics: ${err.message}`);
    }

    // 4. URL Inspection API - Inspect specific URLs
    console.log('\n🔎 Inspecting URLs...');
    
    // Get list of important pages to inspect - using actual URLs from the site
    const pagesToInspect = [
      '/',
      '/pdf/merge',
      '/pdf/split',
      '/pdf/compress',
      '/jpg-to-pdf',
      '/pdf-to-jpg',
      '/rotate',
      '/delete-pages',
      '/unlock',
      '/protect',
      '/watermark',
      '/sign',
      '/ocr',
      '/form-filler',
      '/organize',
      '/reorder'
    ];

    for (const pagePath of pagesToInspect) {
      const inspectUrl = siteUrl.replace(/\/$/, '') + pagePath;
      try {
        const inspectionResponse = await searchConsole.urlInspection.index.inspect({
          requestBody: {
            inspectionUrl: inspectUrl,
            siteUrl: siteUrl
          }
        });

        const result = inspectionResponse.data.inspectionResult;
        const indexStatus = result?.indexStatusResult;
        const mobileUsability = result?.mobileUsabilityResult;
        const richResults = result?.richResultsResult;

        const inspection = {
          url: inspectUrl,
          indexStatus: {
            verdict: indexStatus?.verdict,
            coverageState: indexStatus?.coverageState,
            robotsTxtState: indexStatus?.robotsTxtState,
            indexingState: indexStatus?.indexingState,
            lastCrawlTime: indexStatus?.lastCrawlTime,
            pageFetchState: indexStatus?.pageFetchState,
            googleCanonical: indexStatus?.googleCanonical,
            userCanonical: indexStatus?.userCanonical,
            crawledAs: indexStatus?.crawledAs
          },
          mobileUsability: {
            verdict: mobileUsability?.verdict,
            issues: mobileUsability?.issues || []
          },
          richResults: {
            verdict: richResults?.verdict,
            detectedItems: richResults?.detectedItems || []
          }
        };

        allIssues.issues.urlInspection.push(inspection);

        // Log issues
        const hasIssues = 
          indexStatus?.verdict !== 'PASS' ||
          mobileUsability?.verdict !== 'PASS' ||
          (mobileUsability?.issues && mobileUsability.issues.length > 0);

        if (hasIssues) {
          console.log(`  ⚠️ ${pagePath}:`);
          if (indexStatus?.verdict !== 'PASS') {
            console.log(`      Index: ${indexStatus?.verdict} - ${indexStatus?.coverageState}`);
          }
          if (mobileUsability?.verdict !== 'PASS') {
            console.log(`      Mobile: ${mobileUsability?.verdict}`);
            mobileUsability?.issues?.forEach(issue => {
              console.log(`        - ${issue.issueType}: ${issue.message}`);
            });
          }
        } else {
          console.log(`  ✅ ${pagePath}: All checks passed`);
        }

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (err) {
        console.log(`  ❌ ${pagePath}: ${err.message}`);
        allIssues.issues.urlInspection.push({
          url: inspectUrl,
          error: err.message
        });
      }
    }

    // 5. Generate summary
    console.log('\n📈 Generating summary...');
    
    const indexedPages = allIssues.issues.urlInspection.filter(
      p => p.indexStatus?.verdict === 'PASS'
    ).length;
    
    const mobileFriendlyPages = allIssues.issues.urlInspection.filter(
      p => p.mobileUsability?.verdict === 'PASS'
    ).length;

    const pagesWithRichResults = allIssues.issues.urlInspection.filter(
      p => p.richResults?.detectedItems?.length > 0
    ).length;

    allIssues.summary.urlInspection = {
      totalInspected: allIssues.issues.urlInspection.length,
      indexed: indexedPages,
      mobileFriendly: mobileFriendlyPages,
      withRichResults: pagesWithRichResults
    };

    allIssues.summary.sitemaps = {
      total: allIssues.issues.sitemaps.length,
      withErrors: allIssues.issues.sitemaps.filter(s => s.errors > 0).length,
      withWarnings: allIssues.issues.sitemaps.filter(s => s.warnings > 0).length
    };

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    allIssues.error = error.message;
  }

  return allIssues;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('    Google Search Console Issues Report');
  console.log('═══════════════════════════════════════════════════════════\n');

  const issues = await fetchSearchConsoleIssues();

  // Save to file
  const outputPath = path.join(__dirname, '..', 'search_console_issues.json');
  fs.writeFileSync(outputPath, JSON.stringify(issues, null, 2));
  console.log(`\n💾 Full report saved to: ${outputPath}`);

  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('    Summary');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  if (issues.summary.urlInspection) {
    console.log('URL Inspection:');
    console.log(`  • Total inspected: ${issues.summary.urlInspection.totalInspected}`);
    console.log(`  • Indexed: ${issues.summary.urlInspection.indexed}`);
    console.log(`  • Mobile friendly: ${issues.summary.urlInspection.mobileFriendly}`);
    console.log(`  • With rich results: ${issues.summary.urlInspection.withRichResults}`);
  }

  if (issues.summary.sitemaps) {
    console.log('\nSitemaps:');
    console.log(`  • Total: ${issues.summary.sitemaps.total}`);
    console.log(`  • With errors: ${issues.summary.sitemaps.withErrors}`);
    console.log(`  • With warnings: ${issues.summary.sitemaps.withWarnings}`);
  }

  if (issues.summary.searchAnalytics) {
    console.log('\nSearch Analytics (Last 28 days):');
    console.log(`  • Total pages: ${issues.summary.searchAnalytics.totalPages}`);
    console.log(`  • Total clicks: ${issues.summary.searchAnalytics.totalClicks}`);
    console.log(`  • Total impressions: ${issues.summary.searchAnalytics.totalImpressions}`);
    console.log(`  • Average CTR: ${issues.summary.searchAnalytics.averageCTR}`);
    console.log(`  • Average position: ${issues.summary.searchAnalytics.averagePosition}`);
  }

  // List all issues found
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('    Issues Found');
  console.log('═══════════════════════════════════════════════════════════\n');

  let issueCount = 0;

  // Sitemap issues
  const sitemapIssues = issues.issues.sitemaps.filter(s => s.errors > 0 || s.warnings > 0);
  if (sitemapIssues.length > 0) {
    console.log('🗺️ Sitemap Issues:');
    sitemapIssues.forEach(s => {
      console.log(`  • ${s.path}: ${s.errors} errors, ${s.warnings} warnings`);
      issueCount++;
    });
    console.log('');
  }

  // URL Inspection issues
  const urlIssues = issues.issues.urlInspection.filter(p => 
    p.error || 
    p.indexStatus?.verdict !== 'PASS' ||
    (p.mobileUsability?.issues && p.mobileUsability.issues.length > 0)
  );
  if (urlIssues.length > 0) {
    console.log('🔎 URL Inspection Issues:');
    urlIssues.forEach(p => {
      if (p.error) {
        console.log(`  • ${p.url}: ${p.error}`);
      } else {
        console.log(`  • ${p.url}:`);
        if (p.indexStatus?.verdict !== 'PASS') {
          console.log(`      - Index status: ${p.indexStatus?.verdict} (${p.indexStatus?.coverageState})`);
        }
        if (p.mobileUsability?.issues?.length > 0) {
          p.mobileUsability.issues.forEach(issue => {
            console.log(`      - Mobile: ${issue.issueType}`);
          });
        }
      }
      issueCount++;
    });
    console.log('');
  }

  // Search analytics issues
  if (issues.issues.searchAnalytics.length > 0) {
    console.log('📊 Pages with Low CTR (needs optimization):');
    issues.issues.searchAnalytics.slice(0, 10).forEach(p => {
      console.log(`  • ${p.url}`);
      console.log(`      CTR: ${p.ctr}, Impressions: ${p.impressions}, Position: ${p.position}`);
      issueCount++;
    });
    if (issues.issues.searchAnalytics.length > 10) {
      console.log(`  ... and ${issues.issues.searchAnalytics.length - 10} more`);
    }
    console.log('');
  }

  if (issueCount === 0) {
    console.log('✅ No issues found! Your site is in good shape.');
  } else {
    console.log(`\n📝 Total issues found: ${issueCount}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
