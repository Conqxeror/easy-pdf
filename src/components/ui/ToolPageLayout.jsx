"use client";

import React, { Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { 
  PageContainer, 
  Hero, 
  Section, 
  CTASection 
} from "@/components/ui/Layout";
import { AccessibleHeading } from "@/components/ui/AccessibilityEnhancements";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import Breadcrumb from "@/components/Breadcrumb";
import { toolsData } from '@/lib/toolData';
import { useTheme } from "@/contexts/ThemeContext";
import { CheckCircle, Sparkles } from "lucide-react";

// Lazy load heavy components with error boundaries
const LazyRelatedTools = lazy(() => import('@/components/RelatedTools').catch(() => ({ default: () => null })));

// Enhanced loading skeletons for better UX
const RelatedToolsSkeleton = () => (
  <div className="animate-in fade-in-0 duration-500">
    <Skeleton className="h-8 w-48 mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

export default function ToolPageLayout({
  title,
  subtitle,
  toolName,
  toolDescription,
  children,
  steps = [],
  faqs = [],
  currentTool,
  breadcrumbs = [],
  primaryActionHref,
  badge,
  icon
}) {
  const { isDark } = useTheme();

  return (
    <>
      <main id="main-content">
        <PageContainer>
          {/* Hero Section with Glass Effect */}
          <div className="relative overflow-hidden py-6 px-6 mb-4">
            {/* Solid Background */}
            <div className="absolute inset-0 bg-white dark:bg-black -z-10" />
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] -z-10" />
            
            <Hero title={title} subtitle={subtitle} />
          </div>

          {/* Breadcrumb - Enhanced Styling */}
          {breadcrumbs.length > 0 && (
            <div className="container-standard px-6 mb-8">
              <div className="animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
                <Breadcrumb items={breadcrumbs} />
              </div>
            </div>
          )}

          {/* Main Tool Section - Glass Card */}
          <Section spacing="small" className="px-6 py-6">
            <div className="container-standard max-w-7xl mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              <Card variant="glass" padding="lg" className="shadow-xl bg-white/90 dark:bg-black">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {icon && (
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-950/30 flex items-center justify-center text-gray-700 dark:text-gray-400">
                            {icon}
                          </div>
                        )}
                        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                          {toolName}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                        {toolDescription}
                      </CardDescription>
                    </div>
                    {badge && (
                      <Badge variant="premium" size="lg" className="shrink-0">
                        <Sparkles className="h-3 w-3 preserve-color" />
                        {badge}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  {children}
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* How to Use Steps - Premium Cards */}
          {steps.length > 0 && (
            <Section className="px-6 py-6 bg-gray-50 dark:bg-gray-950">
              <div className="container-standard max-w-7xl mx-auto animate-in fade-in-0 slide-in-from-bottom-5 duration-700 delay-200">
                <AccessibleHeading 
                  level={2} 
                  className="text-4xl text-center mb-12 font-bold text-gray-900 dark:text-white"
                >
                  How to Use
                </AccessibleHeading>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                  {steps.map((step, index) => (
                    <Card 
                      key={index}
                      variant="elevated"
                      className="group hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-950 border border-gray-700"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-950 dark:bg-gray-950 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {index + 1}
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 preserve-color" />
                        </div>
                        <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* FAQs - Enhanced Accordion */}
          {faqs.length > 0 && (
            <Section className="px-6 py-6">
              <div className="container-standard max-w-4xl mx-auto animate-in fade-in-0 slide-in-from-bottom-5 duration-700 delay-300">
                <AccessibleHeading 
                  level={2} 
                  className="text-4xl text-center mb-12 font-bold text-gray-900 dark:text-white"
                >
                  Frequently Asked Questions
                </AccessibleHeading>
                <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem 
                      key={index}
                      className="bg-white dark:bg-gray-950 border border-gray-800 px-6 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                    >
                      <AccordionTrigger className="text-left text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-400 font-semibold py-5">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 dark:text-gray-300 pb-5 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </Section>
          )}

          {/* Related Tools Section */}
          {currentTool && (
            <Section>
              <div className="animate-in fade-in-0 slide-in-from-bottom-5 duration-700 delay-400">
                <Suspense fallback={<RelatedToolsSkeleton />}>
                  <LazyRelatedTools currentTool={currentTool} tools={toolsData} />
                </Suspense>
              </div>
            </Section>
          )}

          {/* CTA Section - Premium Glass Effect */}
          <Section spacing="small">
            <div className="animate-in fade-in-0 slide-in-from-bottom-5 duration-700 delay-500">
              <Card variant="glass" className="relative overflow-hidden shadow-2xl">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-600/10 via-gray-600/10 to-gray-700/10 -z-10" />
                <div className="text-center py-12 px-6">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                    Ready to transform your PDF workflow?
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                    Join thousands of users who trust our privacy-focused PDF tools.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                      asChild
                      variant="premium"
                      size="lg"
                      className="px-8 shadow-xl hover:shadow-2xl"
                    >
                      <a href={primaryActionHref || "/merge"}>
                        Get Started Now
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="px-8"
                    >
                      <a href="/tools">
                        View All Tools
                      </a>
                    </Button>
                  </div>
                  
                  {/* Trust Badges */}
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <Badge variant="outline" size="lg">
                      <CheckCircle className="h-4 w-4 text-green-500 preserve-color" />
                      100% Private
                    </Badge>
                    <Badge variant="outline" size="lg">
                      <CheckCircle className="h-4 w-4 text-green-500 preserve-color" />
                      No Sign-up Required
                    </Badge>
                    <Badge variant="outline" size="lg">
                      <CheckCircle className="h-4 w-4 text-green-500 preserve-color" />
                      Free Forever
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </Section>
        </PageContainer>
      </main>
    </>
  );
}