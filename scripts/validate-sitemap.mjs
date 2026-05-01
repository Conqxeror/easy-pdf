import { XMLParser, XMLValidator } from 'fast-xml-parser';

const baseUrl = (process.env.PW_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const expectedOrigin = new URL(baseUrl).origin;
const validChangeFrequencies = new Set(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']);

const asArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const normalizeText = (value) => {
  if (value == null) return '';
  if (typeof value === 'object' && '#text' in value) return String(value['#text']).trim();
  return String(value).trim();
};

const assertUrl = (value, label, issues) => {
  try {
    const parsedUrl = new URL(value);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      issues.push(`${label} must use http or https: ${value}`);
    }
    return parsedUrl;
  } catch {
    issues.push(`${label} is not a valid absolute URL: ${value}`);
    return null;
  }
};

const fetchText = async (url) => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return { response, text };
  } catch (error) {
    const causeCode = error.cause?.code ? ` (${error.cause.code})` : '';
    throw new Error(`Unable to fetch ${url}${causeCode}. Start the app server or set PW_BASE_URL to a running deployment.`);
  }
};

const validateRobots = async (issues) => {
  const { response, text } = await fetchText(`${baseUrl}/robots.txt`);
  if (!response.ok) {
    issues.push(`robots.txt returned HTTP ${response.status}`);
    return;
  }

  if (!text.includes(`${expectedOrigin}/sitemap.xml`)) {
    issues.push('robots.txt does not point to the active sitemap URL');
  }
};

const validateUrlReachability = async (urls, issues) => {
  const concurrency = 8;
  let index = 0;

  const worker = async () => {
    while (index < urls.length) {
      const currentIndex = index;
      index += 1;
      const url = urls[currentIndex];

      try {
        const response = await fetch(url, { method: 'GET', redirect: 'manual' });
        if (response.status >= 400) {
          issues.push(`Sitemap URL returned HTTP ${response.status}: ${url}`);
        }
        if (response.status >= 300 && response.status < 400) {
          issues.push(`Sitemap URL should be canonical and not redirect: ${url}`);
        }
      } catch (error) {
        issues.push(`Sitemap URL failed to fetch: ${url} (${error.message})`);
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));
};

const run = async () => {
  const issues = [];
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const { response, text } = await fetchText(sitemapUrl);

  if (!response.ok) {
    throw new Error(`sitemap.xml returned HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('xml')) {
    issues.push(`sitemap.xml should use an XML content type, received: ${contentType}`);
  }

  const byteLength = Buffer.byteLength(text, 'utf8');
  if (byteLength > 50 * 1024 * 1024) {
    issues.push('sitemap.xml exceeds the 50MB uncompressed sitemap limit');
  }

  const xmlValidation = XMLValidator.validate(text, {
    allowBooleanAttributes: false,
  });
  if (xmlValidation !== true) {
    throw new Error(`sitemap.xml is not valid XML: ${xmlValidation.err?.msg || 'unknown parser error'}`);
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
  });
  const parsed = parser.parse(text);
  const urlset = parsed.urlset;
  if (!urlset) {
    throw new Error('sitemap.xml is missing the urlset root element');
  }

  if (urlset['@_xmlns'] !== 'http://www.sitemaps.org/schemas/sitemap/0.9') {
    issues.push('urlset is missing the standard sitemap namespace');
  }
  if (urlset['@_xmlns:image'] !== 'http://www.google.com/schemas/sitemap-image/1.1') {
    issues.push('urlset is missing the image sitemap namespace');
  }

  const entries = asArray(urlset.url);
  if (entries.length === 0) {
    issues.push('sitemap.xml has no URL entries');
  }
  if (entries.length > 50000) {
    issues.push(`sitemap.xml has ${entries.length} URLs, exceeding the 50,000 URL limit`);
  }

  const seenLocs = new Set();
  const locs = [];

  entries.forEach((entry, entryIndex) => {
    const loc = normalizeText(entry.loc);
    if (!loc) {
      issues.push(`URL entry ${entryIndex + 1} is missing loc`);
      return;
    }

    const parsedLoc = assertUrl(loc, 'loc', issues);
    if (parsedLoc) {
      if (parsedLoc.origin !== expectedOrigin) {
        issues.push(`loc origin does not match ${expectedOrigin}: ${loc}`);
      }
      if (parsedLoc.hash) {
        issues.push(`loc must not contain a URL fragment: ${loc}`);
      }
      if (parsedLoc.pathname !== '/' && parsedLoc.pathname.endsWith('/')) {
        issues.push(`loc should avoid trailing slash redirects: ${loc}`);
      }
    }

    if (seenLocs.has(loc)) {
      issues.push(`Duplicate loc found: ${loc}`);
    }
    seenLocs.add(loc);
    locs.push(loc);

    const lastmod = normalizeText(entry.lastmod);
    if (lastmod && Number.isNaN(Date.parse(lastmod))) {
      issues.push(`Invalid lastmod for ${loc}: ${lastmod}`);
    }

    const changefreq = normalizeText(entry.changefreq);
    if (changefreq && !validChangeFrequencies.has(changefreq)) {
      issues.push(`Invalid changefreq for ${loc}: ${changefreq}`);
    }

    const priority = normalizeText(entry.priority);
    if (priority) {
      const numericPriority = Number(priority);
      if (!Number.isFinite(numericPriority) || numericPriority < 0 || numericPriority > 1) {
        issues.push(`Invalid priority for ${loc}: ${priority}`);
      }
    }

    asArray(entry['image:image']).forEach((image, imageIndex) => {
      const imageLoc = normalizeText(image['image:loc']);
      if (!imageLoc) {
        issues.push(`Image entry ${imageIndex + 1} for ${loc} is missing image:loc`);
        return;
      }
      assertUrl(imageLoc, `image:loc for ${loc}`, issues);
    });
  });

  await validateRobots(issues);
  await validateUrlReachability(locs, issues);

  if (issues.length > 0) {
    console.error(JSON.stringify({ sitemapUrl, checkedUrls: locs.length, issues }, null, 2));
    process.exit(1);
  }

  console.log(`Sitemap audit passed for ${locs.length} URLs (${Math.round(byteLength / 1024)} KB).`);
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});