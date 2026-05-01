import { resolveSiteUrl } from './siteUrl';

const SITE_NAME = 'easy-pdf';
const DEFAULT_LANGUAGE = 'en-IN';

const normalizeUrl = (url, baseUrl = resolveSiteUrl()) => {
  if (!url) return baseUrl;
  const value = String(url).trim();
  if (!value) return baseUrl;
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value.endsWith('/') && value !== baseUrl ? value.slice(0, -1) : value;
  }
  const path = value.startsWith('/') ? value : `/${value}`;
  return `${baseUrl}${path}`;
};

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const uniqueBy = (items, getKey) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const dedupeJsonLdSchemas = (schemas = []) => {
  const flattened = schemas.flat().filter(Boolean);
  return uniqueBy(flattened, (schema) => {
    if (schema['@id']) return schema['@id'];
    const type = Array.isArray(schema['@type']) ? schema['@type'].join('|') : schema['@type'];
    const name = schema.name || schema.url || JSON.stringify(schema).slice(0, 160);
    return `${type}:${name}`;
  });
};

export const generateBreadcrumbListSchema = (breadcrumbs = [], pageUrl) => {
  const baseUrl = resolveSiteUrl();
  const normalizedItems = uniqueBy(
    breadcrumbs
      .map((crumb) => ({
        name: cleanText(crumb?.name || crumb?.label),
        url: normalizeUrl(crumb?.url || crumb?.href, baseUrl),
      }))
      .filter((crumb) => crumb.name && crumb.url),
    (crumb) => `${crumb.name.toLowerCase()}:${crumb.url}`
  );

  if (normalizedItems.length < 2) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${normalizeUrl(pageUrl || normalizedItems.at(-1)?.url, baseUrl)}#breadcrumb`,
    itemListElement: normalizedItems.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
};

const supportedReviewItemTypes = new Set([
  'Book',
  'Course',
  'Event',
  'Game',
  'HowTo',
  'MediaObject',
  'Movie',
  'MusicPlaylist',
  'MusicRecording',
  'Product',
  'Recipe',
  'SoftwareApplication',
]);

export const generateReviewSnippetSchema = ({
  itemName,
  itemType = 'SoftwareApplication',
  itemUrl,
  ratingValue,
  ratingCount,
  reviewCount,
  bestRating = 5,
  worstRating = 1,
} = {}) => {
  const numericRating = Number(ratingValue);
  const numericRatingCount = Number(ratingCount || reviewCount || 0);
  const normalizedType = supportedReviewItemTypes.has(itemType) ? itemType : 'SoftwareApplication';

  if (!itemName || !Number.isFinite(numericRating) || numericRating <= 0 || numericRatingCount <= 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    '@id': `${normalizeUrl(itemUrl || resolveSiteUrl())}#aggregate-rating`,
    itemReviewed: {
      '@type': normalizedType,
      name: cleanText(itemName),
      url: normalizeUrl(itemUrl || resolveSiteUrl()),
    },
    ratingValue: numericRating,
    ratingCount: Number(ratingCount || numericRatingCount),
    reviewCount: Number(reviewCount || numericRatingCount),
    bestRating,
    worstRating,
  };
};

