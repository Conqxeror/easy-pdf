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
import Supporters from "@/components/ui/Supporters";
import { toolsData } from '@/lib/toolData';
import { getFAQsForTool } from '@/lib/faqData';
import { useTheme } from "@/contexts/ThemeContext";
import { CheckCircle, Sparkles, FileText, Split, Minimize2, RotateCw, Stamp, Lock, Unlock, Text, ListOrdered, Eraser, PlusCircle, Signature, FileBadge2, Image as LucideImage, Search, FileHeart, Settings, Bookmark, Table, Layers, Shield, EyeOff, GitCompare, MessageSquare, Calculator, QrCode, Award, Briefcase, Files } from "lucide-react";

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

// Icon mapping for features
const featureIcons = {
  "merge": <Files className="w-6 h-6 text-foreground" />,
  "split": <Split className="w-6 h-6 text-foreground" />,
  "compress": <Minimize2 className="w-6 h-6 text-foreground" />,
  "rotate": <RotateCw className="w-6 h-6 text-foreground" />,
  "watermark": <Stamp className="w-6 h-6 text-foreground" />,
  "protect": <Lock className="w-6 h-6 text-foreground" />,
  "unlock": <Unlock className="w-6 h-6 text-foreground" />,
  "delete": <Eraser className="w-6 h-6 text-foreground" />,
  "reorder": <ListOrdered className="w-6 h-6 text-foreground" />,
  "page-numbers": <PlusCircle className="w-6 h-6 text-foreground" />,
  "sign": <Signature className="w-6 h-6 text-foreground" />,
  "form": <Text className="w-6 h-6 text-foreground" />,
  "ocr": <Search className="w-6 h-6 text-foreground" />,
  "image": <LucideImage className="w-6 h-6 text-foreground" />,
  "metadata": <Settings className="w-6 h-6 text-foreground" />,
  "bookmark": <Bookmark className="w-6 h-6 text-foreground" />,
  "table": <Table className="w-6 h-6 text-foreground" />,
  "layers": <Layers className="w-6 h-6 text-foreground" />,
  "check": <CheckCircle className="w-6 h-6 text-foreground" />,
  "shield": <Shield className="w-6 h-6 text-foreground" />,
  "eye": <EyeOff className="w-6 h-6 text-foreground" />,
  "compare": <GitCompare className="w-6 h-6 text-foreground" />,
  "message": <MessageSquare className="w-6 h-6 text-foreground" />,
  "calculator": <Calculator className="w-6 h-6 text-foreground" />,
  "qr": <QrCode className="w-6 h-6 text-foreground" />,
  "award": <Award className="w-6 h-6 text-foreground" />,
  "briefcase": <Briefcase className="w-6 h-6 text-foreground" />,
  "file": <FileText className="w-6 h-6 text-foreground" />,
  "heart": <FileHeart className="w-6 h-6 text-foreground" />,
  "badge": <FileBadge2 className="w-6 h-6 text-foreground" />,
  "default": <FileText className="w-6 h-6 text-foreground" />
};

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
  icon,
  features = [],
  useCases = []
}) {
  const { isDark } = useTheme();

  // Logic to get guide data
  const activeToolData = currentTool ? toolsData.find(t => t.href === `/${currentTool}` || t.href === currentTool || (t.href.startsWith('/') && t.href.substring(1) === currentTool)) : null;
  const guide = activeToolData?.guide;
  
  // Fallback to toolData if props are missing
  const finalUseCases = useCases.length > 0 ? useCases : (activeToolData?.useCases || []);
  const finalFaqs = faqs.length > 0 ? faqs : (activeToolData?.faqs || []);

  // Function to get icon based on feature text
  const getFeatureIcon = (featureText) => {
    const lowerFeature = featureText.toLowerCase();
    
    if (lowerFeature.includes("merge") || lowerFeature.includes("combine")) return featureIcons.merge;
    if (lowerFeature.includes("split") || lowerFeature.includes("extract")) return featureIcons.split;
    if (lowerFeature.includes("compress") || lowerFeature.includes("reduce") || lowerFeature.includes("optimize")) return featureIcons.compress;
    if (lowerFeature.includes("rotate") || lowerFeature.includes("orientation")) return featureIcons.rotate;
    if (lowerFeature.includes("watermark") || lowerFeature.includes("stamp")) return featureIcons.watermark;
    if (lowerFeature.includes("protect") || lowerFeature.includes("password") || lowerFeature.includes("encrypt")) return featureIcons.protect;
    if (lowerFeature.includes("unlock") || lowerFeature.includes("remove password")) return featureIcons.unlock;
    if (lowerFeature.includes("delete") || lowerFeature.includes("remove") || lowerFeature.includes("trim")) return featureIcons.delete;
    if (lowerFeature.includes("reorder") || lowerFeature.includes("organize") || lowerFeature.includes("arrange")) return featureIcons.reorder;
    if (lowerFeature.includes("page number") || lowerFeature.includes("header") || lowerFeature.includes("footer")) return featureIcons["page-numbers"];
    if (lowerFeature.includes("sign") || lowerFeature.includes("signature") || lowerFeature.includes("annotate")) return featureIcons.sign;
    if (lowerFeature.includes("form") || lowerFeature.includes("fill")) return featureIcons.form;
    if (lowerFeature.includes("ocr") || lowerFeature.includes("text recognition") || lowerFeature.includes("scan")) return featureIcons.ocr;
    if (lowerFeature.includes("image") || lowerFeature.includes("photo") || lowerFeature.includes("jpg") || lowerFeature.includes("png")) return featureIcons.image;
    if (lowerFeature.includes("metadata") || lowerFeature.includes("title") || lowerFeature.includes("author")) return featureIcons.metadata;
    if (lowerFeature.includes("bookmark") || lowerFeature.includes("navigation")) return featureIcons.bookmark;
    if (lowerFeature.includes("table") || lowerFeature.includes("csv") || lowerFeature.includes("excel")) return featureIcons.table;
    if (lowerFeature.includes("batch") || lowerFeature.includes("multiple")) return featureIcons.layers;
    if (lowerFeature.includes("accessibility") || lowerFeature.includes("wcag") || lowerFeature.includes("compliance")) return featureIcons.check;
    if (lowerFeature.includes("digital signature") || lowerFeature.includes("certificate")) return featureIcons.shield;
    if (lowerFeature.includes("redaction") || lowerFeature.includes("sensitive")) return featureIcons.eye;
    if (lowerFeature.includes("compare") || lowerFeature.includes("diff") || lowerFeature.includes("version")) return featureIcons.compare;
    if (lowerFeature.includes("comment") || lowerFeature.includes("collaboration")) return featureIcons.message;
    if (lowerFeature.includes("invoice") || lowerFeature.includes("calculate") || lowerFeature.includes("tax")) return featureIcons.calculator;
    if (lowerFeature.includes("qr") || lowerFeature.includes("barcode")) return featureIcons.qr;
    if (lowerFeature.includes("certificate") || lowerFeature.includes("award")) return featureIcons.award;
    if (lowerFeature.includes("portfolio") || lowerFeature.includes("resume") || lowerFeature.includes("cv")) return featureIcons.briefcase;
    if (lowerFeature.includes("report") || lowerFeature.includes("document")) return featureIcons.file;
    if (lowerFeature.includes("medical") || lowerFeature.includes("health")) return featureIcons.heart;
    if (lowerFeature.includes("create") || lowerFeature.includes("maker")) return featureIcons.badge;
    
    return featureIcons.default;
  };

  // ✅ SEO FIX: Primary H1 for server-side rendering
  const h1Content = title || toolName || 'Easy PDF Tool';

  return (
    <>
      {/* ✅ SSR H1 - Hidden visually but visible to crawlers and screen readers */}
      <h1 className="sr-only" id="page-title">{h1Content}</h1>
      
      <main id="main-content" role="main" aria-labelledby="page-title">
        <PageContainer>
          {/* Hero Section with Glass Effect */}
          <div className="relative overflow-hidden py-6 px-6 mb-4">
            {/* Solid Background */}
            <div className="absolute inset-0 bg-background -z-10" />
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
          <Section spacing="small">
            <div className="container-standard max-w-7xl mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              <Card variant="default" padding="none" className="md:p-8 p-0 shadow-none border-0 bg-transparent md:border md:shadow-xl md:bg-card">
                <CardHeader className="px-0 md:px-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {icon && (
                          <div className="flex-shrink-0 w-10 h-10 bg-muted flex items-center justify-center text-muted-foreground">
                            {icon}
                          </div>
                        )}
                        <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
                          {toolName}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-base text-foreground">
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
                <CardContent className="space-y-8 pt-6 px-0 md:px-6">
                  {children}
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Guide Section - SEO Content */}
          {guide && (
            <Section>
              <div className="container-standard max-w-4xl mx-auto animate-in fade-in-0 slide-in-from-bottom-5 duration-700 delay-100">
                <Card variant="default" className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-border">
                  <div className="prose dark:prose-invert max-w-none">
                    <AccessibleHeading level={2} className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
                      {`How to use ${toolName}`}
                    </AccessibleHeading>
                    
                    {guide.introduction && (
                      <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        {guide.introduction}
                      </p>
                    )}

                    {guide.steps && guide.steps.length > 0 && (
                      <div className="mb-10">
                        <h3 className="text-xl md:text-2xl font-semibold mb-4 text-foreground">Step-by-Step Guide</h3>
                        <div className="space-y-6">
                          {guide.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                {idx + 1}
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg mb-1 text-foreground">{step.title}</h4>
                                <p className="text-muted-foreground">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {guide.features && guide.features.length > 0 && (
                      <div>
                        <h3 className="text-xl md:text-2xl font-semibold mb-4 text-foreground">Why use this tool?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {guide.features.map((feature, idx) => (
                            <div key={idx} className="bg-muted/30 p-4 rounded-lg border border-border/50">
                              <h4 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h4>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </Section>
          )}

          {/* Features Section with Icons */}
          {features.length > 0 && (
            <Section>
              <div className="container-standard max-w-7xl mx-auto animate-in fade-in-0 slide-in-from-bottom-5 duration-700 delay-150">
                <AccessibleHeading 
                  level={2} 
                  className="text-3xl md:text-4xl text-center mb-8 md:mb-12 font-bold text-foreground"
                >
                  Key Features
                </AccessibleHeading>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <Card 
                      key={index}
                      variant="default"
                      className="group hover:shadow-xl transition-all duration-300 bg-transparent md:bg-card border-0 md:border border-border p-0 md:p-6"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-muted flex items-center justify-center">
                            {getFeatureIcon(feature)}
                          </div>
                        </div>
                        <p className="text-foreground leading-relaxed">
                          {feature}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Use Cases Section */}
          {finalUseCases.length > 0 && (
            <Section>
              <div className="container-standard max-w-7xl mx-auto animate-in fade-in-0 slide-in-from-bottom-5 duration-700 delay-175">
                <AccessibleHeading 
                  level={2} 
                  className="text-3xl md:text-4xl text-center mb-8 md:mb-12 font-bold text-foreground"
                >
                  Common Use Cases
                </AccessibleHeading>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {finalUseCases.map((useCase, index) => (
                    <Card 
                      key={index}
                      variant="default"
                      className="group hover:shadow-xl transition-all duration-300 bg-transparent md:bg-card border-0 md:border border-border p-0 md:p-6"
                    >
                      <div className="space-y-3">
                        <h3 className="font-bold text-lg text-foreground">
                          {useCase.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {useCase.description}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* How to Use Steps - Premium Cards */}
          {steps.length > 0 && (
            <Section>
              <div className="container-standard max-w-7xl mx-auto animate-in fade-in-0 slide-in-from-bottom-5 duration-700 delay-200">
                <AccessibleHeading 
                  level={2} 
                  className="text-3xl md:text-4xl text-center mb-8 md:mb-12 font-bold text-foreground"
                >
                  How to Use
                </AccessibleHeading>
                {/* Make each step card full width and stack vertically for clearer reading */}
                <div className="grid grid-cols-1 gap-8 md:gap-10">
                  {steps.map((step, index) => (
                    <Card 
                      key={index}
                      variant="default"
                      className="group hover:shadow-2xl transition-all duration-300 bg-transparent md:bg-card border-0 md:border border-border p-0 md:p-6"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {index + 1}
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 preserve-color" />
                        </div>
                        <p className="text-foreground leading-relaxed">
                          {step}
                        </p>

                        {/* Pro tips removed — keeping How to Use content concise */}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* FAQs - Enhanced Accordion */}
          {((finalFaqs && finalFaqs.length > 0) || currentTool) && (
            <Section>
              <div className="container-standard max-w-4xl mx-auto animate-in fade-in-0 slide-in-from-bottom-5 duration-700 delay-300">
                <AccessibleHeading 
                  level={2} 
                  className="text-3xl md:text-4xl text-center mb-8 md:mb-12 font-bold text-foreground"
                >
                  Frequently Asked Questions
                </AccessibleHeading>
                {(() => {
                  // Merge provided page FAQs with common/tool-specific FAQs for richer content
                  const provided = Array.isArray(finalFaqs) ? finalFaqs : []
                  let merged = [...provided]
                  if (currentTool) {
                    const extra = getFAQsForTool(currentTool)
                    extra.forEach(e => {
                      if (!merged.some(m => m.question?.toLowerCase() === e.question?.toLowerCase())) merged.push(e)
                    })
                  }

                  return (
                    <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto space-y-4">
                      {merged.map((faq, index) => (
                    <AccordionItem 
                      key={index}
                      value={`faq-${index}`}
                      className="bg-transparent md:bg-background border-0 md:border border-border px-0 md:px-6 shadow-none md:shadow-sm hover:shadow-none md:hover:shadow-md transition-shadow duration-300 overflow-hidden"
                    >
                      <AccordionTrigger className="text-left text-foreground hover:text-foreground dark:hover:text-foreground font-semibold py-5">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-foreground dark:text-foreground pb-5 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                  )
                })()}
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
              <Card variant="glass" className="relative overflow-hidden shadow-none md:shadow-2xl bg-transparent md:bg-card border-0 md:border backdrop-blur-none md:backdrop-blur-xl">
                {/* Gradient Overlay - Hidden on mobile */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-600/10 via-gray-600/10 to-gray-700/10 -z-10 hidden md:block" />
                <div className="text-center py-8 md:py-12 px-0 md:px-6">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground dark:text-foreground">
                    Ready to transform your PDF workflow?
                  </h2>
                  <p className="text-lg text-foreground dark:text-foreground mb-8 max-w-2xl mx-auto">
                    Join thousands of users who trust our privacy-focused PDF tools.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                      asChild
                      variant="premium"
                      size="lg"
                      className="px-8 shadow-xl hover:shadow-2xl w-full sm:w-auto"
                    >
                      <a href={primaryActionHref || "/merge"}>
                        Get Started Now
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="px-8 w-full sm:w-auto"
                    >
                      <a href="/tools">
                        View All Tools
                      </a>
                    </Button>
                  </div>
                  
                  {/* Trust Badges */}
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <Badge variant="outline" size="lg" className="bg-transparent border-foreground/20">
                      <CheckCircle className="h-4 w-4 text-green-500 preserve-color" />
                      100% Private
                    </Badge>
                    <Badge variant="outline" size="lg" className="bg-transparent border-foreground/20">
                      <CheckCircle className="h-4 w-4 text-green-500 preserve-color" />
                      No Sign-up Required
                    </Badge>
                    <Badge variant="outline" size="lg" className="bg-transparent border-foreground/20">
                      <CheckCircle className="h-4 w-4 text-green-500 preserve-color" />
                      Free Forever
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </Section>

          {/* Supporters Section */}
          <Supporters />
        </PageContainer>
      </main>
    </>
  );
}