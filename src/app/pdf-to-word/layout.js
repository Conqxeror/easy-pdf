export const metadata = {
    title: "PDF to Word Converter – Easy PDF Tool",
    description:
      "Convert PDF documents to Word instantly, 100% client-side. Fast, secure, privacy-first PDF to Word converter. No uploads required.",
    keywords: [
      "PDF to Word",
      "Convert PDF",
      "PDF to DOCX",
      "PDF converter",
      "Client-side PDF",
      "Privacy PDF tool",
      "No upload PDF to Word",
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
      canonical: "https://easy-pdf-murex.vercel.app/pdf-to-word",
    },
    icons: {
      icon: "/icon.png",
    },
    openGraph: {
      title: "PDF to Word Converter – Easy PDF Tool",
      description:
        "Convert PDF documents to Word instantly, 100% client-side. Fast, secure, privacy-first PDF to Word converter. No uploads required.",
      url: "https://easy-pdf-murex.vercel.app/pdf-to-word",
      siteName: "easy-pdf",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "PDF to Word Converter – Easy PDF Tool",
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "PDF to Word Converter – Easy PDF Tool",
      description:
        "Convert PDF documents to Word instantly, 100% client-side. Fast, secure, privacy-first PDF to Word converter. No uploads required.",
      site: "_MR_WALI_",
      creator: "_MR_WALI_",
      images: ["/og-image.jpg"],
    },
    manifest: "/site.webmanifest",
  };
  
  export default function PdfToWordLayout({ children }) {
    return children;
  }
  