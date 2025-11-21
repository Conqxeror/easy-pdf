import { toolsData } from '@/lib/toolData';
import { slugify } from '@/lib/slugify';

export function buildSitemapXml(final) {
	const escapeXml = (str) => {
		// Ensure we have a valid string before escaping
		const strValue = str == null ? '' : String(str);
		return strValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	};

	const urlEntries = final.map((entry) => {
		const parts = [];
		parts.push('<url>');
		
		// Ensure URL is a valid string
		const url = entry.url ? String(entry.url).trim() : '';
		if (!url) return ''; // Skip entries without URL
		parts.push(`<loc>${escapeXml(url)}</loc>`);
		
		// Format lastModified as ISO string
		if (entry.lastModified) {
			const dateStr = entry.lastModified instanceof Date 
				? entry.lastModified.toISOString()
				: new Date(entry.lastModified).toISOString();
			parts.push(`<lastmod>${escapeXml(dateStr)}</lastmod>`);
		}
		
		if (entry.changeFrequency) parts.push(`<changefreq>${escapeXml(entry.changeFrequency)}</changefreq>`);
		
		if (typeof entry.priority !== 'undefined' && entry.priority !== null) {
			// Explicitly convert priority to string to avoid any object serialization
			const priorityStr = String(Number(entry.priority));
			parts.push(`<priority>${escapeXml(priorityStr)}</priority>`);
		}

		if (Array.isArray(entry.images) && entry.images.length > 0) {
			// Images can be strings or objects — normalize to URL string
			entry.images.forEach((img) => {
				// Safely extract URL as a string
				let imgUrl = '';
				if (typeof img === 'string') {
					imgUrl = img.trim();
				} else if (img && typeof img === 'object') {
					imgUrl = (img.url || img.loc || img.src || '');
					if (typeof imgUrl === 'string') {
						imgUrl = imgUrl.trim();
					}
				}
				
				// Validate URL has proper scheme
				if (!imgUrl || !/^https?:\/\//.test(imgUrl)) return;
				
				parts.push('<image:image>');
				parts.push(`<image:loc>${escapeXml(imgUrl)}</image:loc>`);
				
				// Extract title safely
				const title = (img && typeof img === 'object' && (img.title || img.caption))
					? String(img.title || img.caption).trim()
					: null;
				if (title) parts.push(`<image:title>${escapeXml(title)}</image:title>`);
				parts.push('</image:image>');
			});
		}

		parts.push('</url>');
		return parts.join('\n');
	}).filter(entry => entry); // Filter out any empty entries

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
	const tools = toolsData.map((tool) => {
		// Generate image URL for this tool
		const staticPath = `/og-static/${tool.href.replace(/^\//, '')}.png`;
		let imageUrl = '';
		
		try {
			const exists = require('fs').existsSync(
				require('path').join(process.cwd(), 'public', 'og-static', `${tool.href.replace(/^\//, '')}.png`)
			);
			imageUrl = exists ? `${resolvedBase}${staticPath}` : `${resolvedBase}/og/tool/${tool.href.replace(/^\//, '')}`;
		} catch {
			// Fallback to dynamic OG generation if fs check fails
			imageUrl = `${resolvedBase}/og/tool/${tool.href.replace(/^\//, '')}`;
		}
		
		return {
			url: `${resolvedBase}${tool.href}`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: ['merge', 'split', 'compress', 'jpg-to-pdf', 'pdf-to-jpg'].some(p => tool.href.includes(p)) ? 0.9 : 0.8,
			// For sitemap images we must provide plain absolute URLs as strings
			images: imageUrl ? [imageUrl] : undefined
		};
	});

	// Build category list from toolCategories to keep slugs and names in sync
	const { toolCategories } = await import('@/lib/toolCategories');
	const categories = toolCategories.map(cat => ({ name: slugify(cat.name), priority: 0.7 }));

	const categoryPages = categories.map((category) => ({
		url: `${resolvedBase}/categories/${category.name}`,
		lastModified: new Date(),
		changeFrequency: 'weekly',
		priority: category.priority,
		// Category pages don't need images
		images: undefined
	}));

	// Static routes - homepage gets highest priority
	const routes = [
		{ route: '', priority: 1.0, changeFrequency: 'daily', image: `${resolvedBase}/og/homepage` },
		{ route: '/tools', priority: 0.9, changeFrequency: 'daily', image: undefined },
		{ route: '/about', priority: 0.6, changeFrequency: 'monthly', image: undefined },
		{ route: '/security', priority: 0.7, changeFrequency: 'monthly', image: undefined },
		{ route: '/sponsors', priority: 0.5, changeFrequency: 'weekly', image: undefined },
	].map((item) => ({
		url: `${resolvedBase}${item.route}`,
		lastModified: new Date(),
		changeFrequency: item.changeFrequency,
		priority: item.priority,
		// Include image URL as a string in array if present
		images: item.image ? [item.image] : undefined,
	}));

	return [...routes, ...categoryPages, ...tools];
}
