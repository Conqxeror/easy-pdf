"use client";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Menu, X, ArrowUp, PenTool } from "lucide-react";
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
  // Service worker registration logic can be added here in the future
  // For now, it's intentionally disabled
}

import clsx from "clsx";
import Footer from "@/components/ui/Footer";
import { ThemeToggleSimple } from "@/components/ui/theme-toggle";

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

// Display font for the branding. We use a heavy weight and add a small skew
// to emulate the italic/stylized look from the provided image.
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
  variable: '--font-orbitron'
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
          ? "bg-white/80 dark:bg-black backdrop-blur-xl border-gray-200/50 dark:border-gray-800/50 shadow-lg"
          : "bg-white/60 dark:bg-black backdrop-blur-md border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all duration-200 hover:scale-105"
              onClick={closeAllMenus}
            >
              <div className="bg-black/70 dark:bg-black px-0.5 py-0.5 shadow-md rounded-sm flex items-center justify-center">
                <PenTool className="h-5 w-5 text-white" />
              </div>
              <span className={`${orbitron.className} text-lg font-extrabold text-gray-900 dark:text-white leading-none -skew-x-6`}>
                easy-pdf
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-2">
            <DesktopNav closeAllMenus={closeAllMenus} />
            
            {/* Theme Toggle - Desktop */}
            <div className="hidden md:block">
              <ThemeToggleSimple />
            </div>
          </div>

          {/* Mobile menu button and theme toggle */}
          <div className="md:hidden flex items-center gap-2">
            {/* Theme Toggle - Mobile */}
            <ThemeToggleSimple />
            
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-600 transition-all duration-200"
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
      const scrollButton = document.getElementById('scroll-to-top-btn');
      if (scrollButton) {
        if (window.scrollY > 100) { // Adjust this threshold as needed
          scrollButton.classList.remove('opacity-0', 'pointer-events-none');
          scrollButton.classList.add('opacity-100');
        } else {
          scrollButton.classList.remove('opacity-100');
          scrollButton.classList.add('opacity-0', 'pointer-events-none');
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
  <div className={`${inter.className} min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100`}>
        {/* Skip Navigation Link - First focusable element for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gray-950 focus:text-white focus:shadow-lg"
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>
        {/* Scroll to Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          id="scroll-to-top-btn"
          className="fixed bottom-6 right-6 bg-gray-950 dark:bg-gray-950 text-white w-14 h-14 flex items-center justify-center z-50 shadow-lg transition-all duration-300 opacity-0 pointer-events-none hover:bg-gray-950 dark:hover:bg-black/60 hover:scale-105"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
        <Navbar />
        <main id="main-content" className="min-h-screen pt-20 bg-white dark:bg-black" aria-label="Main content">
          {children}
        </main>
  {/* ...existing code... */}
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