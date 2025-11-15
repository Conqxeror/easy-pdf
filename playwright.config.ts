import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	timeout: 60_000,
	use: {
		baseURL: process.env.PW_BASE_URL || 'http://localhost:3000',
		headless: true,
		ignoreHTTPSErrors: true,
		video: 'retain-on-failure'
	},
	webServer: {
		command: 'npm run build && npm run start',
		port: 3000,
		reuseExistingServer: true
	}
});
