// Server component layout for /rotate route to provide SEO metadata
export const metadata = {
  title: "Rotate PDF Pages Online – Easy PDF Tool",
  description:
    "Rotate PDF pages instantly and securely, 100% client-side. Fast, privacy-first PDF rotation tool. No uploads required.",
  keywords: [
    "Rotate PDF",
    "PDF rotation",
    "Rotate pages",
    "PDF tools",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF rotate",
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
    canonical: "https://easy-pdf-murex.vercel.app/rotate",
  },
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Rotate PDF Pages Online – Easy PDF Tool",
    description:
      "Rotate PDF pages instantly and securely, 100% client-side. Fast, privacy-first PDF rotation tool. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/rotate",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rotate PDF Pages Online – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotate PDF Pages Online – Easy PDF Tool",
    description:
      "Rotate PDF pages instantly and securely, 100% client-side. Fast, privacy-first PDF rotation tool. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: ["/og-image.jpg"],
  },
  manifest: "/site.webmanifest",
};

export default function RotateLayout({ children }) {
  return children;
}
