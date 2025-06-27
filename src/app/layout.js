"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import Footer from "@/components/ui/Footer";

import VercelAnalytics from "./vercel-analytics";
import DesktopNav from "@/components/layout/DesktopNav";
import MobileNav from "@/components/layout/MobileNav";

const inter = Inter({ subsets: ["latin"] });

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeAllMenus = () => {
    setIsOpen(false);
  };

  return (
    <nav
      className={clsx(
        "fixed w-full z-50 transition-all duration-300 border-b h-16",
        scrolled
          ? "bg-gray-900/95 backdrop-blur-md border-gray-800"
          : "bg-gray-900/80 backdrop-blur-sm border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              onClick={closeAllMenus}
            >
              <Image
                src="/icon.png"
                alt="easy-pdf Logo"
                className="h-8 w-8"
                width={32}
                height={32}
              />
              <span className="text-xl font-bold text-white hidden sm:block">
                easy-pdf
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <DesktopNav closeAllMenus={closeAllMenus} />

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileNav isOpen={isOpen} closeAllMenus={closeAllMenus} />
    </nav>
  );
}

export const metadata = {
  title: "easy-pdf - Free Online PDF Tools",
  description:
    "100% client-side PDF tools for India. Merge, split, compress, convert, protect, and edit PDFs directly in your browser.",
  keywords: "PDF, Merge PDF, Split PDF, Compress PDF, JPG to PDF, PDF to JPG, Free PDF Tools, India",
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
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        <Navbar />
        <main className="min-h-screen pt-16" aria-label="Main content">
          {children}
        </main>
        <Footer />
        <VercelAnalytics />
      </body>
    </html>
  );
}