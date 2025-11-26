const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const sitemapPath = path.join(__dirname, '../sitemap.json');
const reportPath = path.join(__dirname, '../seo_audit.json');

const sitemap = JSON.parse(fs.readFileSync(sitemapPath, 'utf8'));
const urls = sitemap.urls.filter(u => !u.includes('['));

const baseUrl = process.argv[2] || 'http://localhost:3000';

const report = { timestamp: new Date().toISOString(), results: [] };

function fetchUrl(url) {
	return new Promise((resolve, reject) => {
		const client = url.startsWith('https') ? https : http;
		client.get(url, (res) => {
			let data = '';
			res.on('data', (chunk) => data += chunk);
			res.on('end', () => resolve({ status: res.statusCode, data }));
		}).on('error', reject);
	});
}

(async () => {
	console.log(`Starting SEO audit on ${baseUrl}...`);

	for (const url of urls) {
		const fullUrl = `${baseUrl}${url}`;
		// console.log(`Checking ${fullUrl}...`);

		try {
			const { status, data } = await fetchUrl(fullUrl);

			if (status !== 200) {
				report.results.push({ url, status, error: `Status ${status}` });
				continue;
			}

			const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
			const title = titleMatch ? titleMatch[1] : null;

			const descMatch = data.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
				data.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
			const description = descMatch ? descMatch[1] : null;

			const canonicalMatch = data.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
			const canonical = canonicalMatch ? canonicalMatch[1] : null;

			const h1Match = data.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
			const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : null;

			const issues = [];
			if (!title) issues.push('Missing title');
			else if (title.length < 10) issues.push('Title too short');
			else if (title.length > 70) issues.push('Title too long'); // Relaxed slightly

			if (!description) issues.push('Missing meta description');
			else if (description.length < 50) issues.push('Description too short');
			else if (description.length > 170) issues.push('Description too long'); // Relaxed slightly

			if (!h1) issues.push('Missing H1');

			if (issues.length > 0) {
				report.results.push({
					url,
					title,
					description,
					h1,
					issues
				});
			}

		} catch (error) {
			console.error(`Error checking ${url}:`, error.message);
			report.results.push({ url, error: error.message });
		}
	}

	fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
	console.log(`SEO audit complete. Found issues in ${report.results.length} pages. Report saved to ${reportPath}`);
})();
