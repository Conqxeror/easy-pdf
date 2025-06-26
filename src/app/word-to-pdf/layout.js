export const metadata = {
    title: "Word to PDF Converter – Easy PDF Tool",
    description:
      "Convert Word documents to PDF instantly, 100% client-side. Fast, secure, privacy-first Word to PDF converter. No uploads required.",
    keywords: [
      "Word to PDF",
      "Convert Word",
      "DOCX to PDF",
      "PDF converter",
      "Client-side PDF",
      "Privacy PDF tool",
      "No upload Word to PDF",
      "Wali Mohammad Kadri",
    ],
    authors: [{ name: "Wali Mohammad Kadri" }],
    applicationName: "easy-pdf",
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    colorScheme: "dark",
    creator: "Wali Mohammad Kadri",
    publisher: "Wali Mohammad Kadri",
    category: "DocumentEditor",
    robots: "index,follow",
    alternates: {
      canonical: "https://easy-pdf-murex.vercel.app/word-to-pdf",
    },
    icons: {
      icon: "/icon.png",
    },
    openGraph: {
      title: "Word to PDF Converter – Easy PDF Tool",
      description:
        "Convert Word documents to PDF instantly, 100% client-side. Fast, secure, privacy-first Word to PDF converter. No uploads required.",
      url: "https://easy-pdf-murex.vercel.app/word-to-pdf",
      siteName: "easy-pdf",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Word to PDF Converter – Easy PDF Tool",
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Word to PDF Converter – Easy PDF Tool",
      description:
        "Convert Word documents to PDF instantly, 100% client-side. Fast, secure, privacy-first Word to PDF converter. No uploads required.",
      site: "_MR_WALI_",
      creator: "_MR_WALI_",
      images: ["/og-image.jpg"],
    },
    manifest: "/site.webmanifest",
  };
  
  export default function WordToPdfLayout({ children }) {
    return children;
  }
  