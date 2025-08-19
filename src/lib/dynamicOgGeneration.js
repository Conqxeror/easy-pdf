/**
 * Dynamic Open Graph image generation utilities
 * Provides functions to generate dynamic OG image URLs for different content types
 */

export const generateDynamicOgImageUrl = ({
  title,
  description,
  tool,
  category,
  theme = 'default',
  baseUrl = 'https://easy-pdf-murex.vercel.app'
}) => {
  // Create URL with query parameters for dynamic generation
  const ogUrl = new URL('/api/og', baseUrl);
  
  if (title) ogUrl.searchParams.set('title', title);
  if (description) ogUrl.searchParams.set('description', description);
  if (tool) ogUrl.searchParams.set('tool', tool);
  if (category) ogUrl.searchParams.set('category', category);
  if (theme) ogUrl.searchParams.set('theme', theme);
  
  return ogUrl.toString();
};

/**
 * Generate OG image URL from tool data
 */
export const generateToolOgImageUrl = (toolData, baseUrl = 'https://easy-pdf-murex.vercel.app') => {
  return generateDynamicOgImageUrl({
    title: toolData.seoTitle || toolData.title,
    description: toolData.seoDescription || toolData.description,
    tool: toolData.title,
    category: toolData.category,
    baseUrl
  });
};

/**
 * Generate enhanced metadata from tool data object
 * This is a convenience function for tool pages
 */
export const generateToolMetadata = (toolData, baseUrl = 'https://easy-pdf-murex.vercel.app') => {
  const toolUrl = `${baseUrl}${toolData.href}`;
  
  return {
    title: toolData.seoTitle || toolData.title,
    description: toolData.seoDescription || toolData.description,
    keywords: toolData.keywords,
    canonicalUrl: toolUrl,
    metadataBaseUrl: baseUrl,
    toolName: toolData.title,
    toolCategory: toolData.category,
    pageType: "tool",
    breadcrumbs: [
      { name: "Home", url: baseUrl },
      { name: toolData.title, url: toolUrl }
    ]
  };
};

/**
 * Generate OG image URL for homepage
 */
export const generateHomepageOgImageUrl = (baseUrl = 'https://easy-pdf-murex.vercel.app') => {
  return generateDynamicOgImageUrl({
    title: 'easy-pdf - Privacy-First PDF Tools',
    description: 'Free online PDF tools that work entirely in your browser. No uploads, no privacy concerns.',
    tool: 'PDF Tools Suite',
    category: 'default',
    theme: 'homepage',
    baseUrl
  });
};

/**
 * Generate OG image URL for article/blog pages
 */
export const generateArticleOgImageUrl = ({
  title,
  description,
  author,
  publishDate,
  baseUrl = 'https://easy-pdf-murex.vercel.app'
}) => {
  return generateDynamicOgImageUrl({
    title,
    description,
    tool: 'Article',
    category: 'Blog',
    theme: 'article',
    baseUrl
  });
};

/**
 * Get fallback static OG image URL
 */
export const getFallbackOgImageUrl = (baseUrl = 'https://easy-pdf-murex.vercel.app') => {
  return `${baseUrl}/og-image.jpg`;
};

/**
 * Enhanced function that provides fallback for dynamic OG generation
 */
export const getOgImageUrl = (params, baseUrl = 'https://easy-pdf-murex.vercel.app') => {
  try {
    // Try to generate dynamic OG image URL
    return generateDynamicOgImageUrl({ ...params, baseUrl });
  } catch (error) {
    console.warn('Failed to generate dynamic OG image URL, falling back to static:', error);
    return getFallbackOgImageUrl(baseUrl);
  }
};

/**
 * Generate Twitter card image URL (uses same dynamic generation)
 */
export const getTwitterImageUrl = (params, baseUrl = 'https://easy-pdf-murex.vercel.app') => {
  // For Twitter, we can use the same dynamic OG generation
  // but could potentially add Twitter-specific formatting if needed
  return getOgImageUrl(params, baseUrl);
};