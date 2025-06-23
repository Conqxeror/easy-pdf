// Server component layout for /organize route to provide SEO metadata
export const metadata = {
  title: "Organize PDF Pages Online – Easy PDF Tool",
  description:
    "Organize, reorder, and manage your PDF pages instantly. 100% client-side, privacy-first, fast, and secure PDF organizer. No uploads required.",
  keywords: [
    "Organize PDF",
    "PDF organizer",
    "Reorder PDF",
    "PDF editor",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF organize",
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
    canonical: "https://easy-pdf-murex.vercel.app/organize",
  },
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Organize PDF Pages Online – Easy PDF Tool",
    description:
      "Organize, reorder, and manage your PDF pages instantly. 100% client-side, privacy-first, fast, and secure PDF organizer. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/organize",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Organize PDF Pages Online – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Organize PDF Pages Online – Easy PDF Tool",
    description:
      "Organize, reorder, and manage your PDF pages instantly. 100% client-side, privacy-first, fast, and secure PDF organizer. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: ["/og-image.jpg"],
  },
  manifest: "/site.webmanifest",
};

export default function OrganizeLayout({ children }) {
  return children;
}
