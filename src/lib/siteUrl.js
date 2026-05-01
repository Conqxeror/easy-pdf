export const DEFAULT_SITE_URL = 'https://easy-pdf-murex.vercel.app';

export function resolveSiteUrl(baseOverride) {
  const base = baseOverride || process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || DEFAULT_SITE_URL;
  const stringBase = String(base).trim() || DEFAULT_SITE_URL;
  const normalized = stringBase.startsWith('http') ? stringBase : `https://${stringBase}`;

  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
}