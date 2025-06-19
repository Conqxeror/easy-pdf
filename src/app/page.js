import Link from "next/link";
import {
  FileText,
  Merge,
  Split,
  Minimize2,
  RotateCw,
  Stamp,
  Lock,
  Unlock,
  Image,
  Text,
  ListOrdered,
  Eraser,
  PencilRuler,
  PlusCircle,
  Signature,
  FileBadge2,
} from "lucide-react";
import { Suspense } from "react";
import {Skeleton} from "@/components/ui/skeleton.jsx";

export const metadata = {
  title:
    "easy-pdf - Free Online PDF Tools for India | Merge, Split, Compress PDFs",
  description:
    "100% client-side PDF tools for India. Merge, split, compress, convert, protect, and edit PDFs directly in your browser. No file uploads, complete privacy.",
  keywords: [
    "PDF tools India",
    "merge PDF online",
    "split PDF free",
    "compress PDF",
    "JPG to PDF converter",
    "PDF to JPG",
    "PDF editor online",
    "privacy-focused PDF tools",
    "client-side PDF processing",
  ],
  openGraph: {
    title: "easy-pdf - Free Online PDF Tools for India",
    description:
      "100% client-side PDF tools. Merge, split, compress, convert, protect, and edit PDFs directly in your browser.",
    url: "https://easy-pdf.com",
    type: "website",
    images: [
      {
        url: "https://easy-pdf.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "easy-pdf - Free Online PDF Tools",
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "easy-pdf - Free Online PDF Tools for India",
    description:
      "100% client-side PDF tools. Merge, split, compress, convert, protect, and edit PDFs directly in your browser.",
    creator: "@easy_pdf",
    images: ["https://easy-pdf.com/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://easy-pdf.com",
    languages: {
      "en-US": "/en-US",
      "hi-IN": "/hi-IN",
    },
  },
};

const tools = [
  {
    href: "/merge",
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document",
    icon: <Merge className="w-8 h-8 text-blue-500" />,
    comingSoon: false,
  },
  {
    href: "/split",
    title: "Split PDF",
    description: "Extract specific pages or split by ranges",
    icon: <Split className="w-8 h-8 text-green-500" />,
    comingSoon: false,
  },
  {
    href: "/compress",
    title: "Compress PDF",
    description: "Reduce PDF file size while preserving quality",
    icon: <Minimize2 className="w-8 h-8 text-purple-500" />,
    comingSoon: false,
  },
  {
    href: "/rotate",
    title: "Rotate PDF",
    description: "Rotate pages to correct orientation",
    icon: <RotateCw className="w-8 h-8 text-yellow-500" />,
    comingSoon: false,
  },
  {
    href: "/watermark",
    title: "Watermark PDF",
    description: "Add text or image watermarks",
    icon: <Stamp className="w-8 h-8 text-red-500" />,
    comingSoon: false,
  },
  {
    href: "/protect",
    title: "Protect PDF",
    description: "Add password protection to PDFs",
    icon: <Lock className="w-8 h-8 text-gray-500" />,
    comingSoon: false,
  },
  {
    href: "/unlock",
    title: "Unlock PDF",
    description: "Remove password from PDF files",
    icon: <Unlock className="w-8 h-8 text-orange-500" />,
    comingSoon: false,
  },
  {
    href: "/jpg-to-pdf",
    title: "JPG to PDF",
    description: "Convert images to PDF documents",
    icon: <Image className="w-8 h-8 text-pink-500" />,
    comingSoon: false,
  },
  {
    href: "/pdf-to-jpg",
    title: "PDF to JPG",
    description: "Convert PDF pages to JPG images",
    icon: <FileText className="w-8 h-8 text-teal-500" />,
    comingSoon: false,
  },
  {
    href: "/reorder",
    title: "Reorder PDF",
    description: "Rearrange PDF pages",
    icon: <ListOrdered className="w-8 h-8 text-cyan-500" />,
    comingSoon: true,
  },
  {
    href: "/delete-pages",
    title: "Delete Pages",
    description: "Remove unwanted pages from PDF",
    icon: <Eraser className="w-8 h-8 text-indigo-500" />,
    comingSoon: true,
  },
  {
    href: "/add-text",
    title: "Add Text",
    description: "Insert text into PDF documents",
    icon: <Text className="w-8 h-8 text-lime-500" />,
    comingSoon: true,
  },
  {
    href: "/add-page-numbers",
    title: "Page Numbers",
    description: "Add page numbers to PDF",
    icon: <PlusCircle className="w-8 h-8 text-amber-500" />,
    comingSoon: true,
  },
  {
    href: "/sign-pdf",
    title: "Sign PDF",
    description: "Add digital signatures",
    icon: <Signature className="w-8 h-8 text-rose-500" />,
    comingSoon: true,
  },
  {
    href: "/pdf-info",
    title: "PDF Info",
    description: "View and edit PDF metadata",
    icon: <FileBadge2 className="w-8 h-8 text-sky-500" />,
    comingSoon: true,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <section className="text-center mb-16 max-w-4xl animate-fade-in">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
          <span className="bg-gradient-to-r from-blue-400 to-teal-500 bg-clip-text text-transparent">
            Privacy-First
          </span>{" "}
          PDF Tools for India
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-8">
          All processing happens in your browser. No file uploads, no privacy
          risks. Fast, free, and made for Indian users.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/merge"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Get started with Merge PDF"
          >
            Get Started Now
            <svg
              className="ml-2 -mr-1 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <Link
            href="#tools"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-blue-400 bg-blue-900/50 hover:bg-blue-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="View all PDF tools"
          >
            Explore All Tools
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-blue-500 transition-all">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900/50 mb-4">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">100% Client-Side</h3>
            <p className="text-gray-400">
              Your files never leave your device. All processing happens in your
              browser.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-blue-500 transition-all">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900/50 mb-4">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">India-Optimized</h3>
            <p className="text-gray-400">
              Works great on slower connections. Small bundle size for quick
              loading.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-blue-500 transition-all">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900/50 mb-4">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Open Source</h3>
            <p className="text-gray-400">
              Transparent codebase. No hidden tracking or data collection.
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section id="tools" className="w-full max-w-6xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">
          <span className="bg-gradient-to-r from-blue-400 to-teal-500 bg-clip-text text-transparent">
            All PDF Tools
          </span>
        </h2>
        <Suspense fallback={<Skeleton />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.comingSoon ? "#" : tool.href}
                className={`group block p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-300 border border-gray-700 hover:border-blue-500 ${
                  tool.comingSoon ? "opacity-70" : ""
                }`}
                aria-disabled={tool.comingSoon}
                tabIndex={tool.comingSoon ? -1 : 0}
              >
                <div className="flex items-center justify-center mb-4">
                  {tool.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-50 group-hover:text-blue-400 mb-2 text-center">
                  {tool.title}
                  {tool.comingSoon && (
                    <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </h3>
                <p className="text-gray-400 text-sm text-center">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </Suspense>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-4xl mt-16 mb-8 text-center">
        <div className="bg-gradient-to-r from-blue-900/50 to-teal-900/50 p-8 rounded-xl border border-gray-700">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to transform your PDF workflow?
          </h2>
          <p className="text-gray-300 mb-6">
            Join thousands of users who trust our privacy-focused PDF tools.
          </p>
          <Link
            href="/merge"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Get started with Merge PDF"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
