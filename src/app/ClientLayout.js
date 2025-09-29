"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowUp } from "lucide-react";
import React, { useState, useEffect  } from "react";
import { initializePerformanceOptimizations } from "@/lib/webVitals";
import UserPreferencesProvider from "@/lib/userPreferences";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "sonner";

// Temporarily disable service worker registration
function registerServiceWorker() {
  // Service worker registration disabled for development
  if (process.env.NODE_ENV === 'development') {
    return;
  }
  console.log("Service worker registration disabled");
}

import clsx from "clsx";
import Footer from "@/components/ui/Footer";

// VercelAnalytics is a small client-side wrapper; load it dynamically to avoid server-side bundling
import dynamic from "next/dynamic";
const VercelAnalytics = dynamic(() => import('./vercel-analytics'), { ssr: false });
import DesktopNav from "@/components/layout/DesktopNav";
import MobileNav from "@/components/layout/MobileNav";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    // Use passive listener for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
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
          ? "bg-gray-900/95 backdrop-blur-md border-gray-800 shadow-lg"
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
              <div className="bg-blue-600 rounded-lg p-1">
                <Image
                  src="/icon.png"
                  alt="easy-pdf Logo"
                  className="h-6 w-6"
                  width={24}
                  height={24}
                  priority
                  sizes="24px"
                />
              </div>
              <span className="text-xl font-bold text-white">
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
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
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

export default function RootLayout({ children }) {
  useEffect(() => {
    registerServiceWorker();
    initializePerformanceOptimizations();
    
    // Initialize analytics on client side
    import('@/lib/analytics').then((_analytics) => {
      // Analytics automatically initializes
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const skipButton = document.getElementById('skip-to-content-btn');
      if (skipButton) {
        if (window.scrollY > 100) { // Adjust this threshold as needed
          skipButton.classList.remove('opacity-0', 'pointer-events-none');
          skipButton.classList.add('opacity-100');
        } else {
          skipButton.classList.remove('opacity-100');
          skipButton.classList.add('opacity-0', 'pointer-events-none');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check in case page is loaded with scroll
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ThemeProvider>
      <UserPreferencesProvider>
        <div className={`${inter.className} min-h-screen bg-gray-900 text-gray-100 dark`}>
        {/* Skip Navigation Link */}
        <a
          href="#main-content"
          id="skip-to-content-btn"
          className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center z-50 shadow-lg transition-all duration-300 opacity-0 pointer-events-none hover:bg-blue-700 hover:scale-105"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </a>
        <Navbar />
        <main id="main-content" className="min-h-screen pt-20" aria-label="Main content">
          {children}
        </main>
        <Footer />
        <VercelAnalytics />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              border: '1px solid #374151',
              color: '#f3f4f6',
            },
          }}
        />
        </div>
      </UserPreferencesProvider>
    </ThemeProvider>
  );
}