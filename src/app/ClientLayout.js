"use client";
import "./globals.css";
import { ArrowUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { initializePerformanceOptimizations } from "@/lib/webVitals";
import UserPreferencesProvider from "@/lib/userPreferences";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MenuProvider } from "@/contexts/MenuContext";
import { Toaster } from "sonner";
import clsx from "clsx";
import { PreloadResources } from "@/components/PreloadResources";

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

// Font is now loaded server-side in layout.js for optimal LCP
export default function ClientLayout({ children }) {
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);

  useEffect(() => {
    registerServiceWorker();
    initializePerformanceOptimizations();

    import('@/lib/analytics').then((_analytics) => {
      // Analytics automatically initializes
    });
  }, []);

  useEffect(() => {
    let timeoutId = null;
    const handleScroll = () => {
      if (timeoutId) {
        window.cancelAnimationFrame(timeoutId);
      }
      timeoutId = window.requestAnimationFrame(() => {
        setIsScrollButtonVisible(window.scrollY > 100);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        window.cancelAnimationFrame(timeoutId);
      }
    };
  }, []);

  return (
    <ThemeProvider>
      <PreloadResources />
      <MenuProvider>
        <UserPreferencesProvider>
          <div className="font-sans min-h-screen bg-background dark:bg-background text-foreground dark:text-foreground">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:shadow-lg"
              aria-label="Skip to main content"
            >
              Skip to main content
            </a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Scroll to top"
              className={clsx(
                "fixed bottom-6 right-6 bg-background dark:bg-background text-foreground w-14 h-14 flex items-center justify-center z-50 shadow-lg transition-opacity duration-300 hover:bg-background dark:hover:bg-background/60 hover:scale-105",
                {
                  'opacity-100': isScrollButtonVisible,
                  'opacity-0 pointer-events-none': !isScrollButtonVisible,
                }
              )}
            >
              <ArrowUp className="h-6 w-6" />
            </button>
            <Navbar />
            <main id="main-content" className="min-h-screen pt-20 bg-background dark:bg-background" aria-label="Main content">
              {children}
            </main>
            <Footer />
            <VercelAnalytics />
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: 'bg-popover text-popover-foreground border-border',
              }}
            />
          </div>
        </UserPreferencesProvider>
      </MenuProvider>
    </ThemeProvider>
  );
}