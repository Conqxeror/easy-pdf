const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(__dirname, '../sitemap.json');
const reportPath = path.join(__dirname, '../accessibility_report.json');

const sitemap = JSON.parse(fs.readFileSync(sitemapPath, 'utf8'));
const urls = sitemap.urls.filter(u => !u.includes('['));

const baseUrl = process.argv[2] || 'http://localhost:3000';

(async () => {
	const browser = await chromium.launch();
	const context = await browser.newContext({ bypassCSP: true });
	const page = await context.newPage();
	let report = { timestamp: new Date().toISOString(), results: [] };

	console.log(`Starting accessibility audit on ${baseUrl}...`);

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
		console.log(`Auditing ${fullUrl}...`);

		try {
			await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

			// Disable animations
			await page.addStyleTag({ content: '* { animation: none !important; transition: none !important; }' });

			// Inject axe-core
			await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js' });

			// Run axe
			const results = await page.evaluate(async () => {
				return await window.axe.run();
			});

			if (results.violations.length > 0) {
				report.results.push({
					url: url,
					violations: results.violations.map(v => ({
						id: v.id,
						impact: v.impact,
						description: v.description,
						nodes: v.nodes.map(n => n.target).flat()
					}))
				});
			} else {
				report.results.push({ url: url, status: 'pass' });
			}

		} catch (error) {
			console.error(`Error auditing ${url}:`, error.message);
			report.results.push({ url: url, error: error.message });
		}

		if (report.results.length % 5 === 0) saveReport();

		// Wait 1s to be gentle
		await new Promise(r => setTimeout(r, 1000));
	}

	saveReport();
	console.log(`Accessibility audit complete. Report saved to ${reportPath}`);
	await browser.close();
})();
