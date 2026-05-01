import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	timeout: 60_000,
	workers: process.env.PLAYWRIGHT_USE_DEV ? 1 : undefined,
	use: {
		baseURL: process.env.PW_BASE_URL || 'http://localhost:3000',
		headless: true,
		ignoreHTTPSErrors: true,
		video: 'retain-on-failure'
	},
	webServer: (() => {
		// Use a fast dev server locally if the env var PLAYWRIGHT_USE_DEV=true is set.
		// For CI we prefer the built server. Reuse server if already running.
		const useDev = Boolean(process.env.PLAYWRIGHT_USE_DEV);
		return {
			command: useDev ? 'npm run dev' : 'npm run build && npm run start',
			port: 3000,
			reuseExistingServer: true,
			timeout: 120_000
		};
	})()
});
