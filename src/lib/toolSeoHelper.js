import { generateEnhancedMetadata, generateComprehensiveJsonLd, generateHowToSchema, toolHowToSchemas } from './seoEnhancements';
import fs from 'fs';
import path from 'path';
import { toolsData } from './toolData';
import { resolveSiteUrl } from './siteUrl';
import { getFAQsForTool } from './faqData';

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
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Tool not found for href: ${href}`);
    }
    // Return a safe fallback metadata object so callers that do `toolSeo?.metadata || {}`
    // still receive useful defaults and avoid empty metadata exports.
    const resolvedBase = resolveSiteUrl();
    const canonicalUrl = `${resolvedBase}${href}`;
    const fallbackMetadata = generateEnhancedMetadata({
      title: 'easy-pdf',
      description: 'Privacy-first PDF tools for secure document processing.',
      keywords: ['PDF tools', 'easy-pdf'],
      canonicalUrl,
      metadataBaseUrl: resolvedBase,
      toolName: 'easy-pdf',
      ogImage: `${resolvedBase}/og/homepage`,
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

  const resolvedBase = resolveSiteUrl();
  const canonicalUrl = `${resolvedBase}${href}`;
  // Replace slashes with dashes to match generated filenames (e.g. /pdf/merge -> pdf-merge)
  const slug = href.replace(/^\//, '').replace(/\//g, '-');
  const faqSlug = href.replace(/^\//, '');
  const faqs = Array.isArray(tool.faqs) && tool.faqs.length > 0 ? tool.faqs : getFAQsForTool(faqSlug);
  const breadcrumbs = [
    { name: 'Home', url: resolvedBase },
    { name: 'Tools', url: `${resolvedBase}/tools` },
    { name: tool.title, url: canonicalUrl }
  ];
  // Prefer pre-generated static OG images in public/og-static for top pages if available.
  const staticPath = path.join(process.cwd(), 'public', 'og-static', `${slug}.png`);
  let ogImageUrl;
  if (fs.existsSync(staticPath)) {
    ogImageUrl = `${resolvedBase}/og-static/${slug}.png`;
  } else {
    const ogVersion = tool.ogImageVersion ? `?v=${tool.ogImageVersion}` : '';
    const dynamicOgUrl = `${resolvedBase}/og/tool/${slug}${ogVersion}`;
    const preferStaticFallback = process.env.NEXT_PUBLIC_PREFER_STATIC_OG === 'true';
    ogImageUrl = preferStaticFallback ? `${resolvedBase}/og-static/tool.png` : dynamicOgUrl;
  }

  // Generate metadata
  const metadata = generateEnhancedMetadata({
    title: tool.seoTitle || tool.title,
    description: tool.seoDescription || tool.description,
    keywords: tool.keywords || [],
    canonicalUrl,
    metadataBaseUrl: resolvedBase,
    ogImage: ogImageUrl,
    toolName: tool.title,
    pageType: 'tool',
    breadcrumbs,
    lastModified: new Date().toISOString()
  });

  // Generate structured data with breadcrumbs
  const structuredData = generateComprehensiveJsonLd('tool', {
    title: tool.title,
    description: tool.description,
    url: href,
    features: tool.features || [],
    faqs,
    breadcrumbs,
    keywords: tool.keywords || [],
    category: tool.category,
    canonicalUrl,
    image: ogImageUrl,
    lastModified: new Date().toISOString()
  });

  // Generate HowTo schema if available for this tool (slug already defined above)
  const howToData = toolHowToSchemas[slug];
  const howToSchema = howToData ? generateHowToSchema(howToData) : null;

  return {
    metadata,
    structuredData,
    howToSchema,
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
