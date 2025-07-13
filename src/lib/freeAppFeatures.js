// Free App Features System for easy-pdf
// Manages unlimited features with sponsor appreciation prompts

import { trackEvent, getUserPreference, setUserPreference } from './analytics';
import { trackSponsorView } from './sponsorAnalytics';

export const APP_FEATURES = {
  ALL_PDF_TOOLS: {
    name: 'All PDF Tools',
    description: 'Complete suite of PDF processing tools',
    available: true,
    category: 'core'
  },
  CLIENT_SIDE_PROCESSING: {
    name: 'Client-Side Processing',
    description: 'Your files never leave your device',
    available: true,
    category: 'privacy'
  },
  UNLIMITED_FILE_SIZE: {
    name: 'Large File Support',
    description: 'Process files up to browser memory limits',
    available: true,
    category: 'processing'
  },
  BATCH_PROCESSING: {
    name: 'Batch Processing',
    description: 'Process multiple files simultaneously',
    available: true,
    category: 'productivity'
  },
  AI_ANALYSIS: {
    name: 'AI Document Analysis',
    description: 'Advanced AI analysis for legal and medical documents',
    available: true,
    category: 'ai'
  },
  ADVANCED_OCR: {
    name: 'Advanced OCR',
    description: 'High-accuracy text extraction',
    available: true,
    category: 'ocr'
  },
  CUSTOM_COMPRESSION: {
    name: 'Custom Compression',
    description: 'Fine-tune compression settings',
    available: true,
    category: 'compression'
  },
  NO_DAILY_LIMITS: {
    name: 'Unlimited Operations',
    description: 'No daily limits on any operations',
    available: true,
    category: 'limits'
  }
};

class FreeAppManager {
  constructor() {
    this.usageStats = this.getUsageStats();
    this.appreciationHistory = this.getAppreciationHistory();
  }

  getUsageStats() {
    const today = new Date().toDateString();
    const stats = getUserPreference('usageStats') || {};
    
    // Initialize if new day or first time
    if (stats.date !== today) {
      stats.date = today;
      stats.operations = 0;
      stats.filesProcessed = 0;
      stats.totalSessions = (stats.totalSessions || 0) + 1;
      setUserPreference('usageStats', stats);
    }
    
    return stats;
  }

  getAppreciationHistory() {
    return getUserPreference('appreciationHistory') || {
      lastShown: null,
      totalShown: 0,
      contexts: {}
    };
  }

  // All features are always available
  canAccessFeature(featureKey) {
    const feature = APP_FEATURES[featureKey];
    return feature ? feature.available : true;
  }

  // No operation limits - everything is allowed
  canPerformOperation(_operationType = 'general', _fileSize = 0, _fileCount = 1) {
    return { allowed: true, reason: 'free_app' };
  }

  // Record usage for sponsor analytics
  recordUsage(operationType = 'general', fileCount = 1, fileSize = 0) {
    this.usageStats.operations += fileCount;
    this.usageStats.filesProcessed += fileCount;
    
    // Track for sponsor value
    trackEvent('app_usage', {
      operation_type: operationType,
      file_count: fileCount,
      file_size: fileSize,
      total_operations: this.usageStats.operations,
      session_operations: this.usageStats.operations
    });
    
    setUserPreference('usageStats', this.usageStats);
    
    // Check if we should show sponsor appreciation
    this.checkSponsorAppreciation(operationType, fileCount);
  }

  // Sponsor appreciation logic
  shouldShowSponsorAppreciation(context) {
    const now = Date.now();
    const lastShown = this.appreciationHistory.lastShown;
    const daysSinceLastShown = lastShown ? (now - lastShown) / (1000 * 60 * 60 * 24) : 999;
    
    // Don't show more than once per day
    if (daysSinceLastShown < 1) return false;
    
    // Don't show more than 3 times total per week
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const recentShown = Object.values(this.appreciationHistory.contexts)
      .filter(timestamp => timestamp > weekAgo).length;
    
    if (recentShown >= 3) return false;
    
    return this.getAppreciationStrategy(context);
  }

