const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(__dirname, '../sitemap.json');
const reportPath = path.join(__dirname, '../seo_audit.json');

const sitemap = JSON.parse(fs.readFileSync(sitemapPath, 'utf8'));
const urls = sitemap.urls.filter(u => !u.includes('['));

const baseUrl = process.argv[2] || 'http://localhost:3000';

(async () => {
	const browser = await chromium.launch();
	const context = await browser.newContext();
	const page = await context.newPage();
	let report = { timestamp: new Date().toISOString(), results: [] };

	console.log(`Starting SEO audit (Playwright) on ${baseUrl}...`);

	const saveReport = () => {
		fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
		console.log(`Saved report with ${report.results.length} items.`);
	};

	process.on('SIGINT', () => {
		console.log('Interrupted. Saving report...');
		saveReport();
		process.exit();
	});

	for (const url of urls) {
		const fullUrl = `${baseUrl}${url}`;
		console.log(`Checking ${fullUrl}...`);

		try {
			const response = await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
			const status = response.status();

			if (status !== 200) {
				report.results.push({ url, status, error: `Status ${status}` });
				continue;
			}

			const data = await page.evaluate(() => {
				const title = document.title;
				const description = document.querySelector('meta[name="description"]')?.content ||
					document.querySelector('meta[property="og:description"]')?.content;
				const h1 = document.querySelector('h1')?.innerText;
				const canonical = document.querySelector('link[rel="canonical"]')?.href;
				return { title, description, h1, canonical };
			});

			const { title, description, h1 } = data;
			const issues = [];

			if (!title) issues.push('Missing title');
			else if (title.length < 10) issues.push('Title too short');
			else if (title.length > 70) issues.push('Title too long');

			if (!description) issues.push('Missing meta description');
			else if (description.length < 50) issues.push('Description too short');
			else if (description.length > 170) issues.push('Description too long');

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

		if (report.results.length % 10 === 0) saveReport();
	}

	saveReport();
	console.log(`SEO audit complete. Report saved to ${reportPath}`);
	await browser.close();
})();
