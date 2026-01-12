/**
 * Request Indexing for URLs via Google Indexing API
 * 
 * This script submits URLs to Google's Indexing API to request crawling.
 * Note: The Indexing API is primarily for JobPosting and BroadcastEvent pages,
 * but can also trigger URL inspection for other pages.
 * 
 * For best results, use Google Search Console to manually request indexing
 * or wait for natural crawling after sitemap submission.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load service account credentials
const CREDENTIALS_PATH = path.join(__dirname, '..', 'client_secrets.json');
const SITEMAP_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');
const BASE_URL = 'https://easy-pdf-murex.vercel.app';

async function authenticate() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/indexing']
  });

  return auth;
}

// Parse sitemap XML to get URLs
function parseUrlsFromSitemap() {
  const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const urlRegex = /<loc>([^<]+)<\/loc>/g;
  const urls = [];
  let match;
  
  while ((match = urlRegex.exec(sitemapContent)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
}

async function requestIndexing(auth, url) {
  const indexing = google.indexing({ version: 'v3', auth });
  
  try {
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED'
      }
    });
    return { url, success: true, data: response.data };
  } catch (error) {
    return { url, success: false, error: error.message };
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('    Google Indexing API - Request Indexing');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('🔍 Authenticating...');
  const auth = await authenticate();

  console.log('📄 Parsing sitemap...');
  const urls = parseUrlsFromSitemap();
  console.log(`Found ${urls.length} URLs in sitemap\n`);

  // Priority URLs to index first
  const priorityUrls = [
    `${BASE_URL}`,
    `${BASE_URL}/pdf/merge`,
    `${BASE_URL}/pdf/split`,
    `${BASE_URL}/pdf/compress`,
    `${BASE_URL}/jpg-to-pdf`,
    `${BASE_URL}/pdf-to-jpg`,
    `${BASE_URL}/rotate`,
    `${BASE_URL}/delete-pages`,
    `${BASE_URL}/unlock`,
    `${BASE_URL}/protect`,
    `${BASE_URL}/watermark`,
    `${BASE_URL}/sign`,
    `${BASE_URL}/ocr`,
    `${BASE_URL}/form-filler`,
    `${BASE_URL}/organize`,
    `${BASE_URL}/qr-generator`,
    `${BASE_URL}/invoice-generator`,
    `${BASE_URL}/report-generator`
  ];

  console.log('📤 Requesting indexing for priority URLs...\n');

  const results = {
    success: [],
    failed: []
  };

  for (const url of priorityUrls) {
    process.stdout.write(`  ${url}... `);
    const result = await requestIndexing(auth, url);
    
    if (result.success) {
      console.log('✅');
      results.success.push(url);
    } else {
      console.log(`❌ ${result.error}`);
      results.failed.push({ url, error: result.error });
    }
    
    // Rate limiting - wait between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('    Summary');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`✅ Successfully requested: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed URLs:');
    results.failed.forEach(f => {
      console.log(`  • ${f.url}: ${f.error}`);
    });
  }

  console.log('\n📝 Note: The Indexing API is primarily for JobPosting/BroadcastEvent schema.');
  console.log('   For regular pages, Google will crawl based on sitemap and natural discovery.');
  console.log('   To manually request indexing, use Google Search Console UI.\n');
}

main().catch(console.error);
