// Server component layout for /form-filler route to provide SEO metadata
export const metadata = {
  title: "PDF Form Filler Online – Easy PDF Tool",
  description:
    "Fill PDF forms and add text instantly. 100% client-side, privacy-first, fast, and secure PDF form filler. No uploads required.",
  keywords: [
    "PDF form filler",
    "Fill PDF forms",
    "Add text PDF",
    "PDF editor",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF form",
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
    canonical: "https://easy-pdf-murex.vercel.app/form-filler",
  },
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "PDF Form Filler Online – Easy PDF Tool",
    description:
      "Fill PDF forms and add text instantly. 100% client-side, privacy-first, fast, and secure PDF form filler. No uploads required.",
    url: "https://easy-pdf-murex.vercel.app/form-filler",
    siteName: "easy-pdf",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PDF Form Filler Online – Easy PDF Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Form Filler Online – Easy PDF Tool",
    description:
      "Fill PDF forms and add text instantly. 100% client-side, privacy-first, fast, and secure PDF form filler. No uploads required.",
    site: "_MR_WALI_",
    creator: "_MR_WALI_",
    images: ["/og-image.jpg"],
  },
  manifest: "/site.webmanifest",
};

export default function FormFillerLayout({ children }) {
  return children;
}
