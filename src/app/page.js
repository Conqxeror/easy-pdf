//src\app\page.js

"use client";

import Link from "next/link";
import React, { Suspense, useState, useEffect  } from "react";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { Lock, Cloud, Code, ArrowRight } from "lucide-react";
import ToolCard from "@/components/ui/ToolCard";
import { toolsData } from "@/lib/toolData";
import SponsorSection from "@/components/ui/SponsorSection";
import UsageIndicator from "@/components/ui/UsageIndicator";
import { trackEvent } from "@/lib/analytics";
import { useUserPreferences } from "@/lib/userPreferences";
import FileHistoryPanel from "@/components/ui/FileHistoryPanel";
import { Button } from "@/components/ui/button";
import { 
  PageContainer, 
  Hero, 
  Section, 
  FeatureGrid, 
  Grid, 
  CTASection 
} from "@/components/ui/Layout";

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

  // Premium functionality removed

  // Get recent and favorite tools
  const recentTools = preferences.recentTools || [];
  const favoriteTools = preferences.favoriteTools || [];
  
  // Show recent tools if available, otherwise show all tools
  const displayTools = recentTools.length > 0 
    ? toolsData.filter(tool => recentTools.includes(tool.href.replace('/', '')))
    : toolsData;

  // Features data for the grid
  const features = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: "100% Client-Side",
      description: "Your files never leave your device. All processing happens in your browser."
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "India-Optimized",
      description: "Works great on slower connections. Small bundle size for quick loading."
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Open Source",
      description: "Transparent codebase. No hidden tracking or data collection."
    }
  ];

  // Premium features removed

  return (
    <PageContainer>
      {/* User Status Bar */}
      <div className="container-standard pt-6">
        <div className="flex items-center justify-end">
          <UsageIndicator compact />
        </div>
      </div>

      {/* Hero Section */}
      <Hero
        title="Privacy-First PDF Tools"
        subtitle="All processing happens in your browser. No file uploads, no privacy risks. Fast, free, and made for Indian users."
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link href="/merge" onClick={handleGetStartedClick}>
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            size="lg"
            className="px-8 border-2 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Link href="#tools" onClick={handleExploreToolsClick}>
              Explore All Tools
            </Link>
          </Button>
          
          {/* Premium button removed */}
          
          {showInstallButton && (
            <Button
              onClick={handleInstallClick}
              variant="success"
              size="lg"
              className="px-8 bg-green-600 hover:bg-green-700 text-white"
            >
              Install App
            </Button>
          )}
        </div>
      </Hero>

      {/* Features Section */}
      <Section>
        <FeatureGrid features={features} />
      </Section>

      {/* Recent/Favorite Tools Section */}
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

      {/* Tools Grid Section */}
      <Section 
        id="tools"
        title="All PDF Tools"
        subtitle="Complete suite of PDF tools for all your document needs"
      >
        <Suspense fallback={<Skeleton className="h-96" />}>
          <Grid cols="auto" gap="6">
            {toolsData.map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
            ))}
          </Grid>
        </Suspense>
      </Section>

      {/* Premium features section removed */}

      {/* Sponsors Section */}
      <Section spacing="small">
        <SponsorSection />
      </Section>

      {/* CTA Section */}
      <CTASection
        title="Ready to transform your PDF workflow?"
        subtitle="Join thousands of users who trust our privacy-focused PDF tools."
        primaryAction={
          <Button
            asChild
            variant="gradient"
            size="lg"
            className="px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white"
          >
            <Link href="/merge" onClick={handleGetStartedClick}>
              Get Started Now
            </Link>
          </Button>
        }
      />
    </PageContainer>
  );
}