#!/usr/bin/env node
/**
 * Sitemap Pinger Script (using IndexNow)
 * 
 * IndexNow is the modern way to notify search engines about URL changes.
 * Supported by: Bing, Yandex, Naver, Seznam, Yep
 * 
 * Setup:
 * 1. Generate an IndexNow key at https://www.bing.com/indexnow
 * 2. Create a file at /public/[key].txt containing the key
 * 3. Run this script with: node scripts/ping-sitemaps.js
 * 
 * Usage: 
 *   node scripts/ping-sitemaps.js           # Ping priority URLs
 *   node scripts/ping-sitemaps.js --all     # Ping all sitemap URLs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://easy-pdf-murex.vercel.app';
const SITE_HOST = new URL(SITE_URL).host;

// Priority URLs that need immediate indexing
const PRIORITY_URLS = [
  '/jpg-to-pdf',
  '/reorder',
  '/',
  '/pdf/merge',
  '/pdf/split', 
  '/pdf/compress',
  '/ocr',
  '/sign',
  '/protect',
  '/unlock',
  '/rotate',
  '/delete-pages',
  '/watermark',
  '/pdf-to-jpg',
  '/html-to-pdf'
];

// Try to read IndexNow key from environment or file
function getIndexNowKey() {
  // Check environment variable first
  if (process.env.INDEXNOW_KEY) {
    return process.env.INDEXNOW_KEY;
  }
  
  // Hardcoded key (generated for this site)
  return '4b4494570ecb66d7be600e483bdd3908';
}

const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow'
];

function postRequest(url, data, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function pingIndexNow(urls, key) {
  console.log(`📤 Submitting ${urls.length} URLs to IndexNow endpoints...\n`);
  
  const fullUrls = urls.map(u => u.startsWith('http') ? u : `${SITE_URL}${u}`);
  
  const payload = {
    host: SITE_HOST,
    key: key,
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList: fullUrls
  };
  
  let successCount = 0;
  
  for (const endpoint of INDEXNOW_ENDPOINTS) {
    const endpointName = new URL(endpoint).hostname;
    console.log(`→ Submitting to ${endpointName}...`);
    
    try {
      const result = await postRequest(endpoint, payload);
      
      if (result.statusCode === 200 || result.statusCode === 202) {
        console.log(`  ✅ Success (HTTP ${result.statusCode})`);
        successCount++;
      } else if (result.statusCode === 422) {
        console.log(`  ⚠️ Key validation failed (HTTP 422)`);
        console.log(`     Make sure ${key}.txt is deployed at ${SITE_URL}/${key}.txt`);
      } else {
        console.log(`  ⚠️ HTTP ${result.statusCode}: ${result.body.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`  ❌ ${error.message}`);
    }
  }
  
  console.log(`\n📊 Results: ${successCount}/${INDEXNOW_ENDPOINTS.length} endpoints accepted`);
  return successCount > 0;
}

function showSetupInstructions() {
  console.log('\n📋 IndexNow Setup Instructions:');
  console.log('  1. Go to https://www.bing.com/indexnow/getstarted');
  console.log('  2. Generate an API key');
  console.log('  3. Create a verification file:');
  console.log('     echo "YOUR_KEY" > public/YOUR_KEY.txt');
  console.log('  4. Deploy the verification file to your site');
  console.log('  5. Run this script again');
  console.log('\n  Or set INDEXNOW_KEY environment variable');
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('       IndexNow Pinger for easy-pdf                     ');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const key = getIndexNowKey();
  
  if (!key) {
    console.log('❌ IndexNow key not found');
    showSetupInstructions();
    
    console.log('\n📝 Alternative Options:');
    console.log('  • Google: Use Search Console or Indexing API');
    console.log('    node scripts/request-indexing.js');
    console.log('  • Manual: Submit sitemap at search engine webmaster tools');
    
    return;
  }
  
  console.log(`🔑 Using IndexNow key: ${key.substring(0, 8)}...`);
  console.log(`🌐 Site: ${SITE_URL}\n`);
  
  const useAll = process.argv.includes('--all');
  const sitemap = require('../sitemap.json');
  let urls = useAll 
    ? sitemap.urls
    : PRIORITY_URLS;
  
  // Filter out dynamic routes like [category]
  urls = urls.filter(u => !u.includes('['));
  
  console.log(`📋 Mode: ${useAll ? 'All sitemap URLs' : 'Priority URLs only'}`);
  console.log(`📊 URLs to submit: ${urls.length}\n`);
  
  await pingIndexNow(urls, key);
  
  console.log('\n📝 Search Engines Notified via IndexNow:');
  console.log('  • Bing');
  console.log('  • Yandex');
  console.log('  • Naver');
  console.log('  • Seznam');
  console.log('  • Yep');
  
  console.log('\n🔍 For Google, use:');
  console.log('  node scripts/request-indexing.js');
  
  console.log('\n═══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
