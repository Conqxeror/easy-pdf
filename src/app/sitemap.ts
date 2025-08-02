import { MetadataRoute } from 'next';
import { toolsData } from '@/lib/toolData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://easy-pdf-murex.vercel.app';
  const lastModified = new Date();

  const staticPages = [
    {
      url: baseUrl,
      lastModified: lastModified,
      changeFrequency: 'weekly' as 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: lastModified,
      changeFrequency: 'monthly' as 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/security`,
      lastModified: lastModified,
      changeFrequency: 'monthly' as 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sponsors`,
      lastModified: lastModified,
      changeFrequency: 'monthly' as 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sponsor-dashboard`,
      lastModified: lastModified,
      changeFrequency: 'monthly' as 'monthly',
      priority: 0.8,
    },
  ];

  const toolPages = toolsData
    .filter((tool) => !tool.comingSoon)
    .map((tool) => ({
      url: `${baseUrl}${tool.href}`,
      lastModified: lastModified,
      changeFrequency: 'monthly' as 'monthly',
      priority: 0.8,
    }));

  return [...staticPages, ...toolPages];
}