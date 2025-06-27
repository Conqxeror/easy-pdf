export const generateMetadata = ({ title, description, keywords, canonicalUrl }) => {
  return {
    title,
    description,
    keywords,
    authors: [{ name: "Wali Mohammad Kadri" }],
    applicationName: "easy-pdf",
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    
    creator: "Wali Mohammad Kadri",
    publisher: "Wali Mohammad Kadri",
    category: "DocumentEditor",
    robots: "index,follow",
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: "/icon.png",
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "easy-pdf",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "_MR_WALI_",
      creator: "_MR_WALI_",
      images: ["/og-image.jpg"],
    },
    manifest: "/site.webmanifest",
  };
};
