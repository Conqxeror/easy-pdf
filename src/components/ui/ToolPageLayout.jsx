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
import Breadcrumb from "@/components/Breadcrumb";
import { toolsData } from '@/lib/toolData';
import { useTheme } from "@/contexts/ThemeContext";

// Lazy load heavy components with error boundaries
const LazyRelatedTools = lazy(() => import('@/components/RelatedTools').catch(() => ({ default: () => null })));

// Loading skeletons for better UX
const RelatedToolsSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
  primaryActionHref
}) {
  const { isDark } = useTheme();

  return (
    <>
      <main id="main-content">
        <PageContainer>
          <Hero
            title={title}
            subtitle={subtitle}
          />
          
          {/* Breadcrumb */}
          {breadcrumbs.length > 0 && (
            <div className="container-standard mb-6">
              <Breadcrumb items={breadcrumbs} />
            </div>
          )}
          
          <Section spacing="small">
            <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-900 border-gray-700'}`}>
              <CardHeader>
                <CardTitle className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-100'}`}>
                  {toolName}
                </CardTitle>
                <CardDescription className={`${isDark ? 'text-gray-300' : 'text-gray-400'}`}>
                  {toolDescription}
                </CardDescription>
              </CardHeader>
                    <CardContent className="space-y-8">
                      {children}
                    </CardContent>
            </Card>
          </Section>
          
          {steps.length > 0 && (
            <Section>
              <AccessibleHeading level={2} className={`text-2xl text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                How to Use
              </AccessibleHeading>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {steps.map((step, index) => (
                  <div key={index} className={`${isDark ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500' : 'bg-gray-800/50 border-gray-700 hover:border-blue-500'} p-6 rounded-xl border transition-all duration-300`}>
                    <div className={`text-blue-500 dark:text-blue-400 text-2xl font-bold mb-3`}>0{index + 1}</div>
                    <p className={`${isDark ? 'text-gray-200' : 'text-gray-200'}`}>{step}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
          
          {faqs.length > 0 && (
            <Section>
              <AccessibleHeading level={2} className={`text-2xl text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Frequently Asked Questions
              </AccessibleHeading>
              <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-800/50 border-gray-700'} mb-4 rounded-lg px-6`}>
                    <AccordionTrigger className={`text-left ${isDark ? 'text-gray-100 hover:text-blue-400' : 'text-gray-100 hover:text-blue-400'}`}>
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className={`${isDark ? 'text-gray-300' : 'text-gray-300'}`}>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Section>
          )}
          
          {/* Related Tools Section - Moved above CTA */}
          {currentTool && (
            <Suspense fallback={<RelatedToolsSkeleton />}>
              <div>
                <LazyRelatedTools currentTool={currentTool} tools={toolsData} />
              </div>
            </Suspense>
          )}
          
          {/* Additional spacing between Related Tools and CTA */}
          <div className="py-8"></div>
          
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
                <a href={primaryActionHref || "/merge"}>
                  Get Started Now
                </a>
              </Button>
            }
          />
        </PageContainer>
      </main>
    </>
  );
}