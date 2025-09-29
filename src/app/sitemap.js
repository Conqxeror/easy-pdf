import { toolsData } from '@/lib/toolData';
import { slugify } from '@/lib/slugify';

export default async function sitemap() {
  const tools = toolsData.map((tool) => ({
    url: `https://easy-pdf-murex.vercel.app${tool.href}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Build category list from toolCategories to keep slugs and names in sync
  const { toolCategories } = await import('@/lib/toolCategories');
  const categories = toolCategories.map(cat => ({ name: slugify(cat.name), priority: 0.8 }));

  const categoryPages = categories.map((category) => ({
    url: `https://easy-pdf-murex.vercel.app/categories/${category.name}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: category.priority,
  }));

  const routes = [
    '',
    '/tools',
    '/security',
    '/about',
    '/sponsors',
    '/sitemap.xml',
  ].map((route) => ({
    url: `https://easy-pdf-murex.vercel.app${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes, ...categoryPages, ...tools];
}