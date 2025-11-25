"use client";

import Link from "next/link";
import React, { Suspense, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { Lock, Cloud, Code, ArrowRight, Zap, Globe, Heart, Shield, CheckCircle, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { toolsData } from "@/lib/toolData";
import SponsorSection from "@/components/ui/SponsorSection";
import UsageIndicator from "@/components/ui/UsageIndicator";
import { trackEvent } from "@/lib/analytics";
import { useUserPreferences } from "@/lib/userPreferences";
import FileHistoryPanel from "@/components/ui/FileHistoryPanel";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AccessibleHeading,
  usePerformanceMonitoring,
} from "@/components/ui/AccessibilityEnhancements";
import { useWebVitals } from "@/hooks/useWebVitals";
import {
  PageContainer,
  Section,
  Grid,
  CTASection,
} from "@/components/ui/Layout";
import CategorizedToolsSection from "@/components/ui/CategorizedToolsSection";

export default function HomeClient() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const { preferences } = useUserPreferences();

  usePerformanceMonitoring();
  useWebVitals();

  // ToolCard can be SSR'd since it's a presentational component without client-side state
  const ToolCard = dynamic(() => import("@/components/ui/ToolCard"), {
    loading: () => <Skeleton className="h-48" />,
    ssr: true,
  });

  useEffect(() => {
    trackEvent("homepage_viewed", {
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
    });

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setShowInstallButton(true);
      if (process.env.NODE_ENV === "development") {
        console.log("PWA install prompt captured and ready");
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    // Proceed with install prompt flow
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    trackEvent("pwa_install_result", { outcome });

    if (outcome === "accepted") {
      console.log("User accepted the PWA installation prompt");
    } else {
      console.log("User dismissed the PWA installation prompt");
    }
    setInstallPrompt(null);
    setShowInstallButton(false);
  };

  const handleGetStartedClick = () => {
    trackEvent("get_started_clicked", { source: "hero_section" });
  };

  const handleExploreToolsClick = () => {
    trackEvent("explore_tools_clicked", { source: "hero_section" });
  };

  const recentTools = preferences.recentTools || [];
  const favoriteTools = preferences.favoriteTools || [];

  const displayTools =
    recentTools.length > 0
      ? toolsData.filter((tool) =>
        recentTools.includes(tool.href.replace("/", "")),
      )
      : toolsData;

  const features = [
    {
      icon: <Lock className="w-6 h-6" aria-hidden="true" />,
      title: "100% Client-Side",
      description:
        "Your files never leave your device. All processing happens in your browser.",
    },
    {
      icon: <Cloud className="w-6 h-6" aria-hidden="true" />,
      title: "India-Optimized",
      description:
        "Works great on slower connections. Small bundle size for quick loading.",
    },
    {
      icon: <Code className="w-6 h-6" aria-hidden="true" />,
      title: "Open Source",
      description:
        "Transparent codebase. No hidden tracking or data collection.",
    },
  ];

  const stats = [
    { icon: <Zap className="w-5 h-5" />, value: "100%", label: "Free to Use" },
    { icon: <Globe className="w-5 h-5" />, value: "50+", label: "PDF Tools" },
    {
      icon: <Heart className="w-5 h-5" />,
      value: "10K+",
      label: "Happy Users",
    },
  ];

  return (
    <>
      {/* SoftwareApplication structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "easy-pdf",
            operatingSystem: "All",
            applicationCategory: "Productivity",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "1200",
            },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />

      {/* FAQ structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Are my PDF files safe and private?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. All processing happens 100% client-side in your browser. Your files never leave your device.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need to create an account to use easy-pdf?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No account or registration is required. All tools are free and available instantly.",
                },
              },
              {
                "@type": "Question",
                name: "What PDF tools are available?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You can merge, split, compress, convert, protect, and edit PDFs, plus many more features.",
                },
              },
              {
                "@type": "Question",
                name: "Is easy-pdf free to use?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, all PDF tools are completely free to use.",
                },
              },
              {
                "@type": "Question",
                name: "Does easy-pdf work on mobile devices?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, easy-pdf is optimized for both desktop and mobile browsers.",
                },
              },
            ],
          }),
        }}
      />

      <main id="main-content">
        <PageContainer>
          <div className="container-standard pt-6">
            <div className="flex items-center justify-end">
              <UsageIndicator compact />
            </div>
          </div>

          {/* Hero Section with Glassmorphism */}
          <div className="relative overflow-hidden py-10 px-6 mb-10 sm:py-16">
            {/* Solid Background */}
            <div className="absolute inset-0 bg-background -z-10" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04] -z-10" />

            <div className="container-standard px-6 py-8 max-w-7xl mx-auto">
              <div className="text-center max-w-4xl mx-auto mb-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                <Badge variant="outline" className="mb-4 gap-1 border-primary/20 text-primary-foreground bg-primary/5">
                  <Shield className="w-3 h-3" />
                  100% Privacy-First
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight">
                  Privacy-First PDF Tools
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  All processing happens in your browser. No file uploads, no privacy risks.
                  Fast, free, and made for everyone.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    variant="premium"
                    size="lg"
                    aria-describedby="get-started-description"
                    asChild
                  >
                    <Link href="/merge" onClick={handleGetStartedClick}>
                      <span className="inline-flex items-center">
                        Get Started Now
                        <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                      </span>
                    </Link>
                  </Button>
                  <div id="get-started-description" className="sr-only">
                    Start using our PDF tools by merging documents
                  </div>

                  <Button asChild variant="outline" size="lg">
                    <Link href="#tools" onClick={handleExploreToolsClick}>
                      Explore All Tools
                    </Link>
                  </Button>

                  {showInstallButton && (
                    <Button
                      onClick={handleInstallClick}
                      variant="success"
                      size="lg"
                      aria-label="Install easy-pdf as a Progressive Web App"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        ></path>
                      </svg>
                      Install App
                    </Button>
                  )}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-4 animate-in fade-in-0 slide-in-from-bottom-5 duration-700 delay-200">
                <Badge variant="outline" className="gap-1.5" aria-label="No sign up required">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  No Sign-up Required
                </Badge>
                <Badge variant="outline" className="gap-1.5" aria-label="Completely free forever">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  100% Free Forever
                </Badge>
                <Badge variant="outline" className="gap-1.5" aria-label="No file storage">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Zero File Storage
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Section with Glass Cards */}
          <Section spacing="small" className="py-6 px-6 bg-secondary/50">
            <div className="container-standard max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                {stats.map((stat, index) => (
                  <Card
                    key={index}
                    variant="glass"
                    className="group text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 bg-card border-border"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-3 text-muted-foreground group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300">
                        {stat.icon}
                      </div>
                      <div className="text-3xl font-bold mb-1 text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Section>

          {/* Features Section with Enhanced Cards */}
          <Section className="py-16 px-6">
            <div className="container-standard max-w-7xl mx-auto">
              <div className="text-center mb-16 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                <Badge variant="premium" className="mb-6 bg-primary/10 text-primary-foreground border-primary/20">
                  <Sparkles className="w-3 h-3" />
                  Premium Features
                </Badge>
                <AccessibleHeading level={2} className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Why Choose easy-pdf?
                </AccessibleHeading>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Built with privacy and performance in mind. No compromises.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    variant="elevated"
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in-0 slide-in-from-bottom-5 duration-500 border-border"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader>
                      <div className="w-12 h-12 bg-background dark:bg-background flex items-center justify-center text-foreground dark:text-foreground mb-4 group-hover:scale-110 transition-transform duration-300 rounded-none">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Section>

          {(recentTools.length > 0 || favoriteTools.length > 0) && (
            <Section
              title={
                recentTools.length > 0
                  ? "Recently Used Tools"
                  : "Your Favorite Tools"
              }
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
              <Button asChild variant="gradient" size="lg">
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