  getAppreciationStrategy(context) {
    const stats = this.usageStats;
    
    switch (context) {
      case 'milestone_reached':
        // Show every 25 operations
        return stats.operations > 0 && stats.operations % 25 === 0;
      
      case 'frequent_user':
        // Show for users with multiple sessions
        return stats.totalSessions >= 5;
      
      case 'feature_appreciation':
        // Show after using advanced features
        return stats.operations >= 10;
      
      case 'random_appreciation':
        // Occasionally show random appreciation
        return Math.random() < 0.05; // 5% chance
      
      default:
        return false;
    }
  }

  checkSponsorAppreciation(_operationType, _fileCount) {
    const contexts = ['milestone_reached', 'feature_appreciation'];
    
    for (const context of contexts) {
      if (this.shouldShowSponsorAppreciation(context)) {
        this.showSponsorAppreciation(context);
        break; // Only show one at a time
      }
    }
  }

  showSponsorAppreciation(context) {
    const now = Date.now();
    
    // Update history
    this.appreciationHistory.lastShown = now;
    this.appreciationHistory.totalShown++;
    this.appreciationHistory.contexts[context] = now;
    
    setUserPreference('appreciationHistory', this.appreciationHistory);
    
    // Track for analytics
    trackEvent('sponsor_appreciation_triggered', { 
      context,
      total_operations: this.usageStats.operations,
      total_sessions: this.usageStats.totalSessions
    });
    
    trackSponsorView('appreciation_prompt', 'modal', { context });
    
    return true;
  }

  getSponsorAppreciationContent(context) {
    const contents = {
      milestone_reached: {
        title: "🎉 You've processed many files!",
        message: "Thanks for using easy-pdf! Our sponsors make this possible.",
        cta: "View Our Sponsors"
      },
      frequent_user: {
        title: "❤️ Thanks for being a loyal user!",
        message: "Your continued use helps us attract sponsors who keep this free.",
        cta: "Support Our Sponsors"
      },
      feature_appreciation: {
        title: "☕ Enjoying the features?",
        message: "Show some love to our sponsors who make development possible!",
        cta: "Check Out Sponsors"
      },
      random_appreciation: {
        title: "🌟 Powered by Community",
        message: "easy-pdf stays free thanks to our sponsor community.",
        cta: "Meet Our Sponsors"
      }
    };
    
    return contents[context] || contents.random_appreciation;
  }

  // Analytics for sponsors
  getAppUsageAnalytics() {
    return {
      totalOperations: this.usageStats.operations,
      totalSessions: this.usageStats.totalSessions,
      filesProcessed: this.usageStats.filesProcessed,
      appreciationShown: this.appreciationHistory.totalShown,
      userEngagement: this.calculateEngagement()
    };
  }

  calculateEngagement() {
    const stats = this.usageStats;
    
    if (stats.totalSessions === 0) return 'new';
    if (stats.totalSessions >= 10) return 'highly_engaged';
    if (stats.totalSessions >= 5) return 'engaged';
    if (stats.totalSessions >= 2) return 'returning';
    return 'new';
  }

  // Export usage data for sponsor reports
  exportUsageData() {
    const data = {
      usageStats: this.usageStats,
      appreciationHistory: this.appreciationHistory,
      analytics: this.getAppUsageAnalytics(),
      features: APP_FEATURES,
      exportDate: new Date().toISOString()
    };

    trackEvent('usage_data_exported', {
      total_operations: this.usageStats.operations,
      engagement_level: this.calculateEngagement()
    });

    return data;
  }
}

// Global free app manager instance
const freeAppManager = new FreeAppManager();

// Convenience functions - all return true for free app
export const canAccessFeature = (featureKey) => freeAppManager.canAccessFeature(featureKey);
export const canPerformOperation = (type, fileSize, fileCount) => freeAppManager.canPerformOperation(type, fileSize, fileCount);
export const recordUsage = (type, fileCount, fileSize) => freeAppManager.recordUsage(type, fileCount, fileSize);
export const shouldShowSponsorAppreciation = (context) => freeAppManager.shouldShowSponsorAppreciation(context);
export const getSponsorAppreciationContent = (context) => freeAppManager.getSponsorAppreciationContent(context);
export const getAppUsageAnalytics = () => freeAppManager.getAppUsageAnalytics();
export const exportUsageData = () => freeAppManager.exportUsageData();

// Always return 'FREE' tier but with unlimited features
export const getCurrentTier = () => 'FREE_UNLIMITED';
export const getDailyUsage = () => freeAppManager.usageStats;

export default freeAppManager;