import Head from "next/head";

/**
 * Enhanced SEO/Meta component with comprehensive metadata support
 * Supports all major SEO tags, Open Graph, Twitter Cards, and JSON-LD
 */
export default function MetaHead({
  title = "easy-pdf – Blazing-fast, Privacy-first PDF Toolkit",
  description = "100% client-side PDF tools: merge, split, compress, convert, protect, and more. Open-source, privacy-first, India-optimized.",
  url = "https://easy-pdf-murex.vercel.app",
  ogImage = "/og-image.png",
  jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "easy-pdf",
    description:
      "Client-side PDF tools for merging, splitting, compressing and converting PDF files",
    url: "https://easy-pdf-murex.vercel.app",
    applicationCategory: "DocumentEditor",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
  keywords = "PDF, Merge PDF, Split PDF, Compress PDF, JPG to PDF, PDF to JPG, Free PDF Tools, India",
  locale = "en_IN",
  twitterHandle = "@easy_pdf",
  noIndex = false,
  canonicalUrl = "",
}) {
  const fullUrl = url.startsWith("http")
    ? url
    : `https://easy-pdf-murex.vercel.app${url}`;
  const fullOgImage = ogImage.startsWith("http")
    ? ogImage
    : `https://easy-pdf-murex.vercel.app${ogImage}`;
  const canonical = canonicalUrl || fullUrl;

  // Enhanced JSON-LD with tool-specific data
  const defaultJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "easy-pdf",
    description: description,
    url: fullUrl,
    applicationCategory: "DocumentEditor",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
  const mergedJsonLd = jsonLd ? { ...defaultJsonLd, ...jsonLd } : defaultJsonLd;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta
        name="robots"
        content={noIndex ? "noindex,nofollow" : "index,follow"}
      />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="easy-pdf" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Favicons */}
      <link rel="icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mergedJsonLd) }}
      />

      {/* PWA Tags */}
      <meta name="application-name" content="easy-pdf" />
      <meta name="apple-mobile-web-app-title" content="easy-pdf" />
      <meta name="theme-color" content="#1e40af" />
      <meta name="msapplication-TileColor" content="#1e40af" />
    </Head>
  );
}
