"use client"; // This directive marks the file as a client component

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // Import icons for menu toggle
import { useState } from "react"; // For managing mobile menu state

const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: {
//     default: "PDF Toolkit - Client-Side PDF Tools",
//     template: "%s | PDF Toolkit",
//   },
//   description:
//     "Blazing-fast, 100% client-side, and privacy-first PDF tools. Merge, split, compress, convert, and edit PDFs directly in your browser.",
//   keywords: [
//     "PDF tools",
//     "merge PDF",
//     "split PDF",
//     "compress PDF",
//     "JPG to PDF",
//     "PDF to JPG",
//     "online PDF editor",
//     "free PDF tools",
//     "client-side PDF",
//     "privacy-first",
//     "India",
//   ],
//   authors: [{ name: "Your Name/Organization" }], // Customize this
//   creator: "Your Name/Organization", // Customize this
//   publisher: "Your Name/Organization", // Customize this
//   metadataBase: new URL("https://yourpdftoolkit.com"), // Replace with your domain
//   alternates: {
//     canonical: "/",
//     languages: {
//       "en-US": "/en-US",
//       "hi-IN": "/hi-IN", // Example for Hindi, can add more
//     },
//   },
//   openGraph: {
//     title: "PDF Toolkit - Blazing-Fast, Client-Side PDF Tools",
//     description:
//       "Blazing-fast, 100% client-side, and privacy-first PDF tools. Merge, split, compress, convert, and edit PDFs directly in your browser.",
//     url: "https://yourpdftoolkit.com", // Replace with your domain
//     siteName: "PDF Toolkit",
//     images: [
//       {
//         url: "https://yourpdftoolkit.com/og-image.jpg", // Replace with your actual OG image
//         width: 1200,
//         height: 630,
//         alt: "PDF Toolkit",
//       },
//     ],
//     locale: "en_US",
//     type: "website",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "PDF Toolkit - Client-Side PDF Tools",
//     description: "Blazing-fast, 100% client-side, and privacy-first PDF tools.",
//     creator: "@yourtwitterhandle", // Customize this
//     images: ["https://yourpdftoolkit.com/twitter-image.jpg"], // Replace with your actual Twitter image
//   },
//   robots: {
//     index: true,
//     follow: true,
//     nocache: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       noimageindex: true,
//       "max-video-preview": -1,
//       "max-snippet": -1,
//     },
//   },
//   icons: {
//     icon: "/favicon.ico",
//     shortcut: "/favicon-16x16.png",
//     apple: "/apple-touch-icon.png",
//   },
//   manifest: "/site.webmanifest",
// };

// Define the Navbar as a client component to handle state
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Function to toggle the mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-800 text-gray-100 p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/App Name */}
        <Link
          href="/"
          className="text-2xl font-bold text-white hover:text-blue-400 transition-colors duration-300 flex"
        >
          <img
            src="/icon.png"
            alt="Logo"
            style={{ width: "10%", height: "auto", paddingRight: "5px", borderRadius: "50px" }}
          />
          PDF Toolkit
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link
            href="/merge"
            className="hover:text-blue-400 transition-colors duration-300"
          >
            Merge
          </Link>
          <Link
            href="/split"
            className="hover:text-blue-400 transition-colors duration-300"
          >
            Split
          </Link>
          <Link
            href="/compress"
            className="hover:text-blue-400 transition-colors duration-300"
          >
            Compress
          </Link>
          <Link
            href="/jpg-to-pdf"
            className="hover:text-blue-400 transition-colors duration-300"
          >
            JPG to PDF
          </Link>
          <Link
            href="/pdf-to-jpg"
            className="hover:text-blue-400 transition-colors duration-300"
          >
            PDF to JPG
          </Link>
          {/* Add more key links as needed */}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md p-1"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-4 bg-gray-800 p-4 rounded-b-lg shadow-inner animate-slide-down">
          <Link
            href="/merge"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Merge PDF
          </Link>
          <Link
            href="/split"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Split PDF
          </Link>
          <Link
            href="/compress"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Compress PDF
          </Link>
          <Link
            href="/rotate"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Rotate PDF
          </Link>
          <Link
            href="/watermark"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Watermark PDF
          </Link>
          <Link
            href="/protect"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Protect PDF
          </Link>
          <Link
            href="/unlock"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Unlock PDF
          </Link>
          <Link
            href="/jpg-to-pdf"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            JPG to PDF
          </Link>
          <Link
            href="/pdf-to-jpg"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            PDF to JPG
          </Link>
          <Link
            href="/reorder"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Reorder PDF Pages
          </Link>
          <Link
            href="/delete-pages"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Delete PDF Pages
          </Link>
          <Link
            href="/add-text"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Add Text to PDF
          </Link>
          <Link
            href="/add-page-numbers"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Add Page Numbers
          </Link>
          <Link
            href="/sign-pdf"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            Sign PDF
          </Link>
          <Link
            href="/pdf-info"
            className="block px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-300"
            onClick={toggleMenu}
          >
            PDF Info
          </Link>
          {/* Add more mobile navigation links for all tools */}
        </div>
      )}
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
