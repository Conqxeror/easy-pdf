import ClientLayout from "./ClientLayout";

export const metadata = {
  metadataBase: new URL("https://easy-pdf-murex.vercel.app"),
  title: "easy-pdf - Free Online PDF Tools",
  description:
    "100% client-side PDF tools for India. Merge, split, compress, convert, protect, and edit PDFs directly in your browser.",
  keywords: "PDF, Merge PDF, Split PDF, Compress PDF, JPG to PDF, PDF to JPG, Free PDF Tools, India",
  authors: [{ name: "Wali Mohammad Kadri" }],
  applicationName: "easy-pdf",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  
  creator: "Wali Mohammad Kadri",
  publisher: "Wali Mohammad Kadri",
  category: "DocumentEditor",
  robots: "index,follow",
  alternates: {
    canonical: "https://easy-pdf-murex.vercel.app",
    languages: {
      "en-US": "https://easy-pdf-murex.vercel.app",
      "hi-IN": "https://easy-pdf-murex.vercel.app/hi",
      "mr-IN": "https://easy-pdf-murex.vercel.app/mr",
    },
  },
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "easy-pdf - Free Online PDF Tools",
    description:
      "100% client-side PDF tools for India. Merge, split, compress, convert, protect, and edit PDFs directly in your browser.",
    url: "https://easy-pdf-murex.vercel.app",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "easy-pdf - Free Online PDF Tools",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "easy-pdf - Free Online PDF Tools",
    description:
      "100% client-side PDF tools for India. Merge, split, compress, convert, protect, and edit PDFs directly in your browser.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: ["/og-image.jpg"],
  },
  manifest: "/site.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "easy-pdf",
  description:
    "100% client-side PDF tools for India. Merge, split, compress, convert, protect, and edit PDFs directly in your browser.",
  url: "https://easy-pdf-murex.vercel.app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}