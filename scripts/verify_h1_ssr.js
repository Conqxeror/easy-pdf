const http = require('http');
const https = require('https');

// Script to verify H1 presence in server-rendered HTML

const baseUrl = process.argv[2] || 'http://localhost:3000';

const testUrls = [
	'/',
	'/about',
	'/pdf/merge',
	'/pdf/split',
	'/pdf/compress',
	'/advanced-ocr',
	'/aes-encrypt',
	'/barcode-generator'
];

function fetchHtml(url) {
	return new Promise((resolve, reject) => {
		const client = url.startsWith('https') ? https : http;
		client.get(url, (res) => {
			let data = '';
			res.on('data', chunk => data += chunk);
			res.on('end', () => resolve(data));
		}).on('error', reject);
	});
}

async function checkH1(url, html) {
	// Look for H1 in the raw HTML (before JS executes)
	const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

	if (h1Match) {
		// Extract text from H1 (strip inner tags)
		const h1Text = h1Match[1].replace(/<[^>]+>/g, '').trim();
		return {
			url,
			hasH1: true,
			h1Tag: h1Match[0].substring(0, 150) + (h1Match[0].length > 150 ? '...' : ''),
			h1Text,
			isSSR: true
		};
	}

	return {
		url,
		hasH1: false,
		h1Tag: null,
		h1Text: null,
		isSSR: false
	};
}

(async () => {
	console.log('\n🔍 H1 Server-Side Rendering Audit\n');
	console.log(`Testing ${testUrls.length} pages on ${baseUrl}\n`);

	const results = [];

	for (const path of testUrls) {
		const fullUrl = `${baseUrl}${path}`;
		console.log(`Checking: ${fullUrl}`);

		try {
			const html = await fetchHtml(fullUrl);
			const result = await checkH1(path, html);
			results.push(result);

			if (result.hasH1) {
				console.log(`  ✅ H1 found (SSR): "${result.h1Text}"`);
			} else {
				console.log(`  ❌ NO H1 in server HTML (may be client-side only)`);
			}
		} catch (error) {
			console.log(`  ⚠️  Error: ${error.message}`);
			results.push({
				url: path,
				hasH1: false,
				error: error.message
			});
		}
	}

	// Summary
	console.log('\n📊 Summary:\n');
	const passing = results.filter(r => r.hasH1).length;
	const failing = results.filter(r => !r.hasH1 && !r.error).length;
	const errors = results.filter(r => r.error).length;

	console.log(`✅ Pages with SSR H1: ${passing}/${testUrls.length}`);
	console.log(`❌ Pages missing SSR H1: ${failing}/${testUrls.length}`);
	console.log(`⚠️  Pages with errors: ${errors}/${testUrls.length}`);

	if (failing > 0) {
		console.log('\n❌ Failed pages:');
		results.filter(r => !r.hasH1 && !r.error).forEach(r => {
			console.log(`   - ${r.url}`);
		});
	}

	// Save detailed results
	const fs = require('fs');
	const path = require('path');
	fs.writeFileSync(
		path.join(__dirname, '../h1_ssr_audit.json'),
		JSON.stringify(results, null, 2)
	);
	console.log('\n📝 Detailed results saved to h1_ssr_audit.json');

	process.exit(failing > 0 ? 1 : 0);
})();
