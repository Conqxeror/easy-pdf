// Enhanced Analytics System for easy-pdf
// Implements comprehensive tracking for user behavior, conversions, and performance

class AnalyticsManager {
  constructor() {
    this.isInitialized = false;
    this.userSession = this.initializeSession();
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;
    
    this.isInitialized = true;
    this.trackPageView();
    this.setupPerformanceMonitoring();
    this.trackUserPreferences();
  }

  initializeSession() {
    if (typeof window === 'undefined') return {};
    
    const sessionId = this.generateSessionId();
    const userAgent = navigator.userAgent;
    const startTime = Date.now();
    
    return {
      sessionId,
      startTime,
      userAgent,
      pageViews: 0,
      toolsUsed: [],
      conversionEvents: []
    };
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Core tracking methods
  trackEvent(eventName, properties = {}) {
    if (!this.isInitialized || typeof window === 'undefined') return;

    const eventData = {
      event: eventName,
      timestamp: Date.now(),
      sessionId: this.userSession.sessionId,
      url: window.location.href,
      ...properties
    };

    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, {
        custom_parameter_1: JSON.stringify(properties),
        session_id: this.userSession.sessionId
      });
    }

    // Store locally for analytics
    this.storeEvent(eventData);
  }

  trackPageView(page = null) {
    if (typeof window === 'undefined') return;
    
    const currentPage = page || window.location.pathname;
    this.userSession.pageViews++;
    
    this.trackEvent('page_view', {
      page: currentPage,
      referrer: document.referrer,
      pageViews: this.userSession.pageViews
    });
  }

  // Tool usage tracking
  trackToolUsage(toolName, properties = {}) {
    this.userSession.toolsUsed.push({
      tool: toolName,
      timestamp: Date.now(),
      ...properties
    });

    this.trackEvent('tool_usage', {
      tool_name: toolName,
      file_count: properties.fileCount || 0,
      file_size_mb: properties.fileSizeMB || 0,
      processing_time_ms: properties.processingTimeMS || 0,
      success: properties.success !== false,
      ...properties
    });
  }

  trackFileProcessing(toolName, fileInfo) {
    const startTime = performance.now();
    
    return {
      complete: (success = true, additionalData = {}) => {
        const processingTime = performance.now() - startTime;
        
        this.trackToolUsage(toolName, {
          fileCount: fileInfo.count || 1,
          fileSizeMB: fileInfo.sizeMB || 0,
          processingTimeMS: Math.round(processingTime),
          success,
          ...additionalData
        });
      }
    };
  }

  // Conversion tracking
  trackConversion(conversionType, value = 0, properties = {}) {
    const conversionEvent = {
      type: conversionType,
      value,
      timestamp: Date.now(),
      ...properties
    };

    this.userSession.conversionEvents.push(conversionEvent);

    this.trackEvent('conversion', {
      conversion_type: conversionType,
      conversion_value: value,
      ...properties
    });

    // Premium tracking removed - all features are now free
  }

  // Premium tracking removed

  // User preferences and behavior
  trackUserPreferences() {
    if (typeof window === 'undefined') return;

    const preferences = {
      theme: this.getUserPreference('theme') || 'dark',
      language: navigator.language || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      deviceType: this.getDeviceType()
    };

    this.trackEvent('user_preferences', preferences);
  }

  getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  // Performance monitoring
  setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Core Web Vitals
    this.observeWebVitals();
    
    // Custom performance metrics
    this.measurePageLoadTime();
    this.observeResourceLoading();
  }

  observeWebVitals() {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.trackEvent('core_web_vitals', {
        metric: 'LCP',
        value: Math.round(lastEntry.startTime),
        rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs_improvement' : 'poor'
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        this.trackEvent('core_web_vitals', {
          metric: 'FID',
          value: Math.round(entry.processingStart - entry.startTime),
          rating: entry.processingStart - entry.startTime < 100 ? 'good' : entry.processingStart - entry.startTime < 300 ? 'needs_improvement' : 'poor'
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.trackEvent('core_web_vitals', {
        metric: 'CLS',
        value: Math.round(clsValue * 1000) / 1000,
        rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs_improvement' : 'poor'
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  measurePageLoadTime() {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.trackEvent('page_performance', {
        metric: 'page_load_time',
        value: Math.round(loadTime),
        rating: loadTime < 2000 ? 'good' : loadTime < 4000 ? 'needs_improvement' : 'poor'
      });
    });
  }

  observeResourceLoading() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.initiatorType === 'script' || entry.initiatorType === 'link') {
          this.trackEvent('resource_performance', {
            resource: entry.name,
            type: entry.initiatorType,
            duration: Math.round(entry.duration),
            size: entry.transferSize || 0
          });
        }
      });
    }).observe({ entryTypes: ['resource'] });
  }

  // User preferences management
  getUserPreference(key) {
    if (typeof window === 'undefined') return null;
    
    try {
      const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
      return preferences[key];
    } catch {
      return null;
    }
  }

  setUserPreference(key, value) {
    if (typeof window === 'undefined') return;
    
    try {
      const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
      preferences[key] = value;
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      this.trackEvent('preference_updated', {
        preference: key,
        value: typeof value === 'object' ? JSON.stringify(value) : value
      });
    } catch (error) {
      console.warn('Failed to save user preference:', error);
    }
  }

  // Data management
  storeEvent(eventData) {
    if (typeof window === 'undefined') return;
    
    try {
      const events = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
      events.push(eventData);
      
      // Keep only last 100 events to prevent storage bloat
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('analyticsEvents', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  getAnalyticsData() {
    if (typeof window === 'undefined') return { events: [], session: {} };
    
    try {
      const events = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
      return {
        events,
        session: this.userSession
      };
    } catch {
      return { events: [], session: this.userSession };
    }
  }

  // A/B Testing support
  getVariant(testName, variants = ['A', 'B']) {
    const userId = this.getUserPreference('userId') || this.generateUserId();
    this.setUserPreference('userId', userId);
    
    // Simple hash-based assignment
    const hash = this.simpleHash(userId + testName);
    const variantIndex = hash % variants.length;
    const variant = variants[variantIndex];
    
    this.trackEvent('ab_test_assignment', {
      test_name: testName,
      variant,
      user_id: userId
    });
    
    return variant;
  }

  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Cleanup
  clearAnalyticsData() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('analyticsEvents');
    localStorage.removeItem('userPreferences');
    this.userSession = this.initializeSession();
  }
}

// Global analytics instance
const analytics = new AnalyticsManager();

// Convenience functions
export const trackEvent = (eventName, properties) => analytics.trackEvent(eventName, properties);
export const trackToolUsage = (toolName, properties) => analytics.trackToolUsage(toolName, properties);
export const trackFileProcessing = (toolName, fileInfo) => analytics.trackFileProcessing(toolName, fileInfo);
export const trackConversion = (type, value, properties) => analytics.trackConversion(type, value, properties);
export const getUserPreference = (key) => analytics.getUserPreference(key);
export const setUserPreference = (key, value) => analytics.setUserPreference(key, value);
export const getVariant = (testName, variants) => analytics.getVariant(testName, variants);

export default analytics;