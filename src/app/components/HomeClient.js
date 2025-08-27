"use client";

import Link from "next/link";
import React, { Suspense, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { Lock, Cloud, Code, ArrowRight, Zap, Globe, Heart } from "lucide-react";
import dynamic from 'next/dynamic';
import { toolsData } from "@/lib/toolData";
import SponsorSection from "@/components/ui/SponsorSection";
import UsageIndicator from "@/components/ui/UsageIndicator";
import { trackEvent } from "@/lib/analytics";
import { useUserPreferences } from "@/lib/userPreferences";
import FileHistoryPanel from "@/components/ui/FileHistoryPanel";
import { Button } from "@/components/ui/button";
import { SkipToMain, AccessibleHeading, usePerformanceMonitoring } from "@/components/ui/AccessibilityEnhancements";
import { useWebVitals } from "@/hooks/useWebVitals";
import { 
  PageContainer, 
  Hero, 
  Section, 
  FeatureGrid, 
  Grid, 
  CTASection 
} from "@/components/ui/Layout";
import CategorizedToolsSection from "@/components/ui/CategorizedToolsSection";

export default function HomeClient() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const { preferences } = useUserPreferences();
  
  usePerformanceMonitoring();
  useWebVitals();

  // Lazy load ToolCard component
  const ToolCard = dynamic(() => import('@/components/ui/ToolCard'), {
    loading: () => <Skeleton className="h-48" />,
    ssr: false
  });

  useEffect(() => {
    trackEvent('homepage_viewed', {
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`
    });

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setShowInstallButton(true);
      if (process.env.NODE_ENV === 'development') {
        console.log('PWA install prompt captured and ready');
      }
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

  const recentTools = preferences.recentTools || [];
  const favoriteTools = preferences.favoriteTools || [];
  
  const displayTools = recentTools.length > 0 
    ? toolsData.filter(tool => recentTools.includes(tool.href.replace('/', '')))
    : toolsData;

  const features = [
    {
      icon: <Lock className="w-6 h-6" aria-hidden="true" />,
      title: "100% Client-Side",
      description: "Your files never leave your device. All processing happens in your browser."
    },
    {
      icon: <Cloud className="w-6 h-6" aria-hidden="true" />,
      title: "India-Optimized",
      description: "Works great on slower connections. Small bundle size for quick loading."
    },
    {
      icon: <Code className="w-6 h-6" aria-hidden="true" />,
      title: "Open Source",
      description: "Transparent codebase. No hidden tracking or data collection."
    }
  ];

  const stats = [
    { icon: <Zap className="w-5 h-5" />, value: "100%", label: "Free to Use" },
    { icon: <Globe className="w-5 h-5" />, value: "50+", label: "PDF Tools" },
    { icon: <Heart className="w-5 h-5" />, value: "10K+", label: "Happy Users" },
  ];

  return (
    <>
      <SkipToMain />

      {/* SoftwareApplication structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "easy-pdf",
          "operatingSystem": "All",
          "applicationCategory": "Productivity",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1200"
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }) }}
      />

      {/* FAQ structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Are my PDF files safe and private?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. All processing happens 100% client-side in your browser. Your files never leave your device."
              }
            },
            {
              "@type": "Question",
              "name": "Do I need to create an account to use easy-pdf?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No account or registration is required. All tools are free and available instantly."
              }
            },
            {
              "@type": "Question",
              "name": "What PDF tools are available?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can merge, split, compress, convert, protect, and edit PDFs, plus many more features."
              }
            },
            {
              "@type": "Question",
              "name": "Is easy-pdf free to use?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, all PDF tools are completely free to use."
              }
            },
            {
              "@type": "Question",
              "name": "Does easy-pdf work on mobile devices?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, easy-pdf is optimized for both desktop and mobile browsers."
              }
            }
          ]
        }) }}
      />

      <main id="main-content">
        <PageContainer>
          <div className="container-standard pt-6">
            <div className="flex items-center justify-end">
              <UsageIndicator compact />
            </div>
          </div>

          <Hero
            title="Privacy-First PDF Tools"
            subtitle="All processing happens in your browser. No file uploads, no privacy risks. Fast, free, and made for Indian users."
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="px-8 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                aria-describedby="get-started-description"
              >
                <Link href="/merge" onClick={handleGetStartedClick}>
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </Link>
              </Button>
              <div id="get-started-description" className="sr-only">
                Start using our PDF tools by merging documents
              </div>
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-8 border-2 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link href="#tools" onClick={handleExploreToolsClick}>
                  Explore All Tools
                </Link>
              </Button>
              
              {showInstallButton && (
                <Button
                  onClick={handleInstallClick}
                  variant="success"
                  size="lg"
                  className="px-8 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  aria-label="Install easy-pdf as a Progressive Web App"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Install App
                </Button>
              )}
            </div>
          </Hero>

          {/* Stats Section */}
          <Section spacing="small" className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 text-center border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="flex justify-center mb-3 text-blue-400">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section>
            <AccessibleHeading level={2} className="text-3xl text-center mb-8 text-white">
              Why Choose easy-pdf?
            </AccessibleHeading>
            <FeatureGrid features={features} />
          </Section>

          {(recentTools.length > 0 || favoriteTools.length > 0) && (
            <Section 
              title={recentTools.length > 0 ? 'Recently Used Tools' : 'Your Favorite Tools'}
              spacing="small"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Grid cols={3} gap="6">
                    {displayTools.slice(0, 6).map((tool) => (
                      <ToolCard key={tool.href} tool={tool} />
                    ))}
                  </Grid>
                </div>
                <div className="lg:col-span-1">
                  <FileHistoryPanel className="h-fit" />
                </div>
              </div>
            </Section>
          )}

          {/* All Tools Section - Categorized */}
          <Suspense fallback={<Skeleton className="h-96" />}>
            <CategorizedToolsSection />
          </Suspense>

          <Section spacing="small">
            <SponsorSection />
          </Section>

          <CTASection
            title="Ready to transform your PDF workflow?"
            subtitle="Join thousands of users who trust our privacy-focused PDF tools."
            primaryAction={
              <Button
                asChild
                variant="gradient"
                size="lg"
                className="px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link href="/merge" onClick={handleGetStartedClick}>
                  Get Started Now
                </Link>
              </Button>
            }
          />
        </PageContainer>
      </main>
    </>
  );
}
