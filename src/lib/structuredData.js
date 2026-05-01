// Compatibility wrappers around the canonical SEO helpers.
// Keep imports of this legacy module working while preventing schema drift.
import { generateBreadcrumbListSchema, generateComprehensiveJsonLd } from './seoEnhancements';

export const generateJsonLd = (pageType, pageData = {}) => {
  return generateComprehensiveJsonLd(pageType, pageData);
};

export const generateBreadcrumbSchema = (breadcrumbs = []) => {
  return generateBreadcrumbListSchema(breadcrumbs);
};