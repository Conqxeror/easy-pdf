// Simple performance optimizations without problematic dependencies
export const initializePerformanceOptimizations = () => {
  if (typeof window === 'undefined') return;

  // Simple image lazy loading
  const lazyImages = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window && lazyImages.length > 0) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // Preload critical assets - removed to prevent unused resource warnings
  // Font loading handled by Tailwind CSS system font stack

  // Monitor Core Web Vitals if available
  if ('PerformanceObserver' in window && window.gtag) {
    try {
      // LCP monitoring
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          window.gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(lastEntry.startTime),
            event_category: 'Performance',
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.log('LCP monitoring failed:', e);
    }
  }
};