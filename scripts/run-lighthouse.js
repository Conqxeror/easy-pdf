const lighthouse = require('lighthouse').default || require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

async function run(url, outPath) {
  // Add extra flags to reduce interstitials and improve headless stability
  const headful = process.env.LH_HEADFUL === '1' || process.env.LH_HEADFUL === 'true';
  const chromeFlags = [
    // Only include headless when not running in headful/debug mode
    ...(headful ? [] : ['--headless']),
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=IsolateOrigins,site-per-process',
  ];

  const chrome = await chromeLauncher.launch({chromeFlags});
  const opts = {port: chrome.port, output: 'json', onlyCategories: ['performance','accessibility','seo']};
  const runnerResult = await lighthouse(url, opts);
  fs.writeFileSync(outPath, runnerResult.report);
  await chrome.kill();
  console.log('Wrote', outPath);
}

const [,, url, outPath] = process.argv;
if(!url || !outPath) {
  console.error('Usage: node run-lighthouse.js <url> <outPath>');
  process.exit(2);
}
run(url, outPath).catch(err => { console.error(err); process.exit(1); });
