const fs = require('fs');
const path = require('path');

// Mock data imports by reading files directly to avoid module/import issues in this script context
// We will look for hrefs in toolData.js and route names in sitemapEntries.js

const appDir = path.join(__dirname, '../src/app');

// 1. Get all physical routes from file system
function getPhysicalRoutes(dir, basePath = '') {
	let routes = [];
	const items = fs.readdirSync(dir);

	// Check if this dir is a page
	if (items.includes('page.js')) {
		// Convert win path to web path
		let route = basePath.replace(/\\/g, '/');
		if (route === '') route = '/';
		// Handle dynamic routes [param] -> assume covered if logic exists, but for now exact match audit
		// We will keep the [] in the name for now e.g. /categories/[category]
		routes.push(route);
	}

	items.forEach(item => {
		const fullPath = path.join(dir, item);
		if (fs.statSync(fullPath).isDirectory()) {
			// Skip route groups (folders starting with parentheses) but traverse inside
			// Actually Next.js route groups (group) don't add to URL path.
			const isRouteGroup = item.startsWith('(') && item.endsWith(')');
			const nextBasePath = isRouteGroup ? basePath : path.join(basePath, item);
			routes = routes.concat(getPhysicalRoutes(fullPath, nextBasePath));
		}
	});

	return routes;
}

const physicalRoutes = getPhysicalRoutes(appDir);

// 2. Extract sitemap routes from code
const sitemapContent = fs.readFileSync(path.join(__dirname, '../src/lib/sitemapEntries.js'), 'utf8');
const toolDataContent = fs.readFileSync(path.join(__dirname, '../src/lib/toolData.js'), 'utf8');

// Extract static routes manually defined in sitemapEntries.js
// Matches: { route: '/about', ... }
const staticRouteRegex = /route:\s*'([^']+)'/g;
const staticRoutes = [];
let match;
while ((match = staticRouteRegex.exec(sitemapContent)) !== null) {
	staticRoutes.push(match[1]);
}

// Extract tool routes from toolData.js
// Matches: href: "/pdf/merge",
const toolRouteRegex = /href:\s*"([^"]+)"/g;
const toolRoutes = [];
while ((match = toolRouteRegex.exec(toolDataContent)) !== null) {
	toolRoutes.push(match[1]);
}

// Combine intended sitemap routes
const sitemapSet = new Set([...staticRoutes, ...toolRoutes, '/', '/categories/[category]']); // Add root and dynamic category manually known

const missingInSitemap = [];

physicalRoutes.forEach(route => {
	// Normalize route: /about -> /about
	// Windows fix: ensure starts with /
	const normRoute = route.startsWith('/') ? route : '/' + route;

	// Ignored routes (admin, special)
	if (normRoute.includes('sponsor-dashboard')) return; // Explicitly hidden
	if (normRoute.includes('not-found')) return;

	// Handle dynamic routes logic roughly
	if (normRoute.includes('[category]')) {
		if (sitemapSet.has('/categories/[category]')) return;
	}

	// Exact check
	if (!sitemapSet.has(normRoute)) {
		missingInSitemap.push(normRoute);
	}
});

console.log('--- SITEMAP COVERAGE AUDIT ---');
console.log(`Total Physical Pages: ${physicalRoutes.length}`);
console.log(`Total Sitemap Entries Identified: ${sitemapSet.size}`);

if (missingInSitemap.length > 0) {
	console.log('\nCRITICAL: The following pages exist but are NOT in the sitemap/toolData sources:');
	missingInSitemap.forEach(r => console.log(` - ${r}`));
} else {
	console.log('\nSUCCESS: All physical pages are accounted for in the sitemap logic.');
}
