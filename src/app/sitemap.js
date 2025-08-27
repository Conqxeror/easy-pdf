import { toolsData } from '@/lib/toolData';

export default async function sitemap() {
  const tools = toolsData.map((tool) => ({
    url: `https://easy-pdf-murex.vercel.app${tool.href}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categories = [
    { name: 'convert-create', priority: 0.9 },
    { name: 'organize-edit', priority: 0.9 },
    { name: 'security-privacy', priority: 0.9 },
    { name: 'forms-documents', priority: 0.8 },
    { name: 'business-tools', priority: 0.7 },
    { name: 'ai-analysis', priority: 0.7 },
    { name: 'advanced-pdf-tools', priority: 0.7 },
  ];

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