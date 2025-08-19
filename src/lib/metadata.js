import { getOgImageUrl, getTwitterImageUrl } from './dynamicOgGeneration';

export const generateMetadata = ({ title, description, keywords, canonicalUrl, metadataBaseUrl, toolName, ogImage, toolCategory }) => {
  const baseTitle = title.includes('easy-pdf') ? title : `${title} | easy-pdf`
  const enhancedDescription = description.length > 160 ? description.substring(0, 157) + '...' : description
  
  // Generate dynamic OG image if not provided
  const dynamicOgImage = ogImage || getOgImageUrl({
    title: baseTitle,
    description: enhancedDescription,
    tool: toolName,
    category: toolCategory
  }, metadataBaseUrl);

  const dynamicTwitterImage = getTwitterImageUrl({
    title: baseTitle,
    description: enhancedDescription,
    tool: toolName,
    category: toolCategory
  }, metadataBaseUrl);
  
  return {
    metadataBase: new URL(metadataBaseUrl),
    title: baseTitle,
    description: enhancedDescription,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
    authors: [{ name: "Wali Mohammad Kadri", url: "https://easy-pdf-murex.vercel.app" }],
    applicationName: "easy-pdf",
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    
    creator: "Wali Mohammad Kadri",
    publisher: "easy-pdf",
    category: "DocumentEditor",
    classification: "Business Tools",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: [
        { url: "/icon.png", sizes: "192x192", type: "image/png" },
        { url: "/icon.png", sizes: "512x512", type: "image/png" }
      ],
      apple: "/icon.png",
      shortcut: "/favicon.ico",
    },
    openGraph: {
      title: baseTitle,
      description: enhancedDescription,
      url: canonicalUrl,
      siteName: "easy-pdf - Privacy-First PDF Tools",
      images: [
        {
          url: dynamicOgImage,
          width: 1200,
          height: 630,
          alt: `${toolName || title} - Free PDF Tool`,
          type: "image/jpeg",
        },
      ],
      locale: "en_IN",
      type: "website",
      countryName: "India",
    },
    twitter: {
      card: "summary_large_image",
      title: baseTitle,
      description: enhancedDescription,
      site: "@_MR_WALI_",
      creator: "@_MR_WALI_",
      images: [dynamicTwitterImage],
    },
    manifest: "/site.webmanifest",
    verification: {
      // Add verification codes when available
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      bing: process.env.BING_VERIFICATION,
    },
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'theme-color': '#1f2937',
      'color-scheme': 'dark light',
    },
  };
};