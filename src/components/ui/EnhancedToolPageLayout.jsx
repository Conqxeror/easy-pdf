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
import { FileText, Split, Minimize2, RotateCw, Stamp, Lock, Unlock, Text, ListOrdered, Eraser, PlusCircle, Signature, FileBadge2, Image as LucideImage, Search, FileHeart, Settings, Bookmark, Table, Layers, CheckCircle, Shield, EyeOff, GitCompare, MessageSquare, Calculator, QrCode, Award, Briefcase, Files } from "lucide-react";

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

// Icon mapping for features
const featureIcons = {
  "merge": <Files className="w-6 h-6 text-blue-500" />,
  "split": <Split className="w-6 h-6 text-green-500" />,
  "compress": <Minimize2 className="w-6 h-6 text-purple-500" />,
  "rotate": <RotateCw className="w-6 h-6 text-yellow-500" />,
  "watermark": <Stamp className="w-6 h-6 text-red-500" />,
  "protect": <Lock className="w-6 h-6 text-gray-500" />,
  "unlock": <Unlock className="w-6 h-6 text-orange-500" />,
  "delete": <Eraser className="w-6 h-6 text-indigo-500" />,
  "reorder": <ListOrdered className="w-6 h-6 text-cyan-500" />,
  "page-numbers": <PlusCircle className="w-6 h-6 text-amber-500" />,
  "sign": <Signature className="w-6 h-6 text-rose-500" />,
  "form": <Text className="w-6 h-6 text-lime-500" />,
  "ocr": <Search className="w-6 h-6 text-green-400" />,
  "image": <LucideImage className="w-6 h-6 text-pink-500" />,
  "metadata": <Settings className="w-6 h-6 text-gray-500" />,
  "bookmark": <Bookmark className="w-6 h-6 text-blue-500" />,
  "table": <Table className="w-6 h-6 text-green-500" />,
  "layers": <Layers className="w-6 h-6 text-purple-500" />,
  "check": <CheckCircle className="w-6 h-6 text-green-600" />,
  "shield": <Shield className="w-6 h-6 text-blue-600" />,
  "eye": <EyeOff className="w-6 h-6 text-red-600" />,
  "compare": <GitCompare className="w-6 h-6 text-indigo-600" />,
  "message": <MessageSquare className="w-6 h-6 text-cyan-600" />,
  "calculator": <Calculator className="w-6 h-6 text-green-500" />,
  "qr": <QrCode className="w-6 h-6 text-purple-500" />,
  "award": <Award className="w-6 h-6 text-yellow-500" />,
  "briefcase": <Briefcase className="w-6 h-6 text-blue-500" />,
  "file": <FileText className="w-6 h-6 text-teal-500" />,
  "heart": <FileHeart className="w-6 h-6 text-red-500" />,
  "badge": <FileBadge2 className="w-6 h-6 text-orange-500" />,
  "default": <FileText className="w-6 h-6 text-blue-500" />
};

export default function EnhancedToolPageLayout({
  title,
  subtitle,
  toolName,
  toolDescription,
  children,
  steps = [],
  faqs = [],
  currentTool,
  breadcrumbs = [],
  features = [],
  useCases = []
}) {
  const { isDark } = useTheme();

  // Function to get icon based on feature text
  const getFeatureIcon = (featureText) => {
    const lowerFeature = featureText.toLowerCase();
    
    // Check for specific keywords in the feature text
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
    
    // Default icon
    return featureIcons.default;
  };

  return (
    <>
      <PageContainer>
        {/* Hero Section with Breadcrumb */}
        <Hero
          title={title}
          subtitle={subtitle}
        />
        
        {breadcrumbs.length > 0 && (
          <div className="container-standard mb-6">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
        
        {/* Main Tool Card */}
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
            <CardContent>
              {children}
            </CardContent>
          </Card>
        </Section>
        
        {/* Features Section with Icons */}
        {features.length > 0 && (
          <Section>
            <AccessibleHeading level={2} className={`text-2xl text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Key Features
            </AccessibleHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-800/50 border-gray-700'} p-6 rounded-xl border transition-all duration-300 hover:border-blue-500 hover:scale-[1.02]`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4 mt-1">
                      <div className="bg-blue-500/10 p-2 rounded-lg">
                        {getFeatureIcon(feature)}
                      </div>
                    </div>
                    <p className={`${isDark ? 'text-gray-200' : 'text-gray-200'}`}>{feature}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
        
        {/* How to Use Section */}
        {steps.length > 0 && (
          <Section>
            <AccessibleHeading level={2} className={`text-2xl text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              How to Use
            </AccessibleHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`${isDark ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500' : 'bg-gray-800/50 border-gray-700 hover:border-blue-500'} p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02]`}
                >
                  <div className={`text-blue-500 dark:text-blue-400 text-2xl font-bold mb-3`}>0{index + 1}</div>
                  <p className={`${isDark ? 'text-gray-200' : 'text-gray-200'}`}>{step}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
        
        {/* Use Cases Section */}
        {useCases.length > 0 && (
          <Section>
            <AccessibleHeading level={2} className={`text-2xl text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Common Use Cases
            </AccessibleHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {useCases.map((useCase, index) => (
                <div 
                  key={index} 
                  className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-800/50 border-gray-700'} p-6 rounded-xl border transition-all duration-300 hover:border-purple-500 hover:scale-[1.02]`}
                >
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-purple-400' : 'text-purple-500'}`}>{useCase.title}</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-300'}`}>{useCase.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
        
        {/* FAQ Section */}
        {faqs.length > 0 && (
          <Section>
            <AccessibleHeading level={2} className={`text-2xl text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Frequently Asked Questions
            </AccessibleHeading>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-800/50 border-gray-700'} mb-4 rounded-lg px-6`}
                >
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
        
        {/* Additional spacing sections */}
        <div className="py-8"></div>
        
        {/* CTA Section */}
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
              <a href="/merge">
                Get Started Now
              </a>
            </Button>
          }
        />
        
        {/* Additional spacing sections */}
        <div className="py-8"></div>
      </PageContainer>
    </>
  );
}