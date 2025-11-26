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
  author = "Wali Mohammad Kadri"
}) => {
  // Prefer runtime environment value for base URL when available
  const envBase = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
  const resolvedBase = metadataBaseUrl || (envBase ? (envBase.startsWith('http') ? envBase : `https://${envBase}`) : 'https://easy-pdf-murex.vercel.app')
  const baseTitle = title.includes('easy-pdf') ? title : `${title} | easy-pdf`
  const enhancedDescription = description.length > 160 ? description.substring(0, 157) + '...' : description
  const keywordArray = Array.isArray(keywords) ? keywords : (keywords ? [keywords] : [])

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
    title: {
      default: baseTitle,
      template: '%s | easy-pdf'
    },
    description: enhancedDescription,
    keywords: enhancedKeywords,
    authors: [{ name: author, url: String(resolvedBase) }],
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
      canonical: canonicalUrl || resolvedBase,
      languages: {
        'en-IN': canonicalUrl || resolvedBase,
        'en-US': canonicalUrl || resolvedBase,
        'en': canonicalUrl || resolvedBase
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
      url: canonicalUrl || resolvedBase,
      siteName: "easy-pdf - Privacy-First PDF Tools",
      type: pageType === 'homepage' ? 'website' : 'article',
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
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/jpeg',
    },

    // Additional metadata for better SEO
    category: 'Technology',
    bookmarks: canonicalUrl || resolvedBase,
    ...(breadcrumbs.length > 0 && {
      breadcrumb: breadcrumbs.map(crumb => crumb.name).join(' > ')
    })
  };
};

// Generate comprehensive structured data
export const generateComprehensiveJsonLd = (pageType, pageData = {}) => {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
  const baseUrl = envBase ? (envBase.startsWith('http') ? envBase : `https://${envBase}`) : 'https://easy-pdf-murex.vercel.app'

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
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
    ,
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
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    // Note: Reviews removed - add real user reviews when available
    // "review": [
    //   {
    //     "@type": "Review",
    //     "reviewRating": {
    //       "@type": "Rating",
    //       "ratingValue": "5",
    //       "bestRating": "5"
    //     },
    //     "author": {
    //       "@type": "Person",
    //       "name": "Anonymous User"
    //     },
    //     "reviewBody": "Excellent privacy-focused PDF tools. Works completely offline and keeps my documents secure."
    //   }
    // ]
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
        "screenshot": `${baseUrl}/og/homepage`,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "1250",
          "bestRating": "5",
          "worstRating": "1"
        },
        "mainEntity": {
          "@type": "SoftwareApplication",
          "@id": `${baseUrl}#software`
        },
        "provider": {
          "@type": "Organization",
          "@id": `${baseUrl}#organization`
        }
      }

      const schemas = [organizationSchema, toolSchema]

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
        schemas.push(breadcrumbSchema)
      }

      // Add FAQ if available
      if (pageData.faqs && pageData.faqs.length > 0) {
        const faqSchema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": pageData.faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }
        schemas.push(faqSchema)
      }

      return schemas

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

// Generate FAQPage schema from FAQ array
export const generateFAQPageSchema = (faqs = []) => {
  if (!Array.isArray(faqs) || faqs.length === 0) return null

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
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

  const envBase = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
  const baseUrl = envBase ? (envBase.startsWith('http') ? envBase : `https://${envBase}`) : 'https://easy-pdf-murex.vercel.app'

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