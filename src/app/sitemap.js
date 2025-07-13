import { toolsData } from '@/lib/toolData'

export default function sitemap() {
  const baseUrl = 'https://easy-pdf-murex.vercel.app'
  const lastModified = new Date('2025-07-13')
  
  // Static pages that definitely exist
  const staticPages = [
    {
      url: baseUrl,
      lastModified: lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/security`,
      lastModified: lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // Tool pages - only include tools that exist and are not coming soon
  const existingToolPages = toolsData
    .filter((tool) => !tool.comingSoon)
    .map((tool) => ({
      url: `${baseUrl}${tool.href}`,
      lastModified: lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    }))

  return [...staticPages, ...existingToolPages]
}