// Enhanced SEO utilities for comprehensive optimization
export const generateEnhancedMetadata = ({
  title = 'easy-pdf',
  description = 'Privacy-first PDF tools for secure document processing.',
  keywords,
  canonicalUrl,
  metadataBaseUrl,
  toolName,
  ogImage,
  pageType = 'tool',
  breadcrumbs = [],
  lastModified,
  author = "Wali Mohammad Kadri",
  robots: robotsOverride
}) => {
  // Prefer runtime environment value for base URL when available
  const resolvedBase = resolveSiteUrl(metadataBaseUrl)

  // Fix: Don't add | easy-pdf if already present, and ensure title is under 60 chars
  let baseTitle = title.includes('easy-pdf') ? title : `${title} | easy-pdf`
  // Truncate if too long (keeping the | easy-pdf suffix)
  if (baseTitle.length > 60) {
    const suffix = ' | easy-pdf'
    const titleWithoutSuffix = baseTitle.replace(/\s*\|\s*easy-pdf.*$/i, '')
    const maxLength = 60 - suffix.length
    baseTitle = titleWithoutSuffix.substring(0, maxLength).trim() + suffix
  }

  const enhancedDescription = description.length > 160 ? description.substring(0, 157) + '...' : description
  const keywordArray = Array.isArray(keywords) ? keywords : (keywords ? [keywords] : [])
  const canonical = normalizeUrl(canonicalUrl || resolvedBase, resolvedBase)
  const openGraphType = pageType === 'article' ? 'article' : 'website'
  const defaultRobots = {
    index: true,
    follow: true,
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
      noimageindex: false,
      noarchive: false,
      nosnippet: false,
      nocache: false,
    },
    bingBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  }

  const robots = robotsOverride
    ? {
      ...defaultRobots,
      ...robotsOverride,
      googleBot: {
        ...defaultRobots.googleBot,
        ...(robotsOverride.googleBot || {}),
        ...(typeof robotsOverride.index === 'boolean' && { index: robotsOverride.index }),
        ...(typeof robotsOverride.follow === 'boolean' && { follow: robotsOverride.follow }),
      },
      bingBot: {
        ...defaultRobots.bingBot,
        ...(robotsOverride.bingBot || {}),
        ...(typeof robotsOverride.index === 'boolean' && { index: robotsOverride.index }),
        ...(typeof robotsOverride.follow === 'boolean' && { follow: robotsOverride.follow }),
      }
    }
    : defaultRobots

  // Enhanced keywords with semantic variations
  const enhancedKeywords = [
    ...keywordArray,
    'PDF tools online',
    'free PDF editor',
    'client-side PDF processing',
    'privacy-first PDF tools',
    'secure PDF tools',
    'browser-based PDF tools',
    'no upload PDF tools',
    'Indian PDF tools',
    'fast PDF processing'
  ].filter(Boolean).join(', ')

  return {
    metadataBase: new URL(resolvedBase),
    // If title already has the suffix, use absolute title without template
    title: title.toLowerCase().includes('easy-pdf') ? baseTitle : {
      default: baseTitle,
      template: '%s | easy-pdf'
    },
    description: enhancedDescription,
    keywords: enhancedKeywords,
    authors: [{ name: author, url: String(resolvedBase) }],
    creator: author,
    publisher: SITE_NAME,
    applicationName: SITE_NAME,
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    category: "Business Tools",
    classification: "Document Processing",

    robots,

    alternates: {
      canonical,
      languages: {
        'en-IN': canonical,
        'en-US': canonical,
        'en': canonical,
        'x-default': canonical
      }
    },

    icons: {
      icon: [
        { url: '/favicon.ico', type: 'image/x-icon', sizes: '48x48' },
        { url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
        { url: '/icon-16.png', type: 'image/png', sizes: '16x16' },
        { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
      ],
      apple: '/apple-touch-icon.png',
      shortcut: '/favicon.ico',
    },

    openGraph: {
      title: baseTitle,
      description: enhancedDescription,
      url: canonical,
      siteName: "easy-pdf - Privacy-First PDF Tools",
      type: openGraphType,
      locale: "en-IN",
      alternateLocale: ["en-US", "en"],
      countryName: "India",
      images: [
        {
          url: ogImage || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${toolName || title} - Free PDF Tool | easy-pdf`,
          type: "image/jpeg",
        }
      ],
      ...(pageType === 'article' && {
        publishedTime: lastModified || new Date().toISOString(),
        modifiedTime: lastModified || new Date().toISOString(),
        section: 'PDF Tools',
        tags: keywordArray
      })
    },

    twitter: {
      card: "summary_large_image",
      title: baseTitle,
      description: enhancedDescription,
      site: "@_MR_WALI_",
      creator: "@_MR_WALI_",
      images: [
        {
          url: ogImage || "/twitter-image.jpg",
          alt: `${toolName || title} - Free PDF Tool | easy-pdf`,
          width: 1200,
          height: 630,
        }
      ],
    },

    appleWebApp: {
      capable: true,
      title: 'easy-pdf',
      statusBarStyle: 'black-translucent',
    },

    manifest: "/site.webmanifest",

    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || "google623ea46cb772f199",
      yandex: process.env.YANDEX_VERIFICATION,
      bing: process.env.BING_VERIFICATION,
      other: {
        'msvalidate.01': process.env.BING_VERIFICATION,
        'facebook-domain-verification': process.env.FACEBOOK_VERIFICATION,
      }
    },

    other: {
      'mobile-web-app-capable': 'yes',
      'theme-color': '#1f2937',
      'color-scheme': 'dark light',
      'format-detection': 'telephone=no',
      'HandheldFriendly': 'true',
      'MobileOptimized': '320',
      'application-name': 'easy-pdf',
      'msapplication-TileColor': '#1f2937',
      'msapplication-config': '/browserconfig.xml',
      'og:image:secure_url': ogImage || "/og-image.jpg",
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/jpeg',
    },

    // Additional metadata for better SEO
    bookmarks: canonical,
    ...(breadcrumbs.length > 0 && {
      breadcrumb: breadcrumbs.map(crumb => crumb.name).join(' > ')
    })
  };
};

// Generate comprehensive structured data
export const generateComprehensiveJsonLd = (pageType, pageData = {}) => {
  const baseUrl = resolveSiteUrl()
  const pageUrl = normalizeUrl(pageData.url || pageData.canonicalUrl || baseUrl, baseUrl)
  const pageTitle = cleanText(pageData.title || 'easy-pdf')
  const pageDescription = cleanText(pageData.description || 'Privacy-first PDF tools for secure document processing.')

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}#organization`,
    "name": "easy-pdf",
    "legalName": "easy-pdf - Privacy-First PDF Tools",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/icon.svg`,
      "width": 512,
      "height": 512
    },
    "description": "Privacy-first PDF tools for secure document processing. 100% client-side processing ensures your files never leave your device.",
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Wali Mohammad Kadri",
      "url": baseUrl
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["English", "Hindi"],
      "areaServed": "IN"
    },
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "knowsAbout": [
      "PDF processing",
      "Document conversion",
      "File security",
      "Privacy protection",
      "Client-side processing",
      "Browser-based tools",
      "Document management"
    ],
    "sameAs": [
      "https://github.com/waliullah9099",
      "https://twitter.com/_MR_WALI_"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}#website`,
    "name": "easy-pdf",
    "alternateName": "easy-pdf - Privacy-First PDF Tools",
    "url": baseUrl,
    "description": "100% client-side PDF tools for India. Merge, split, compress, convert, protect, and edit PDFs directly in your browser.",
    "inLanguage": "en-IN",
    "isAccessibleForFree": true,
    "audience": {
      "@type": "Audience",
      "audienceType": "Business professionals, Students, General users"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/tools?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "image": {
      "@type": "ImageObject",
      "url": `${baseUrl}/og/homepage`,
      "width": 1200,
      "height": 630,
      "caption": "easy-pdf - Privacy-first PDF tools"
    }
  }

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${baseUrl}#software`,
    "name": "easy-pdf",
    "description": "Privacy-first PDF processing tools that work entirely in your browser. No uploads, no data collection, complete privacy.",
    "url": baseUrl,
    "mainEntityOfPage": baseUrl,
    "inLanguage": DEFAULT_LANGUAGE,
    "datePublished": "2024-01-01",
    "dateModified": pageData.lastModified || new Date().toISOString(),
    "publisher": {
      "@id": `${baseUrl}#organization`
    },
    "provider": {
      "@id": `${baseUrl}#organization`
    },
    "applicationCategory": "UtilitiesApplication",
    "applicationSubCategory": "Document Processing",
    "operatingSystem": "Any",
    "browserRequirements": "Modern web browser with JavaScript enabled",
    "permissions": "No special permissions required",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": "2024-01-01"
    },
    "featureList": [
      "PDF Merge - Combine multiple PDFs",
      "PDF Split - Extract specific pages",
      "PDF Compress - Reduce file size",
      "PDF to JPG - Convert to images",
      "JPG to PDF - Convert images to PDF",
      "PDF Protection - Add password security",
      "PDF Unlock - Remove passwords",
      "PDF Watermark - Add custom watermarks",
      "PDF Form Filling - Complete forms",
      "PDF Signing - Add digital signatures",
      "OCR - Extract text from images",
      "Page Management - Organize pages"
    ],
    "screenshot": `${baseUrl}/og/homepage`,
  }

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": pageType === 'article' ? "Article" : pageType === 'website' ? "CollectionPage" : "WebPage",
    "@id": `${pageUrl}#webpage`,
    "name": pageTitle,
    "description": pageDescription,
    "url": pageUrl,
    "inLanguage": DEFAULT_LANGUAGE,
    "isAccessibleForFree": true,
    "isPartOf": {
      "@id": `${baseUrl}#website`
    },
    "about": {
      "@id": `${baseUrl}#software`
    },
    "publisher": {
      "@id": `${baseUrl}#organization`
    },
    ...(pageType === 'article' && {
      "headline": pageTitle,
      "datePublished": pageData.datePublished || "2024-01-01",
      "dateModified": pageData.lastModified || new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": pageData.author || "Wali Mohammad Kadri"
      }
    })
  }

  switch (pageType) {
    case 'homepage':
      return dedupeJsonLdSchemas([organizationSchema, websiteSchema, softwareApplicationSchema])

    case 'website':
      return dedupeJsonLdSchemas([organizationSchema, websiteSchema, webPageSchema])

    case 'tool':
      const toolSchema = {
        "@context": "https://schema.org",
        "@type": ["WebApplication", "SoftwareApplication"],
        "@id": `${pageUrl}#webapp`,
        "name": pageTitle,
        "description": pageDescription,
        "url": pageUrl,
        "mainEntityOfPage": pageUrl,
        "applicationCategory": "UtilitiesApplication",
        "applicationSubCategory": "Document Processing",
        "operatingSystem": "Web Browser",
        "inLanguage": DEFAULT_LANGUAGE,
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock"
        },
        "featureList": pageData.features || [],
        "browserRequirements": "Modern web browser with JavaScript enabled",
        "screenshot": pageData.image || `${baseUrl}/og/homepage`,
        "image": pageData.image || `${baseUrl}/og/homepage`,
        "keywords": Array.isArray(pageData.keywords) ? pageData.keywords.join(', ') : pageData.keywords,
        "isPartOf": {
          "@id": `${baseUrl}#software`
        },
        "provider": {
          "@id": `${baseUrl}#organization`
        },
        "publisher": {
          "@id": `${baseUrl}#organization`
        },
        "potentialAction": {
          "@type": "UseAction",
          "target": pageUrl,
          "name": `Use ${pageTitle}`
        }
      }

      const breadcrumbSchema = generateBreadcrumbListSchema(
        pageData.breadcrumbs || [
          { name: 'Home', url: baseUrl },
          { name: 'Tools', url: `${baseUrl}/tools` },
          { name: pageTitle, url: pageUrl },
        ],
        pageUrl
      );

      const toolFaqSchema = generateFAQPageSchema(pageData.faqs || [], pageUrl);

      const reviewSnippetSchema = generateReviewSnippetSchema({
        itemName: pageData.reviewSnippet?.itemName || pageTitle,
        itemType: 'SoftwareApplication',
        itemUrl: pageUrl,
        ratingValue: pageData.reviewSnippet?.ratingValue,
        ratingCount: pageData.reviewSnippet?.ratingCount,
        reviewCount: pageData.reviewSnippet?.reviewCount,
        bestRating: pageData.reviewSnippet?.bestRating,
        worstRating: pageData.reviewSnippet?.worstRating,
      });

      return dedupeJsonLdSchemas([organizationSchema, toolSchema, breadcrumbSchema, toolFaqSchema, reviewSnippetSchema])

    case 'faq':
      return dedupeJsonLdSchemas([organizationSchema, webPageSchema, generateFAQPageSchema(pageData.faqs || [], pageUrl)])

    case 'article':
      return dedupeJsonLdSchemas([organizationSchema, websiteSchema, webPageSchema])

    case 'about':
      const aboutSchema = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": `${baseUrl}/about#about-page`,
        "name": "About easy-pdf",
        "description": "Learn about easy-pdf's mission to provide privacy-first PDF tools with 100% client-side processing.",
        "url": `${baseUrl}/about`,
        "mainEntity": {
          "@type": "Organization",
          "@id": `${baseUrl}#organization`
        }
      }
      return dedupeJsonLdSchemas([organizationSchema, aboutSchema])

    default:
      return dedupeJsonLdSchemas([organizationSchema])
  }
}

