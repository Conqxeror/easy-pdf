const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(__dirname, '../sitemap.json');
const reportPath = path.join(__dirname, '../visual_report.json');
const screenshotsDir = path.join(__dirname, '../screenshots');

if (!fs.existsSync(screenshotsDir)) {
	fs.mkdirSync(screenshotsDir);
}

const sitemap = JSON.parse(fs.readFileSync(sitemapPath, 'utf8'));
const urls = sitemap.urls.filter(u => !u.includes('[')); // Filter dynamic routes

const baseUrl = process.argv[2] || 'http://localhost:3000';

(async () => {
	const browser = await chromium.launch();
	const context = await browser.newContext();
	const page = await context.newPage();

	let report = {
		timestamp: new Date().toISOString(),
		results: []
	};

	console.log(`Starting visual crawl on ${baseUrl} with ${urls.length} URLs...`);

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
		console.log(`Visiting ${fullUrl}...`);

		const result = {
			url: url,
			status: 'pending',
			issues: []
		};

		const safeName = url === '/' ? 'home' : url.replace(/^\//, '').replace(/\//g, '_');
		const desktopPath = path.join(screenshotsDir, `${safeName}_desktop.png`);
		const mobilePath = path.join(screenshotsDir, `${safeName}_mobile.png`);
		const desktopExists = fs.existsSync(desktopPath);
		const mobileExists = fs.existsSync(mobilePath);

		try {
			const response = await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

			if (!response) {
				result.status = 'failed';
				result.error = 'No response';
				report.results.push(result);
				saveReport();
				continue;
			}

			const status = response.status();
			if (status >= 400) {
				result.status = 'failed';
				result.statusCode = status;
				result.issues.push(`Status code ${status}`);
			} else {
				result.status = 'success';
				result.statusCode = status;
			}

			// Desktop Screenshot
			if (!desktopExists) {
				await page.setViewportSize({ width: 1920, height: 1080 });
				await page.screenshot({ path: desktopPath, fullPage: true });
			}
			result.desktopScreenshot = desktopPath;

			// Mobile Screenshot
			if (!mobileExists) {
				await page.setViewportSize({ width: 375, height: 812 });
				await page.screenshot({ path: mobilePath, fullPage: true });
			}
			result.mobileScreenshot = mobilePath;

			// Basic visual checks
			const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
			const viewportWidth = await page.viewportSize().width;
			if (scrollWidth > viewportWidth) {
				result.issues.push('Horizontal scroll detected on mobile');
			}

		} catch (error) {
			console.error(`Error visiting ${url}:`, error.message);
			result.status = 'error';
			result.error = error.message;
		}

		report.results.push(result);

		// Save every 5 items
		if (report.results.length % 5 === 0) {
			saveReport();
		}
	}

	saveReport();
	console.log(`Visual crawl complete. Report saved to ${reportPath}`);

	await browser.close();
})();
