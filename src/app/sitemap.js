import { glob } from 'glob';

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://easy-pdf-murex.vercel.app';
  const lastModified = new Date();

  // Get all page routes synchronously
  const pages = glob.sync('src/app/**/page.{js,jsx,ts,tsx}');

  const routes = pages.map((page) => {
    const route = page
      .replace('src/app', '')
      .replace(/\\/g, '/') // Correctly handle backslashes on Windows
      .replace('/page.js', '')
      .replace('/page.jsx', '')
      .replace('/page.ts', '')
      .replace('/page.tsx', '');
    return route === '' ? '/' : route;
  });

  const sitemapEntries = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: route === '/' ? 1.0 : 0.8,
  }));

  // Add any other static pages that are not in the app directory
  const staticPages = [
    // Add any other static pages here if needed
  ];

  return [...sitemapEntries, ...staticPages];
}
