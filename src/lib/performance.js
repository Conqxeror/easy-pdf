import { Suspense, lazy } from 'react';

// Lazy load components for better performance
const LazyFAQSection = lazy(() => import('@/components/FAQ'));
const LazyRelatedTools = lazy(() => import('@/components/RelatedTools'));

// Loading fallback components
const FAQSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-100 rounded"></div>
    ))}
  </div>
);

const RelatedToolsSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-100 rounded"></div>
      ))}
    </div>
  </div>
);

// Performance monitoring hook
const usePerformanceMonitoring = () => {
  const measurePerformance = (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: name,
        value: Math.round(end - start)
      });
    }
    
    return result;
  };

  return { measurePerformance };
};

export {
  LazyFAQSection,
  LazyRelatedTools,
  FAQSkeleton,
  RelatedToolsSkeleton,
  usePerformanceMonitoring
};