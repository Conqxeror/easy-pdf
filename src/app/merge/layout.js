// Server component layout for /merge route to provide SEO metadata
export const metadata = {
  title: "Merge PDF Files Online – Easy PDF Tool",
  description: "Merge multiple PDF files into one, 100% client-side, privacy-first. Fast, free, and secure PDF merger for everyone.",
  keywords: [
    "Merge PDF", "Combine PDF", "PDF merger", "Join PDF", "PDF tools", "Client-side PDF", "Privacy PDF tool", "No upload PDF merger", "Wali Mohammad Kadri"
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
    canonical: "https://easy-pdf-murex.vercel.app/merge"
  },
  icons: {
    icon: "/icon.png"
  },
  openGraph: {
    title: "Merge PDF Files Online – Easy PDF Tool",
    description: "Merge multiple PDF files into one, 100% client-side, privacy-first. Fast, free, and secure PDF merger for everyone.",
    url: "https://easy-pdf-murex.vercel.app/merge",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Merge PDF Files Online – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Merge PDF Files Online – Easy PDF Tool",
    description: "Merge multiple PDF files into one, 100% client-side, privacy-first. Fast, free, and secure PDF merger for everyone.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: [
      "/og-image.jpg"
    ]
  },
  manifest: "/site.webmanifest"
};

export default function MergeLayout({ children }) {
  return children;
}
