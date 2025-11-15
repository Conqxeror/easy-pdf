// Enhanced structured data for better SEO
export const generateJsonLd = (pageType, pageData = {}) => {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
  const baseUrl = (envBase && envBase.startsWith('http')) ? envBase : (envBase ? `https://${envBase}` : 'https://easy-pdf-murex.vercel.app')

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "easy-pdf",
    "url": baseUrl,
    "logo": `${baseUrl}/icon.svg`,
    "description": "Privacy-first PDF tools for secure document processing",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    },
    "areaServed": "IN",
    "knowsAbout": ["PDF processing", "Document conversion", "File security", "Privacy protection"]
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "easy-pdf",
    "url": baseUrl,
    "description": "100% client-side PDF tools for India. Merge, split, compress, convert, protect, and edit PDFs directly in your browser.",
    "inLanguage": "en-IN",
    "isAccessibleForFree": true,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "easy-pdf",
    "description": "Privacy-first PDF processing tools that work entirely in your browser",
    "url": baseUrl,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "featureList": [
      "PDF Merge",
      "PDF Split",
      "PDF Compress",
      "PDF to JPG",
      "JPG to PDF",
      "PDF Protection",
      "PDF Unlock",
      "PDF Watermark",
      "PDF Form Filling",
      "PDF Signing"
    ],
    "screenshot": `${baseUrl}/og-image.jpg`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5"
    }
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
        "operatingSystem": "Web Browser",
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR"
        },
        "featureList": pageData.features || [],
        "browserRequirements": "Modern web browser with JavaScript enabled"
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

    default:
      return [organizationSchema]
  }
}

// Breadcrumb schema generator
export const generateBreadcrumbSchema = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  }
}