import { generateEnhancedMetadata, generateComprehensiveJsonLd } from './seoEnhancements';
import { toolsData } from './toolData';

/**
 * Get metadata for a tool page using toolsData
 * @param {string} href - The tool href (e.g., '/merge')
 * @returns {object} - Metadata and structured data for the tool
 * 
 * IMPORTANT: This function always returns a complete metadata object.
 * The fallback ensures that `toolSeo?.metadata || {}` in layout files
 * will receive valid metadata even if the tool is not found in toolData.
 */
export function getToolMetadata(href) {
  const tool = toolsData.find(t => t.href === href);
  
  if (!tool) {
    console.warn(`Tool not found for href: ${href}`);
    // Return a safe fallback metadata object so callers that do `toolSeo?.metadata || {}`
    // still receive useful defaults and avoid empty metadata exports.
    const resolvedBase = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://easy-pdf-murex.vercel.app';
    const canonicalUrl = `${resolvedBase}${href}`;
    const fallbackMetadata = generateEnhancedMetadata({
      title: 'easy-pdf',
      description: 'Privacy-first PDF tools for secure document processing.',
      keywords: ['PDF tools', 'easy-pdf'],
      canonicalUrl,
      metadataBaseUrl: resolvedBase,
      toolName: 'easy-pdf',
      pageType: 'tool'
    });

    const fallbackStructured = generateComprehensiveJsonLd('tool', {
      title: 'easy-pdf',
      description: 'Privacy-first PDF tools for secure document processing.',
      url: href,
      features: []
    });

    return {
      metadata: fallbackMetadata,
      structuredData: fallbackStructured,
      tool: null
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  const resolvedBase = baseUrl ? (baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`) : 'https://easy-pdf-murex.vercel.app';
  const canonicalUrl = `${resolvedBase}${href}`;

  // Generate metadata
  const metadata = generateEnhancedMetadata({
    title: tool.seoTitle || tool.title,
    description: tool.seoDescription || tool.description,
    keywords: tool.keywords || [],
    canonicalUrl,
    metadataBaseUrl: resolvedBase,
    toolName: tool.title,
    pageType: 'tool',
    breadcrumbs: [
      { name: 'Home', url: resolvedBase },
      { name: 'Tools', url: `${resolvedBase}/tools` },
      { name: tool.title, url: canonicalUrl }
    ],
    lastModified: new Date().toISOString()
  });

  // Generate structured data with breadcrumbs
  const structuredData = generateComprehensiveJsonLd('tool', {
    title: tool.title,
    description: tool.description,
    url: href,
    features: tool.features || [],
    breadcrumbs: [
      { name: 'Home', url: resolvedBase },
      { name: 'Tools', url: `${resolvedBase}/tools` },
      { name: tool.title, url: canonicalUrl }
    ]
  });

  return {
    metadata,
    structuredData,
    tool
  };
}

/**
 * Get all tool routes for sitemap generation
 */
export function getAllToolRoutes() {
  return toolsData.map(tool => ({
    href: tool.href,
    title: tool.title,
    keywords: tool.keywords || [],
    lastModified: new Date()
  }));
}

/**
 * Get related tools for a specific tool
 */
export function getRelatedTools(href) {
  const tool = toolsData.find(t => t.href === href);
  if (!tool || !tool.relatedTools) return [];
  
  return tool.relatedTools
    .map(relatedHref => toolsData.find(t => t.href === relatedHref))
    .filter(Boolean);
}
