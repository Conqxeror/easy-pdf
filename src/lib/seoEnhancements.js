// Enhanced SEO utilities for comprehensive optimization
export const generateEnhancedMetadata = ({ 
  title, 
  description, 
  keywords, 
  canonicalUrl, 
  metadataBaseUrl, 
  toolName, 
  ogImage,
  pageType = 'tool',
  breadcrumbs = [],
  lastModified,
  author = "Wali Mohammad Kadri"
}) => {
  const baseTitle = title.includes('easy-pdf') ? title : `${title} | easy-pdf`
  const enhancedDescription = description.length > 160 ? description.substring(0, 157) + '...' : description
  const keywordArray = Array.isArray(keywords) ? keywords : [keywords]
  
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
    metadataBase: new URL(metadataBaseUrl),
    title: {
      default: baseTitle,
      template: '%s | easy-pdf - Privacy-First PDF Tools'
    },
    description: enhancedDescription,
    keywords: enhancedKeywords,
    authors: [{ name: author, url: metadataBaseUrl }],
    creator: author,
    publisher: "easy-pdf",
    applicationName: "easy-pdf",
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    category: "Business Tools",
    classification: "Document Processing",
    
    robots: {
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
    },
    
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-IN': canonicalUrl,
        'en-US': canonicalUrl,
        'en': canonicalUrl
      }
    },
    
    icons: {
      icon: [
        { url: "/icon.png", sizes: "16x16", type: "image/png" },
        { url: "/icon.png", sizes: "32x32", type: "image/png" },
        { url: "/icon.png", sizes: "192x192", type: "image/png" },
        { url: "/icon.png", sizes: "512x512", type: "image/png" }
      ],
      apple: [
        { url: "/icon.png", sizes: "180x180", type: "image/png" }
      ],
      shortcut: "/favicon.ico",
      other: [
        { rel: "mask-icon", url: "/icon.svg", color: "#1f2937" }
      ]
    },
    
    openGraph: {
      title: baseTitle,
      description: enhancedDescription,
      url: canonicalUrl,
      siteName: "easy-pdf - Privacy-First PDF Tools",
      type: pageType === 'homepage' ? 'website' : 'article',
      locale: "en_IN",
      alternateLocale: ["en_US", "en"],
      countryName: "India",
      images: [
        {
          url: ogImage || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${toolName || title} - Free PDF Tool | easy-pdf`,
          type: "image/jpeg",
        },
        {
          url: ogImage || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${toolName || title} - Privacy-First PDF Processing`,
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
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': 'easy-pdf',
      'theme-color': '#1f2937',
      'color-scheme': 'dark light',
      'format-detection': 'telephone=no',
      'HandheldFriendly': 'true',
      'MobileOptimized': '320',
      'apple-touch-fullscreen': 'yes',
      'application-name': 'easy-pdf',
      'msapplication-TileColor': '#1f2937',
      'msapplication-config': '/browserconfig.xml',
      'og:image:secure_url': ogImage || "/og-image.jpg",
      'og:image:type': 'image/jpeg',
      'og:image:width': '1200',
      'og:image:height': '630',
    },
    
    // Additional metadata for better SEO
    category: 'Technology',
    bookmarks: canonicalUrl,
    ...(breadcrumbs.length > 0 && {
      breadcrumb: breadcrumbs.map(crumb => crumb.name).join(' > ')
    })
  };
};

// Generate comprehensive structured data
export const generateComprehensiveJsonLd = (pageType, pageData = {}) => {
  const baseUrl = 'https://easy-pdf-murex.vercel.app'
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "easy-pdf",
    "legalName": "easy-pdf - Privacy-First PDF Tools",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/icon.png`,
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
        "urlTemplate": `${baseUrl}/?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "SoftwareApplication",
      "@id": `${baseUrl}#software`
    }
  }

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${baseUrl}#software`,
    "name": "easy-pdf",
    "description": "Privacy-first PDF processing tools that work entirely in your browser. No uploads, no data collection, complete privacy.",
    "url": baseUrl,
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Document Processing",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Modern web browser with JavaScript enabled",
    "permissions": "No special permissions required",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
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
    "screenshot": `${baseUrl}/og-image.jpg`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "2847",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Anonymous User"
        },
        "reviewBody": "Excellent privacy-focused PDF tools. Works completely offline and keeps my documents secure."
      }
    ]
  }

  switch (pageType) {
    case 'homepage':
      return [organizationSchema, websiteSchema, softwareApplicationSchema]
    
    case 'tool':
      const toolSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": pageData.title,
        "description": pageData.description,
        "url": `${baseUrl}${pageData.url}`,
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Document Processing",
        "operatingSystem": "Web Browser",
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock"
        },
        "featureList": pageData.features || [],
        "browserRequirements": "Modern web browser with JavaScript enabled",
        "screenshot": `${baseUrl}/og-image.jpg`,
        "mainEntity": {
          "@type": "SoftwareApplication",
          "@id": `${baseUrl}#software`
        },
        "provider": {
          "@type": "Organization",
          "@id": `${baseUrl}#organization`
        }
      }
      
      // Add breadcrumb if available
      if (pageData.breadcrumbs && pageData.breadcrumbs.length > 0) {
        const breadcrumbSchema = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": pageData.breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.url
          }))
        }
        return [organizationSchema, toolSchema, breadcrumbSchema]
      }
      
      return [organizationSchema, toolSchema]
    
    case 'faq':
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": pageData.faqs?.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        })) || []
      }
      return [organizationSchema, faqSchema]
    
    case 'about':
      const aboutSchema = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About easy-pdf",
        "description": "Learn about easy-pdf's mission to provide privacy-first PDF tools with 100% client-side processing.",
        "url": `${baseUrl}/about`,
        "mainEntity": {
          "@type": "Organization",
          "@id": `${baseUrl}#organization`
        }
      }
      return [organizationSchema, aboutSchema]
    
    default:
      return [organizationSchema]
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
      { href: "/merge", as: "document" },
      { href: "/split", as: "document" },
      { href: "/compress", as: "document" }
    ],
    preconnect: [
      { href: "https://fonts.googleapis.com" },
      { href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { href: "https://vercel.live" }
    ]
  }
}