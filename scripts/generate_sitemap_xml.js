/* eslint-disable */
const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '../src/app');
const toolDataPath = path.join(__dirname, '../src/lib/toolData.js');
const toolCategoriesPath = path.join(__dirname, '../src/lib/toolCategories.js');
const outputFile = path.join(__dirname, '../public/sitemap.xml');
const BASE_URL = 'https://easy-pdf-murex.vercel.app';

// 1. Get physical routes from src/app
function getAppRoutes(dir, baseUrl = '') {
	const routes = [];
	const items = fs.readdirSync(dir, { withFileTypes: true });

	for (const item of items) {
		if (item.isDirectory()) {
			// Skip special directories and dynamic routes
			if (item.name.startsWith('(') || item.name.startsWith('_') || item.name.startsWith('[') || item.name === 'api' || item.name === 'components') {
				continue;
			}

			const fullPath = path.join(dir, item.name);
			const route = `${baseUrl}/${item.name}`;

			// Check if it's a page (has page.js/tsx/jsx)
			const hasPage = fs.existsSync(path.join(fullPath, 'page.js')) ||
				fs.existsSync(path.join(fullPath, 'page.tsx')) ||
				fs.existsSync(path.join(fullPath, 'page.jsx'));

			if (hasPage) {
				routes.push(route);
			}

			// Recurse
			routes.push(...getAppRoutes(fullPath, route));
		}
	}
	return routes;
}

// 2. Extract routes from toolData.js
function getToolDataRoutes() {
	const content = fs.readFileSync(toolDataPath, 'utf8');
	const regex = /href:\s*["']([^"']+)["']/g;
	const routes = [];
	let match;
	while ((match = regex.exec(content)) !== null) {
		routes.push(match[1]);
	}
	return routes;
}

// 3. Extract routes from toolCategories.js
function getCategoryRoutes() {
	const content = fs.readFileSync(toolCategoriesPath, 'utf8');
	const hrefRegex = /href:\s*["']([^"']+)["']/g;
	const routes = [];
	let match;
	while ((match = hrefRegex.exec(content)) !== null) {
		routes.push(match[1]);
	}

	const categoryBlockRegex = /name:\s*["']([^"']+)["'],\s*icon:/g;
	let catMatch;
	while ((catMatch = categoryBlockRegex.exec(content)) !== null) {
		const name = catMatch[1];
		const slug = name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
		routes.push(`/categories/${slug}`);
	}

	return routes;
}

const physicalRoutes = getAppRoutes(appDir);
const toolRoutes = getToolDataRoutes();
const categoryRoutes = getCategoryRoutes();

// Combine and deduplicate
const allRoutes = new Set([
	'/', // Home
	'/about',
	'/tools',
	'/security',
	'/sponsors',
	...physicalRoutes,
	...toolRoutes,
	...categoryRoutes
]);

const sortedRoutes = Array.from(allRoutes).sort();

function getPriority(url) {
    if (url === '/') return '1.0';
    if (url === '/tools') return '0.9';
    if (toolRoutes.includes(url)) return '0.8';
    if (url.startsWith('/categories/')) return '0.7';
    return '0.5';
}

function getChangeFreq(url) {
    if (url === '/') return 'daily';
    if (toolRoutes.includes(url)) return 'weekly';
    return 'monthly';
}

const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sortedRoutes.map(route => {
    const url = `${BASE_URL}${route === '/' ? '' : route}`;
    return `  <url>
    <loc>${url}</loc>
    <changefreq>${getChangeFreq(route)}</changefreq>
    <priority>${getPriority(route)}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

fs.writeFileSync(outputFile, xmlContent);
console.log(`Generated sitemap.xml with ${sortedRoutes.length} URLs at ${outputFile}`);
