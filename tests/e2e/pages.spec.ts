import fs from 'node:fs';
import path from 'node:path';
import { test, expect, type Page, type Response } from '@playwright/test';

async function gotoWithDevRetry(page: Page, route: string): Promise<Response | null> {
	let lastError: unknown;

	for (let attempt = 0; attempt < 3; attempt += 1) {
		try {
			return await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 60_000 });
		} catch (error) {
			lastError = error;
			await page.waitForTimeout(3000 + attempt * 2000);
		}
	}

	throw lastError;
}

function collectStaticRoutes(dir: string, currentRoute = ''): string[] {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const routes: string[] = [];

	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}

		if (entry.name === 'api' || entry.name.startsWith('(') || entry.name.startsWith('[')) {
			continue;
		}

		const nextDir = path.join(dir, entry.name);
		const nextRoute = `${currentRoute}/${entry.name}`;
		const pageFile = path.join(nextDir, 'page.js');

		if (fs.existsSync(pageFile)) {
			routes.push(nextRoute);
		}

		routes.push(...collectStaticRoutes(nextDir, nextRoute));
	}

	return routes;
}

const appDir = path.resolve(process.cwd(), 'src/app');
const routes = ['/', ...collectStaticRoutes(appDir)]
	.filter((route, index, allRoutes) => allRoutes.indexOf(route) === index)
	.sort((left, right) => left.localeCompare(right));

test.describe('Site routes smoke', () => {
	test.describe.configure({ mode: 'parallel' });

	for (const route of routes) {
		test(`visits ${route}`, async ({ page }) => {
			test.setTimeout(150_000);
			const pageErrors: string[] = [];
			page.on('pageerror', (error) => pageErrors.push(error.message));

			const response = await gotoWithDevRetry(page, route);
			expect(response).toBeTruthy();
			expect(response?.status(), `Unexpected status for ${route}`).toBeLessThan(400);

			await expect(page.locator('body')).toBeVisible();

			const title = await page.title();
			expect(title.length, `Missing document title for ${route}`).toBeGreaterThan(0);
			expect(pageErrors, `Runtime errors for ${route}: ${pageErrors.join('\n')}`).toEqual([]);
		});
	}
});