// Generate performance hints for better Core Web Vitals
export const generatePerformanceHints = () => {
  return {
    preload: [
      // Removed problematic preloads that cause unused resource warnings
      // Icon will be loaded naturally when needed
    ],
    prefetch: [
      { href: "/pdf/merge", as: "document" },
      { href: "/pdf/split", as: "document" },
      { href: "/pdf/compress", as: "document" }
    ],
    preconnect: [
      { href: "https://fonts.googleapis.com" },
      { href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { href: "https://vercel.live" }
    ]
  }
}

// Generate FAQPage schema from FAQ array
export const generateFAQPageSchema = (faqs = [], pageUrl) => {
  if (!Array.isArray(faqs) || faqs.length === 0) return null

  const normalizedFaqs = uniqueBy(
    faqs
      .map((faq) => ({
        question: cleanText(faq?.question),
        answer: cleanText(faq?.answer),
      }))
      .filter((faq) => faq.question && faq.answer),
    (faq) => faq.question.toLowerCase()
  );

  if (normalizedFaqs.length === 0) return null

  const url = normalizeUrl(pageUrl || resolveSiteUrl())

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    "mainEntityOfPage": url,
    "mainEntity": normalizedFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

/**
 * Generate HowTo schema for tool pages
 * Helps search engines understand step-by-step processes
 * @param {Object} options - HowTo schema options
 * @param {string} options.name - Name of the how-to guide
 * @param {string} options.description - Description of what the guide teaches
 * @param {Array<{name: string, text: string, image?: string}>} options.steps - Array of step objects
 * @param {string} [options.totalTime] - ISO 8601 duration (e.g., 'PT5M' for 5 minutes)
 * @param {string} [options.tool] - Tool name required
 * @param {Array<{name: string}>} [options.supplies] - Materials needed
 * @param {string} [options.image] - Image URL for the guide
 * @returns {Object|null} - HowTo schema object or null if invalid
 */
export const generateHowToSchema = ({
  name,
  description,
  steps = [],
  totalTime,
  tool,
  supplies = [],
  image
} = {}) => {
  if (!name || !description || !Array.isArray(steps) || steps.length === 0) {
    return null
  }

  const baseUrl = resolveSiteUrl()

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && {
        "image": {
          "@type": "ImageObject",
          "url": step.image.startsWith('http') ? step.image : `${baseUrl}${step.image}`
        }
      })
    }))
  }

  // Add optional fields
  if (totalTime) {
    howToSchema.totalTime = totalTime
  }

  if (tool) {
    howToSchema.tool = {
      "@type": "HowToTool",
      "name": tool
    }
  }

  if (supplies.length > 0) {
    howToSchema.supply = supplies.map(supply => ({
      "@type": "HowToSupply",
      "name": supply.name
    }))
  }

  if (image) {
    howToSchema.image = {
      "@type": "ImageObject",
      "url": image.startsWith('http') ? image : `${baseUrl}${image}`
    }
  }

  return howToSchema
}

