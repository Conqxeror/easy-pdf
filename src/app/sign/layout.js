// Server component layout for /sign route to provide SEO metadata
export const metadata = {
  title: "Sign PDF Online – Easy PDF Tool",
  description:
    "Sign and annotate PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF signing tool. No uploads required.",
  keywords: [
    "Sign PDF",
    "Annotate PDF",
    "PDF signature",
    "PDF signing tool",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF sign",
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
    canonical: "https://easy-pdf-murex.vercel.app/sign",
  },
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Sign PDF Online – Easy PDF Tool",
    description:
      "Sign and annotate PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF signing tool. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/sign",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sign PDF Online – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF Online – Easy PDF Tool",
    description:
      "Sign and annotate PDF files instantly. 100% client-side, privacy-first, fast, and secure PDF signing tool. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: ["/og-image.jpg"],
  },
  manifest: "/site.webmanifest",
};

export default function SignLayout({ children }) {
  return children;
}
