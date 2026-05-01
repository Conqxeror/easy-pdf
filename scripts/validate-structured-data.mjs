import { chromium } from 'playwright';

const baseUrl = (process.env.PW_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const maxRoutes = Number(process.env.SEO_AUDIT_LIMIT || 140);

const flatten = (value) => (Array.isArray(value) ? value.flatMap(flatten) : value ? [value] : []);
const getTypes = (schema) => (Array.isArray(schema?.['@type']) ? schema['@type'] : [schema?.['@type']].filter(Boolean));
const hasType = (schema, type) => getTypes(schema).includes(type);

const pathnameFromLoc = (loc) => {
  try {
    return new URL(loc).pathname;
  } catch {
    return '/';
  }
};

const fetchSitemapRoutes = async () => {
  const response = await fetch(`${baseUrl}/sitemap.xml`);
  if (!response.ok) {
    throw new Error(`Unable to fetch sitemap.xml from ${baseUrl}: HTTP ${response.status}`);
  }

  const sitemapText = await response.text();
  const locs = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const routes = [...new Set(locs.map(pathnameFromLoc))];

  if (!routes.length) {
    throw new Error('No routes found in sitemap.xml');
  }

  return routes.slice(0, maxRoutes);
};

const auditRoute = async (page, route) => {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

  const data = await page.evaluate(() => {
    const schemas = [];
    const parseErrors = [];

    document.querySelectorAll('script[type="application/ld+json"]').forEach((script, index) => {
      try {
        const parsed = JSON.parse(script.textContent || 'null');
        if (Array.isArray(parsed)) schemas.push(...parsed);
        else if (parsed && Array.isArray(parsed['@graph'])) schemas.push(...parsed['@graph']);
        else if (parsed) schemas.push(parsed);
      } catch (error) {
        parseErrors.push({ index, message: error.message });
      }
    });

    return {
      bodyText: document.body.innerText,
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      robots: document.querySelector('meta[name="robots"]')?.content || '',
      schemas,
      parseErrors,
    };
  });

  const schemas = flatten(data.schemas).filter(Boolean);
  const ids = schemas.map((schema) => schema['@id']).filter(Boolean);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  const aggregateLike = schemas.filter((schema) => hasType(schema, 'AggregateRating') || hasType(schema, 'Review') || schema.aggregateRating || schema.review);
  const breadcrumbs = schemas.filter((schema) => hasType(schema, 'BreadcrumbList'));
  const faqs = schemas.filter((schema) => hasType(schema, 'FAQPage'));
  const apps = schemas.filter((schema) => hasType(schema, 'WebApplication') || hasType(schema, 'SoftwareApplication'));
  const expectedCanonical = `${baseUrl}${route === '/' ? '/' : route}`;
  const issues = [];

  if (!response || response.status() >= 400) issues.push(`HTTP ${response?.status() || 0}`);
  if (data.parseErrors.length) issues.push(`JSON-LD parse errors: ${data.parseErrors.length}`);
  if (duplicateIds.length) issues.push(`duplicate @id values: ${duplicateIds.join(', ')}`);
  if (aggregateLike.length) issues.push(`review or aggregate rating schema present: ${aggregateLike.length}`);
  if (!data.canonical.startsWith(expectedCanonical.replace(/\/$/, ''))) issues.push(`canonical mismatch: ${data.canonical}`);
  if (route === '/sponsor-dashboard' && !data.robots.includes('noindex')) issues.push('sponsor dashboard is missing noindex');
  if (breadcrumbs.length > 1) issues.push(`multiple BreadcrumbList schemas: ${breadcrumbs.length}`);

  breadcrumbs.forEach((breadcrumb) => {
    const invalidItems = (breadcrumb.itemListElement || []).filter((item) => !item.name || !item.position || !item.item);
    if (invalidItems.length) issues.push(`invalid breadcrumb items: ${invalidItems.length}`);
  });

  if (faqs.length > 1) issues.push(`multiple FAQPage schemas: ${faqs.length}`);
  faqs.forEach((faqPage) => {
    const invalidFaqs = (faqPage.mainEntity || []).filter((faq) => !faq.name || !faq.acceptedAnswer?.text || !data.bodyText.includes(faq.name));
    if (invalidFaqs.length) issues.push(`FAQ schema entries are incomplete or not visible: ${invalidFaqs.length}`);
  });

  apps.forEach((app) => {
    if (!app.name || !app.url || !app.offers || !app.applicationCategory || !app.operatingSystem) {
      issues.push('incomplete WebApplication/SoftwareApplication schema');
    }
  });

  return issues.length > 0 ? { route, issues } : null;
};

const run = async () => {
  const routes = await fetchSitemapRoutes();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const failures = [];

  for (const route of routes) {
    try {
      const failure = await auditRoute(page, route);
      if (failure) failures.push(failure);
    } catch (error) {
      failures.push({ route, issues: [error.message] });
    }
  }

  await browser.close();

  if (failures.length > 0) {
    console.error(JSON.stringify({ checked: routes.length, failures }, null, 2));
    process.exit(1);
  }

  console.log(`Structured data audit passed for ${routes.length} sitemap routes.`);
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});