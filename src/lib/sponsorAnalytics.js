// Sponsor Analytics and Value Tracking System
// Provides comprehensive metrics to demonstrate sponsor ROI

import { trackEvent } from './analytics';

class SponsorAnalytics {
  constructor() {
    this.sponsorMetrics = this.loadSponsorMetrics();
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;
    this.trackSponsorExposure();
    this.setupSponsorTracking();
  }

  loadSponsorMetrics() {
    if (typeof window === 'undefined') return {};
    
    try {
      return JSON.parse(localStorage.getItem('sponsorMetrics') || '{}');
    } catch {
      return {};
    }
  }

  saveSponsorMetrics() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('sponsorMetrics', JSON.stringify(this.sponsorMetrics));
    } catch (error) {
      console.warn('Failed to save sponsor metrics:', error);
    }
  }

  // Track sponsor visibility and engagement
  trackSponsorView(sponsorId, placement, context = {}) {
    const today = new Date().toDateString();
    
    if (!this.sponsorMetrics[sponsorId]) {
      this.sponsorMetrics[sponsorId] = {
        totalViews: 0,
        dailyViews: {},
        placements: {},
        clicks: 0,
        conversions: 0,
        firstSeen: today
      };
    }

    const sponsor = this.sponsorMetrics[sponsorId];
    
    // Update view counts
    sponsor.totalViews++;
    sponsor.dailyViews[today] = (sponsor.dailyViews[today] || 0) + 1;
    sponsor.placements[placement] = (sponsor.placements[placement] || 0) + 1;
    
    this.saveSponsorMetrics();

    // Track in analytics
    trackEvent('sponsor_view', {
      sponsor_id: sponsorId,
      placement,
      total_views: sponsor.totalViews,
      daily_views: sponsor.dailyViews[today],
      ...context
    });
  }

  trackSponsorClick(sponsorId, placement, context = {}) {
    if (!this.sponsorMetrics[sponsorId]) {
      this.trackSponsorView(sponsorId, placement, context);
    }

    this.sponsorMetrics[sponsorId].clicks++;
    this.saveSponsorMetrics();

    trackEvent('sponsor_click', {
      sponsor_id: sponsorId,
      placement,
      total_clicks: this.sponsorMetrics[sponsorId].clicks,
      ctr: this.calculateCTR(sponsorId),
      ...context
    });
  }

  trackSponsorConversion(sponsorId, conversionType, value = 0, context = {}) {
    if (!this.sponsorMetrics[sponsorId]) return;

    this.sponsorMetrics[sponsorId].conversions++;
    this.saveSponsorMetrics();

    trackEvent('sponsor_conversion', {
      sponsor_id: sponsorId,
      conversion_type: conversionType,
      value,
      total_conversions: this.sponsorMetrics[sponsorId].conversions,
      conversion_rate: this.calculateConversionRate(sponsorId),
      ...context
    });
  }

  // Calculate sponsor performance metrics
  calculateCTR(sponsorId) {
    const sponsor = this.sponsorMetrics[sponsorId];
    if (!sponsor || sponsor.totalViews === 0) return 0;
    return (sponsor.clicks / sponsor.totalViews * 100).toFixed(2);
  }

  calculateConversionRate(sponsorId) {
    const sponsor = this.sponsorMetrics[sponsorId];
    if (!sponsor || sponsor.clicks === 0) return 0;
    return (sponsor.conversions / sponsor.clicks * 100).toFixed(2);
  }

  getDailyViews(sponsorId, days = 30) {
    const sponsor = this.sponsorMetrics[sponsorId];
    if (!sponsor) return [];

    const result = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      
      result.push({
        date: dateString,
        views: sponsor.dailyViews[dateString] || 0
      });
    }
    
    return result;
  }

  // Generate sponsor reports
  generateSponsorReport(sponsorId) {
    const sponsor = this.sponsorMetrics[sponsorId];
    if (!sponsor) return null;

    const dailyViews = this.getDailyViews(sponsorId);
    const avgDailyViews = dailyViews.reduce((sum, day) => sum + day.views, 0) / dailyViews.length;
    
    return {
      sponsorId,
      totalViews: sponsor.totalViews,
      totalClicks: sponsor.clicks,
      totalConversions: sponsor.conversions,
      ctr: this.calculateCTR(sponsorId),
      conversionRate: this.calculateConversionRate(sponsorId),
      avgDailyViews: Math.round(avgDailyViews),
      dailyViews,
      placements: sponsor.placements,
      firstSeen: sponsor.firstSeen,
      daysActive: Math.ceil((new Date() - new Date(sponsor.firstSeen)) / (1000 * 60 * 60 * 24))
    };
  }

  getAllSponsorReports() {
    return Object.keys(this.sponsorMetrics).map(sponsorId => 
      this.generateSponsorReport(sponsorId)
    ).filter(Boolean);
  }

  // Track user demographics for sponsor value
  trackUserDemographics() {
    const demographics = {
      country: this.getCountryFromTimezone(),
      language: navigator.language || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      deviceType: this.getDeviceType(),
      screenResolution: `${screen.width}x${screen.height}`,
      browserLanguage: navigator.language,
      platform: navigator.platform
    };

    trackEvent('user_demographics', demographics);
    return demographics;
  }

  getCountryFromTimezone() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Simple mapping for common timezones
    const timezoneToCountry = {
      'Asia/Kolkata': 'India',
      'America/New_York': 'United States',
      'Europe/London': 'United Kingdom',
      'Asia/Tokyo': 'Japan',
      'Australia/Sydney': 'Australia'
    };
    return timezoneToCountry[timezone] || 'Unknown';
  }

  getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  // Setup automatic sponsor exposure tracking
  setupSponsorTracking() {
    // Track sponsor elements when they come into view
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const sponsorId = element.dataset.sponsorId;
            const placement = element.dataset.placement;
            
            if (sponsorId && placement) {
              this.trackSponsorView(sponsorId, placement, {
                visibility_ratio: entry.intersectionRatio,
                viewport_position: entry.boundingClientRect.top
              });
            }
          }
        });
      }, {
        threshold: 0.5, // Track when 50% visible
        rootMargin: '0px'
      });

      // Observe all sponsor elements
      setTimeout(() => {
        document.querySelectorAll('[data-sponsor-id]').forEach(element => {
          observer.observe(element);
        });
      }, 1000);
    }
  }

  trackSponsorExposure() {
    // Track overall sponsor exposure metrics
    const sponsorElements = document.querySelectorAll('[data-sponsor-id]');
    
    trackEvent('sponsor_exposure', {
      total_sponsor_elements: sponsorElements.length,
      page_url: window.location.href,
      timestamp: Date.now()
    });
  }

  // Export data for sponsor reports
  exportSponsorData() {
    const reports = this.getAllSponsorReports();
    const exportData = {
      reports,
      summary: {
        totalSponsors: reports.length,
        totalViews: reports.reduce((sum, r) => sum + r.totalViews, 0),
        totalClicks: reports.reduce((sum, r) => sum + r.totalClicks, 0),
        avgCTR: (reports.reduce((sum, r) => sum + parseFloat(r.ctr), 0) / reports.length).toFixed(2),
        exportDate: new Date().toISOString()
      },
      userDemographics: this.trackUserDemographics()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sponsor-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    trackEvent('sponsor_data_exported', {
      total_sponsors: reports.length,
      date_range: '30_days'
    });

    return exportData;
  }
}

// Global sponsor analytics instance
const sponsorAnalytics = new SponsorAnalytics();

// Convenience functions
export const trackSponsorView = (sponsorId, placement, context) => 
  sponsorAnalytics.trackSponsorView(sponsorId, placement, context);

export const trackSponsorClick = (sponsorId, placement, context) => 
  sponsorAnalytics.trackSponsorClick(sponsorId, placement, context);

export const trackSponsorConversion = (sponsorId, type, value, context) => 
  sponsorAnalytics.trackSponsorConversion(sponsorId, type, value, context);

export const getSponsorReport = (sponsorId) => 
  sponsorAnalytics.generateSponsorReport(sponsorId);

export const getAllSponsorReports = () => 
  sponsorAnalytics.getAllSponsorReports();

export const exportSponsorData = () => 
  sponsorAnalytics.exportSponsorData();

export default sponsorAnalytics;