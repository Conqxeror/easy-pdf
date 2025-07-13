//src\app\page.js

"use client";

import Link from "next/link";
import React, { Suspense, useState, useEffect  } from "react";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { Lock, Cloud, Code, ArrowRight, Star, Zap } from "lucide-react";
import ToolCard from "@/components/ui/ToolCard";
import { toolsData } from "@/lib/toolData";
import SponsorSection from "@/components/ui/SponsorSection";
import PremiumBadge from "@/components/ui/PremiumBadge";
import UsageIndicator from "@/components/ui/UsageIndicator";
import { trackEvent } from "@/lib/analytics";
import { useUserPreferences } from "@/lib/userPreferences";
import FileHistoryPanel from "@/components/ui/FileHistoryPanel";

export default function Home() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const { preferences } = useUserPreferences();

  useEffect(() => {
    // Track homepage view
    trackEvent('homepage_viewed', {
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`
    });

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    
    trackEvent('pwa_install_clicked');
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    trackEvent('pwa_install_result', { outcome });
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA installation prompt');
    } else {
      console.log('User dismissed the PWA installation prompt');
    }
    setInstallPrompt(null);
    setShowInstallButton(false);
  };

  const handleGetStartedClick = () => {
    trackEvent('get_started_clicked', { source: 'hero_section' });
  };

  const handleExploreToolsClick = () => {
    trackEvent('explore_tools_clicked', { source: 'hero_section' });
  };

  const handlePremiumClick = () => {
    trackEvent('premium_cta_clicked', { source: 'homepage' });
  };

  // Get recent and favorite tools
  const recentTools = preferences.recentTools || [];
  const favoriteTools = preferences.favoriteTools || [];
  
  // Show recent tools if available, otherwise show all tools
  const displayTools = recentTools.length > 0 
    ? toolsData.filter(tool => recentTools.includes(tool.href.replace('/', '')))
    : toolsData;

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] pb-8 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-100">
      {/* User Status Bar */}
      <div className="w-full max-w-6xl mb-4">
        <div className="flex items-center justify-between">
          <PremiumBadge showDetails />
          <UsageIndicator compact />
        </div>
      </div>

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
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/merge"
            onClick={handleGetStartedClick}
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Get started with Merge PDF"
          >
            Get Started Now
            <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
          </Link>
          <Link
            href="#tools"
            onClick={handleExploreToolsClick}
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-blue-400 bg-blue-900/50 hover:bg-blue-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Explore all PDF tools"
          >
            Explore All Tools
          </Link>
          <Link
            href="/pricing"
            onClick={handlePremiumClick}
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="View premium features"
          >
            <Star className="w-4 h-4 mr-2" />
            Go Premium
          </Link>
          {showInstallButton && (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Install App"
            >
              Install App
            </button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
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

      {/* Recent/Favorite Tools Section */}
      {(recentTools.length > 0 || favoriteTools.length > 0) && (
        <section className="w-full max-w-6xl mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">
                {recentTools.length > 0 ? 'Recently Used Tools' : 'Your Favorite Tools'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {displayTools.slice(0, 6).map((tool) => (
                  <ToolCard key={tool.href} tool={tool} />
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <FileHistoryPanel className="h-fit" />
            </div>
          </div>
        </section>
      )}

      {/* Tools Grid Section */}
      <section id="tools" className="w-full max-w-6xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">
          <span className="bg-gradient-to-r from-blue-400 to-teal-500 bg-clip-text text-transparent">
            All PDF Tools
          </span>
        </h2>
        <Suspense fallback={<Skeleton />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {toolsData.map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
            ))}
          </div>
        </Suspense>
      </section>

      {/* Premium Features Showcase */}
      <section className="w-full max-w-6xl mt-16 mb-16">
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-8 rounded-xl border border-purple-700/50">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Unlock Premium Features
              </span>
            </h2>
            <p className="text-gray-300 text-lg">
              Get advanced AI analysis, unlimited processing, and priority support
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 mb-4 mx-auto">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">AI Document Analysis</h3>
              <p className="text-gray-400 text-sm">Advanced legal, medical, and financial document insights</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 mb-4 mx-auto">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Batch Processing</h3>
              <p className="text-gray-400 text-sm">Process up to 50 files simultaneously</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 mb-4 mx-auto">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Priority Support</h3>
              <p className="text-gray-400 text-sm">Get help when you need it most</p>
            </div>
          </div>
          
          <div className="text-center">
            <Link
              href="/pricing"
              onClick={handlePremiumClick}
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Star className="w-4 h-4 mr-2" />
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <SponsorSection />

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
            onClick={handleGetStartedClick}
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
