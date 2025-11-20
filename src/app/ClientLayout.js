"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { ArrowUp } from "lucide-react";
import React, { useEffect } from "react";
import { initializePerformanceOptimizations } from "@/lib/webVitals";
import UserPreferencesProvider from "@/lib/userPreferences";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MenuProvider } from "@/contexts/MenuContext";
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

import Footer from "@/components/ui/Footer";
import Navbar from "@/components/layout/Navbar";

// VercelAnalytics is a small client-side wrapper; load it dynamically to avoid server-side bundling
import dynamic from "next/dynamic";
const VercelAnalytics = dynamic(() => import('./vercel-analytics'), { ssr: false });

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

// Display font for the branding. We use a heavy weight and add a small skew
// to emulate the italic/stylized look from the provided image.
export default function ClientLayout({ children }) {
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
      <MenuProvider>
        <UserPreferencesProvider>
          <div className={`${inter.className} min-h-screen bg-background dark:bg-background text-foreground dark:text-foreground`}>
          {/* Skip Navigation Link - First focusable element for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:shadow-lg"
            aria-label="Skip to main content"
          >
            Skip to main content
          </a>
          {/* Scroll to Top Button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            id="scroll-to-top-btn"
            className="fixed bottom-6 right-6 bg-background dark:bg-background text-foreground w-14 h-14 flex items-center justify-center z-50 shadow-lg transition-all duration-300 opacity-0 pointer-events-none hover:bg-background dark:hover:bg-background/60 hover:scale-105"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-6 w-6" />
          </button>
          <Navbar />
          <main id="main-content" className="min-h-screen pt-20 bg-background dark:bg-background" aria-label="Main content">
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
      </MenuProvider>
    </ThemeProvider>
  );
}