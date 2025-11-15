import { toolsData } from '@/lib/toolData';
import { slugify } from '@/lib/slugify';

export default async function sitemap() {
  // Use environment variable for base URL or fallback
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://easy-pdf-murex.vercel.app';
  const resolvedBase = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

  // Tool pages with higher priority for popular tools
  const tools = toolsData.map((tool) => ({
    url: `${resolvedBase}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: ['merge', 'split', 'compress', 'jpg-to-pdf', 'pdf-to-jpg'].some(p => tool.href.includes(p)) ? 0.9 : 0.8,
    images: [
      {
        url: (function () {
          const staticPath = `/og-static/${tool.href.replace(/^\//, '')}.png`;
          const exists = (() => {
            try { return require('fs').existsSync(require('path').join(process.cwd(), 'public', 'og-static', `${tool.href.replace(/^\//, '')}.png`)); } catch { return false; }
          })();

          return exists ? `${resolvedBase}${staticPath}` : `${resolvedBase}/og/tool/${tool.href.replace(/^\//, '')}`;
        })(),
        title: tool.title,
        width: 1200,
        height: 630
      }
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
    images: item.route === '' ? [{ url: `${resolvedBase}/og/homepage`, title: 'easy-pdf' }] : undefined,
  }));

  return [...routes, ...categoryPages, ...tools];
}