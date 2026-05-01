import fs from 'node:fs';
import path from 'node:path';
import { XMLValidator } from 'fast-xml-parser';

const rootDir = process.cwd();
const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://easy-pdf-murex.vercel.app').replace(/\/$/, '');
const validChangeFrequencies = new Set(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']);

const slugify = (input) => String(input || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const escapeXml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const readSource = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

const extractToolHrefs = () => {
  const source = readSource('src/lib/toolData.js');
  return [...source.matchAll(/href:\s*["']([^"']+)["']/g)].map((match) => match[1]);
};

const extractCategorySlugs = () => {
  const source = readSource('src/lib/toolCategories.js');
  return [...source.matchAll(/\{\s*\n\s*name:\s*["']([^"']+)["'],\s*\n\s*icon:/g)]
    .map((match) => slugify(match[1]))
    .filter(Boolean);
};

const routeExists = (route) => {
  if (route === '/') return fs.existsSync(path.join(rootDir, 'src/app/page.js'));
  if (route.startsWith('/categories/')) {
    return fs.existsSync(path.join(rootDir, 'src/app/categories/[category]/page.js'));
  }

  return [
    path.join(rootDir, 'src/app', route, 'page.js'),
    path.join(rootDir, 'src/app', route, 'page.jsx'),
    path.join(rootDir, 'src/app', route, 'page.tsx'),
  ].some(fs.existsSync);
};

const buildModeledEntries = () => {
  const staticRoutes = [
    { route: '/', priority: 1.0, changeFrequency: 'daily' },
    { route: '/tools', priority: 0.9, changeFrequency: 'daily' },
    { route: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { route: '/security', priority: 0.7, changeFrequency: 'monthly' },
    { route: '/privacy', priority: 0.7, changeFrequency: 'yearly' },
    { route: '/terms', priority: 0.5, changeFrequency: 'yearly' },
    { route: '/sponsors', priority: 0.5, changeFrequency: 'weekly' },
  ];
  const categoryRoutes = extractCategorySlugs().map((slug) => ({ route: `/categories/${slug}`, priority: 0.7, changeFrequency: 'weekly' }));
  const toolRoutes = extractToolHrefs().map((href) => ({ route: href, priority: 0.8, changeFrequency: 'weekly' }));

  return [...staticRoutes, ...categoryRoutes, ...toolRoutes].map((entry) => ({
    ...entry,
    url: `${baseUrl}${entry.route === '/' ? '' : entry.route}`,
    lastModified: new Date('2024-01-01T00:00:00.000Z'),
  }));
};

const buildXml = (entries) => {
  const urlEntries = entries.map((entry) => [
    '<url>',
    `<loc>${escapeXml(entry.url)}</loc>`,
    `<lastmod>${entry.lastModified.toISOString()}</lastmod>`,
    `<changefreq>${entry.changeFrequency}</changefreq>`,
    `<priority>${entry.priority}</priority>`,
    '</url>',
  ].join('\n'));

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join('\n')}\n</urlset>`;
};

const run = () => {
  const issues = [];
  const entries = buildModeledEntries();
  const routes = entries.map((entry) => new URL(entry.url).pathname);
  const duplicateRoutes = [...new Set(routes.filter((route, index) => routes.indexOf(route) !== index))];

  duplicateRoutes.forEach((route) => issues.push(`Duplicate modeled sitemap route: ${route}`));

  entries.forEach((entry) => {
    const parsedUrl = new URL(entry.url);
    if (parsedUrl.hash) issues.push(`Sitemap route must not contain a fragment: ${entry.url}`);
    if (parsedUrl.pathname !== '/' && parsedUrl.pathname.endsWith('/')) issues.push(`Sitemap route should not use a trailing slash: ${entry.url}`);
    if (!validChangeFrequencies.has(entry.changeFrequency)) issues.push(`Invalid changeFrequency for ${entry.url}: ${entry.changeFrequency}`);
    if (!Number.isFinite(entry.priority) || entry.priority < 0 || entry.priority > 1) issues.push(`Invalid priority for ${entry.url}: ${entry.priority}`);
    if (!routeExists(parsedUrl.pathname)) issues.push(`No app route file found for sitemap route: ${parsedUrl.pathname}`);
  });

  const xml = buildXml(entries);
  const xmlValidation = XMLValidator.validate(xml);
  if (xmlValidation !== true) {
    issues.push(`Modeled sitemap XML is invalid: ${xmlValidation.err?.msg || 'unknown parser error'}`);
  }

  if (issues.length > 0) {
    console.error(JSON.stringify({ checkedRoutes: entries.length, issues }, null, 2));
    process.exit(1);
  }

  console.log(`Source sitemap audit passed for ${entries.length} modeled routes.`);
};

run();