/**
 * Pre-defined HowTo schemas for common PDF tools
 * Can be used directly or customized per tool
 */
export const toolHowToSchemas = {
  merge: {
    name: "How to Merge PDF Files Online",
    description: "Learn how to combine multiple PDF documents into a single file using easy-pdf's free online merger tool.",
    totalTime: "PT2M",
    tool: "easy-pdf Merge Tool",
    steps: [
      { name: "Upload PDFs", text: "Click 'Select Files' or drag and drop your PDF files into the upload area." },
      { name: "Arrange Order", text: "Drag and drop the files to rearrange them in your desired order." },
      { name: "Merge Files", text: "Click the 'Merge PDFs' button to combine all files." },
      { name: "Download Result", text: "Once processing is complete, click 'Download' to save your merged PDF." }
    ]
  },
  split: {
    name: "How to Split a PDF File",
    description: "Step-by-step guide to extract pages or split a PDF into multiple files using easy-pdf's free splitter.",
    totalTime: "PT2M",
    tool: "easy-pdf Split Tool",
    steps: [
      { name: "Upload PDF", text: "Click 'Select File' or drag and drop your PDF into the upload area." },
      { name: "Select Pages", text: "Choose which pages to extract by clicking on page thumbnails or entering page ranges." },
      { name: "Split Document", text: "Click 'Split PDF' to extract the selected pages." },
      { name: "Download Files", text: "Download individual split files or all files as a ZIP archive." }
    ]
  },
  compress: {
    name: "How to Compress a PDF File",
    description: "Reduce PDF file size for easier sharing and storage using easy-pdf's free compression tool.",
    totalTime: "PT1M",
    tool: "easy-pdf Compress Tool",
    steps: [
      { name: "Upload PDF", text: "Click 'Select File' or drag and drop your PDF into the upload area." },
      { name: "Choose Quality", text: "Select your preferred compression level: Low, Medium, or High quality." },
      { name: "Compress File", text: "Click 'Compress PDF' to reduce the file size." },
      { name: "Download Result", text: "View the size reduction and download your compressed PDF." }
    ]
  },
  'jpg-to-pdf': {
    name: "How to Convert Images to PDF",
    description: "Convert JPG, PNG, and other images to PDF format using easy-pdf's free converter.",
    totalTime: "PT2M",
    tool: "easy-pdf Image to PDF Converter",
    steps: [
      { name: "Upload Images", text: "Click 'Select Images' or drag and drop your image files (JPG, PNG, etc.)." },
      { name: "Arrange Order", text: "Drag images to reorder them as they should appear in the PDF." },
      { name: "Adjust Settings", text: "Choose page size, orientation, and margins if needed." },
      { name: "Convert & Download", text: "Click 'Convert to PDF' and download your new PDF document." }
    ]
  },
  'pdf-to-jpg': {
    name: "How to Convert PDF to Images",
    description: "Extract pages from PDF as high-quality JPG images using easy-pdf's free converter.",
    totalTime: "PT2M",
    tool: "easy-pdf PDF to Image Converter",
    steps: [
      { name: "Upload PDF", text: "Click 'Select File' or drag and drop your PDF into the upload area." },
      { name: "Select Pages", text: "Choose which pages to convert or convert all pages." },
      { name: "Download Images", text: "Download individual images or all as a ZIP archive." }
    ]
  },
  protect: {
    name: "How to Password Protect a PDF",
    description: "Add password protection to your PDF files using easy-pdf's free security tool.",
    totalTime: "PT1M",
    tool: "easy-pdf Protect Tool",
    steps: [
      { name: "Upload PDF", text: "Click 'Select File' or drag and drop your PDF into the upload area." },
      { name: "Set Password", text: "Enter a strong password to protect your document." },
      { name: "Apply Protection", text: "Click 'Protect PDF' to encrypt your document." },
      { name: "Download Secured PDF", text: "Download your password-protected PDF file." }
    ]
  },
  ocr: {
    name: "How to Extract Text from PDF with OCR",
    description: "Use OCR technology to extract text from scanned PDFs and images using easy-pdf.",
    totalTime: "PT3M",
    tool: "easy-pdf OCR Tool",
    steps: [
      { name: "Upload Document", text: "Click 'Select File' or drag and drop your scanned PDF or image." },
      { name: "Select Language", text: "Choose the language of the text in your document for better accuracy." },
      { name: "Run OCR", text: "Click 'Extract Text' to start the OCR process." },
      { name: "Copy or Download", text: "Copy the extracted text or download it as a text file." }
    ]
  }
}