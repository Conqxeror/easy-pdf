import { resolveSiteUrl } from '@/lib/siteUrl';

export function GET() {
  const siteUrl = resolveSiteUrl();
  const host = siteUrl.replace(/^https?:\/\//, '');
  const body = [
    'User-agent: *',
    'Allow: /',
    'Allow: /public/',
    'Allow: /icon.svg',
    'Allow: /og-image.jpg',
    'Allow: /twitter-image.jpg',
    'Allow: /site.webmanifest',
    'Allow: /favicon.ico',
    'Allow: /apple-touch-icon.png',
    'Allow: /og/',
    'Allow: /api/og/',
    'Disallow: /api/',
    'Disallow: /_next/',
    'Disallow: /static/',
    'Disallow: /.well-known/',
    'Disallow: /scripts/',
    'Disallow: /node_modules/',
    'Disallow: /admin/',
    'Disallow: /private/',
    'Disallow: /temp/',
    'Crawl-delay: 0.5',
    '',
    'User-agent: Googlebot',
    'Allow: /',
    'Crawl-delay: 0',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    `Host: ${host}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}