//src\app\page.js

import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { Lock, Cloud, Code, ArrowRight } from "lucide-react";
import ToolCard from "@/components/ui/ToolCard";
import { toolsData } from "@/lib/toolData";

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
    url: "https://easy-pdf-murex.vercel.app",
    type: "website",
    images: [
      {
        url: "https://easy-pdf-murex.vercel.app/og-image.jpg",
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
    images: ["https://easy-pdf-murex.vercel.app/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://easy-pdf-murex.vercel.app",
    languages: {
      "en": "/en",
      "hi": "/hi",
    },
  },
};

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <section className="text-center mb-16 max-w-4xl animate-fade-in">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
          <span className="bg-gradient-to-r from-blue-400 to-teal-500 bg-clip-text text-transparent">
            Privacy-First
          </span>{" "}
          PDF Tools
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
            <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
          </Link>
          <Link
            href="#tools"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-blue-400 bg-blue-900/50 hover:bg-blue-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Explore all PDF tools"
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
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">100% Client-Side</h3>
            <p className="text-gray-400">
              Your files never leave your device. All processing happens in your
              browser.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-blue-500 transition-all">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900/50 mb-4">
              <Cloud className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">India-Optimized</h3>
            <p className="text-gray-400">
              Works great on slower connections. Small bundle size for quick
              loading.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-blue-500 transition-all">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900/50 mb-4">
              <Code className="w-6 h-6 text-blue-400" />
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
            {toolsData.map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
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