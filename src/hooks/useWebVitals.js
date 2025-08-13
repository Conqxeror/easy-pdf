// Performance monitoring hook for Core Web Vitals
import React, { useEffect } from 'react';

export const useWebVitals = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // LCP monitoring
      const lcpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('LCP:', entry.startTime, entry);
          }
          
          // Send to analytics if available
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'web_vitals', {
              name: 'LCP',
              value: Math.round(entry.startTime),
              event_category: 'Performance',
            });
          }
        });
      });
      
      // FID monitoring
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('FID:', entry.processingStart - entry.startTime, entry);
          }
          
          // Send to analytics if available
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round(entry.processingStart - entry.startTime),
              event_category: 'Performance',
            });
          }
        });
      });
      
      // CLS monitoring
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('CLS:', entry.value, entry);
          }
          
          // Send to analytics if available
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'web_vitals', {
              name: 'CLS',
              value: entry.value,
              event_category: 'Performance',
            });
          }
        });
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        fidObserver.observe({ entryTypes: ['first-input'] });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch {
        // Fallback for older browsers
        try {
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
          fidObserver.observe({ type: 'first-input', buffered: true });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch {
          // Web Vitals monitoring failed
        }
      }
      
      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);
};

export default useWebVitals;