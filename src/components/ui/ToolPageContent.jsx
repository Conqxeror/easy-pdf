import { toolsData } from '@/lib/toolData';
import React, { Suspense, lazy, memo, useMemo } from 'react';
import { Card } from '@/components/ui/card';

// Lazy load heavy components with error boundaries
const LazyRelatedTools = lazy(() => import('@/components/RelatedTools').catch(() => ({ default: () => null })));
const LazyFAQ = lazy(() => import('@/components/FAQ').catch(() => ({ default: () => null })));

// Loading skeletons for better UX
const RelatedToolsSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-700 rounded w-48 mb-4"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-700 rounded"></div>
      ))}
    </div>
  </div>
);

const FAQSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="border-b border-gray-700 pb-4">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
    ))}
  </div>
);

// Memoized step component for better performance
const StepsList = memo(({ steps }) => {
  if (!Array.isArray(steps)) {
    return null;
  }
  return (
    <ol className="space-y-4 text-gray-300">
      {(steps || []).map((step, index) => (
        <li key={index} className="flex items-start group">
          <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-bold mr-4 mt-0.5 group-hover:scale-110 transition-transform duration-200">
            {index + 1}
          </span>
          <span className="leading-relaxed text-lg">{step}</span>
        </li>
      ))}
    </ol>
  );
});

// Memoized features grid
const FeaturesGrid = memo(({ toolName: _toolName }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
    <Card className="p-5 hover:border-blue-500 transition-colors">
      <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
        <span className="mr-2">🔒</span> 100% Secure & Private
      </h4>
      <p className="leading-relaxed">
        All processing happens in your browser. Your files never leave your device, 
        ensuring complete privacy and security for your sensitive documents.
      </p>
    </Card>
    <Card className="p-5 hover:border-blue-500 transition-colors">
      <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
        <span className="mr-2">⚡</span> Fast & Efficient
      </h4>
      <p className="leading-relaxed">
        Our optimized algorithms process your PDFs quickly without compromising quality. 
        No waiting times or server delays.
      </p>
    </Card>
    <Card className="p-5 hover:border-blue-500 transition-colors">
      <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
        <span className="mr-2">💰</span> Completely Free
      </h4>
      <p className="leading-relaxed">
        No hidden costs, subscriptions, or limitations. All tools are free to use 
        with unlimited access and no watermarks.
      </p>
    </Card>
    <Card className="p-5 hover:border-blue-500 transition-colors">
      <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
        <span className="mr-2">🌐</span> Works Everywhere
      </h4>
      <p className="leading-relaxed">
        Compatible with all modern browsers and devices. Works on Windows, Mac, Linux, 
        iOS, and Android without any downloads.
      </p>
    </Card>
  </div>
));

const ToolPageContent = ({ toolName, toolDescription, steps, faqs, currentTool }) => {
  // Memoize enhanced FAQs to prevent unnecessary recalculations
  const enhancedFAQs = useMemo(() => {
    try {
      if (currentTool) {
        // Lazy load FAQ data only when needed
        const { getFAQsForTool } = require('@/lib/faqData');
        return getFAQsForTool(currentTool);
      }
      return faqs || [];
    } catch (error) {
      console.warn('Failed to load FAQ data:', error);
      return faqs || [];
    }
  }, [currentTool, faqs]);

  return (
    <div className="space-y-12">
      {/* Header section */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {`How to ${toolName} Online for Free`}
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          {toolDescription}
        </p>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Steps section */}
        <Card className="p-6 md:p-8 hover:border-blue-500 transition-all duration-300">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
              1
            </span>
            How to {toolName}
          </h3>
          <StepsList steps={steps} />
        </Card>

        {/* FAQ section */}
        <Card className="p-6 md:p-8 hover:border-green-500 transition-all duration-300">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
              ?
            </span>
            Frequently Asked Questions
          </h3>
          
          <Suspense fallback={<FAQSkeleton />}>
            {currentTool ? (
              <LazyFAQ faqs={enhancedFAQs} />
            ) : (
              <div className="space-y-6">
                {(faqs || []).map((faq, index) => (
                  <div key={index} className="border-b border-gray-700 last:border-b-0 pb-4 last:pb-0">
                    <h4 className="text-lg font-semibold text-white mb-2">{faq.question}</h4>
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </Suspense>
        </Card>
      </div>

      {/* Features section */}
      <Card className="p-6 md:p-8 hover:border-purple-500 transition-all duration-300">
        <h3 className="text-2xl font-bold text-white mb-6">
          Why Choose Our {toolName} Tool?
        </h3>
        <FeaturesGrid toolName={toolName} />
      </Card>

      {/* Related Tools Section */}
      {currentTool && (
        <Suspense fallback={<RelatedToolsSkeleton />}>
          <div>
            <LazyRelatedTools currentTool={currentTool} tools={toolsData} />
          </div>
        </Suspense>
      )}
    </div>
  );
};

// Add display names for better debugging
StepsList.displayName = 'StepsList';
FeaturesGrid.displayName = 'FeaturesGrid';

// Memoize the entire component to prevent unnecessary re-renders
export default memo(ToolPageContent);