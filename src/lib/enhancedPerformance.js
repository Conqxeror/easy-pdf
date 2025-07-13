// Enhanced Performance Monitoring and Optimization Utilities
import React, { useState, useEffect, Suspense, lazy, memo, useCallback, useMemo  } from 'react';

// Enhanced lazy loading with error boundaries
const createLazyComponent = (importFn, fallback = null) => {
  const LazyComponent = lazy(importFn);
  
  const WrappedComponent = memo((props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  ));
  
  WrappedComponent.displayName = 'LazyComponent';
  return WrappedComponent;
};

// Optimized skeleton components
const OptimizedSkeleton = memo(({ className = "", children, ...props }) => (
  <div 
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    {...props}
  >
    {children}
  </div>
));

OptimizedSkeleton.displayName = 'OptimizedSkeleton';

// Enhanced performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
  }

  // Measure function execution time
  measure(name, fn) {
    const start = performance.now();
    let result;
    
    try {
      result = fn();
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.finally(() => {
          this.recordMetric(name, performance.now() - start);
        });
      }
      
      this.recordMetric(name, performance.now() - start);
      return result;
    } catch (error) {
      this.recordMetric(name, performance.now() - start, { error: true });
      throw error;
    }
  }

  // Record performance metric
  recordMetric(name, duration, metadata = {}) {
    const metric = {
      name,
      duration,
      timestamp: Date.now(),
      ...metadata
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push(metric);
    
    // Keep only last 100 measurements per metric
    const measurements = this.metrics.get(name);
    if (measurements.length > 100) {
      measurements.shift();
    }

    // Send to analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timing_complete', {
        name,
        value: Math.round(duration),
        custom_parameter_1: metadata.error ? 'error' : 'success'
      });
    }
  }

  // Get performance statistics
  getStats(name) {
    const measurements = this.metrics.get(name) || [];
    if (measurements.length === 0) return null;

    const durations = measurements.map(m => m.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    
    return {
      count: measurements.length,
      average: avg,
      min,
      max,
      recent: durations.slice(-10) // Last 10 measurements
    };
  }

  // Monitor Core Web Vitals
  observeWebVitals() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    this.observeMetric('largest-contentful-paint', (entry) => {
      this.recordMetric('LCP', entry.value);
    });

    // First Input Delay
    this.observeMetric('first-input', (entry) => {
      this.recordMetric('FID', entry.processingStart - entry.startTime);
    });

    // Cumulative Layout Shift
    this.observeMetric('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        this.recordMetric('CLS', entry.value);
      }
    });
  }

  observeMetric(type, callback) {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      
      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// File processing optimization utilities
const optimizeFileProcessing = {
  // Chunk large files for processing
  chunkFile: (file, chunkSize = 1024 * 1024) => { // 1MB chunks
    const chunks = [];
    let offset = 0;
    
    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSize);
      chunks.push(chunk);
      offset += chunkSize;
    }
    
    return chunks;
  },

  // Process files in batches to avoid memory issues
  processBatch: async (items, batchSize = 5, processor) => {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      results.push(...batchResults);
      
      // Allow UI to update between batches
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return results;
  },

  // Memory-efficient file reading
  readFileChunked: (file, onChunk, chunkSize = 64 * 1024) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      let offset = 0;
      
      const readNextChunk = () => {
        if (offset >= file.size) {
          resolve();
          return;
        }
        
        const chunk = file.slice(offset, offset + chunkSize);
        reader.readAsArrayBuffer(chunk);
      };
      
      reader.onload = (e) => {
        onChunk(new Uint8Array(e.target.result), offset);
        offset += chunkSize;
        readNextChunk();
      };
      
      reader.onerror = reject;
      readNextChunk();
    });
  }
};

// React performance hooks
const useOptimizedCallback = useCallback;
const useOptimizedMemo = useMemo;

// Debounced state hook for search/filter inputs
const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Initialize web vitals monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.observeWebVitals();
}

export {
  createLazyComponent,
  OptimizedSkeleton,
  PerformanceMonitor,
  performanceMonitor,
  optimizeFileProcessing,
  useOptimizedCallback,
  useOptimizedMemo,
  useDebouncedValue
};