import { toolsData } from '@/lib/toolData';
import { slugify } from '@/lib/slugify';

export function buildSitemapXml(final) {
	const escapeXml = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

	const urlEntries = final.map((entry) => {
		const parts = [];
		parts.push('<url>');
		parts.push(`<loc>${escapeXml(entry.url)}</loc>`);
		if (entry.lastModified) parts.push(`<lastmod>${escapeXml(new Date(entry.lastModified).toISOString())}</lastmod>`);
		if (entry.changeFrequency) parts.push(`<changefreq>${escapeXml(entry.changeFrequency)}</changefreq>`);
		if (typeof entry.priority !== 'undefined') parts.push(`<priority>${escapeXml(entry.priority)}</priority>`);

		if (Array.isArray(entry.images) && entry.images.length > 0) {
			// Images can be strings or objects — normalize to URL string
			entry.images.forEach((img) => {
				const imgUrl = typeof img === 'string' ? img : (img?.url ?? img?.loc ?? img?.src ?? '');
				if (!imgUrl) return; // skip invalid entries
				parts.push('<image:image>');
				parts.push(`<image:loc>${escapeXml(imgUrl)}</image:loc>`);
				const title = typeof img === 'object' && (img.title || img.caption) ? (img.title || img.caption) : null;
				if (title) parts.push(`<image:title>${escapeXml(title)}</image:title>`);
				parts.push('</image:image>');
			});
		}

		parts.push('</url>');
		return parts.join('\n');
	});

	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
		urlEntries.join('\n') +
		`\n</urlset>`;

	return xml;
}

export async function getSitemapEntries() {
	// Use environment variable for base URL or fallback
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://easy-pdf-murex.vercel.app';
	const resolvedBase = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

	// Tool pages with higher priority for popular tools
	const tools = toolsData.map((tool) => ({
		url: `${resolvedBase}${tool.href}`,
		lastModified: new Date(),
		changeFrequency: 'weekly',
		priority: ['merge', 'split', 'compress', 'jpg-to-pdf', 'pdf-to-jpg'].some(p => tool.href.includes(p)) ? 0.9 : 0.8,
		// For sitemap images we must provide plain absolute URLs (strings).
		images: [
			(function () {
				const staticPath = `/og-static/${tool.href.replace(/^\//, '')}.png`;
				const exists = (() => {
					try { return require('fs').existsSync(require('path').join(process.cwd(), 'public', 'og-static', `${tool.href.replace(/^\//, '')}.png`)); } catch { return false; }
				})();

				return exists ? `${resolvedBase}${staticPath}` : `${resolvedBase}/og/tool/${tool.href.replace(/^\//, '')}`;
			})()
		]
	}));

	// Build category list from toolCategories to keep slugs and names in sync
	const { toolCategories } = await import('@/lib/toolCategories');
	const categories = toolCategories.map(cat => ({ name: slugify(cat.name), priority: 0.7 }));

	const categoryPages = categories.map((category) => ({
		url: `${resolvedBase}/categories/${category.name}`,
		lastModified: new Date(),
		changeFrequency: 'weekly',
		priority: category.priority,
	}));

	// Static routes - homepage gets highest priority
	const routes = [
		{ route: '', priority: 1.0, changeFrequency: 'daily' },
		{ route: '/tools', priority: 0.9, changeFrequency: 'daily' },
		{ route: '/about', priority: 0.6, changeFrequency: 'monthly' },
		{ route: '/security', priority: 0.7, changeFrequency: 'monthly' },
		{ route: '/sponsors', priority: 0.5, changeFrequency: 'weekly' },
	].map((item) => ({
		url: `${resolvedBase}${item.route}`,
		lastModified: new Date(),
		changeFrequency: item.changeFrequency,
		priority: item.priority,
		// Use a single absolute URL string for the homepage image
		images: item.route === '' ? [`${resolvedBase}/og/homepage`] : undefined,
	}));

	return [...routes, ...categoryPages, ...tools];
}
