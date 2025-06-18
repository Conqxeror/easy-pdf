import Head from "next/head";

/**
 * Dynamic SEO/Meta component for all pages.
 * Usage: <MetaHead title="..." description="..." url="..." ogImage="..." jsonLd={...} />
 */
export default function MetaHead({
  title = "PDF Toolkit – Blazing-fast, Privacy-first iLovePDF Alternative",
  description = "100% client-side PDF tools: merge, split, compress, convert, protect, and more. Open-source, privacy-first, India-optimized.",
  url = "https://yourdomain.com",
  ogImage = "/public/og-image.png",
  jsonLd = null,
  keywords = "PDF, Merge PDF, Split PDF, Compress PDF, JPG to PDF, PDF to JPG, Free, India, iLovePDF alternative",
  locale = "en_IN",
  twitterHandle = "@yourhandle",
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={locale} />
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content={twitterHandle} />
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
}
