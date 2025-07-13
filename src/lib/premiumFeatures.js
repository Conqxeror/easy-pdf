// Premium Features System for easy-pdf
// Manages premium feature access, trials, and conversion prompts

import { trackConversion, getUserPreference, setUserPreference } from './analytics';

export const PREMIUM_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    limits: {
      fileSize: 25, // MB
      filesPerBatch: 5,
      dailyOperations: 50,
      aiAnalysis: 2 // per day
    },
    features: [
      'All basic PDF tools',
      'Client-side processing',
      'No file uploads',
      'Basic file compression'
    ]
  },
  PREMIUM: {
    name: 'Premium',
    price: 9.99, // USD per month
    limits: {
      fileSize: 100, // MB
      filesPerBatch: 50,
      dailyOperations: 1000,
      aiAnalysis: 100 // per day
    },
    features: [
      'Everything in Free',
      'Advanced AI document analysis',
      'Batch processing up to 50 files',
      'Priority processing',
      'Advanced OCR with 99%+ accuracy',
      'Custom compression settings',
      'No daily limits',
      'Email support'
    ]
  },
  PRO: {
    name: 'Pro',
    price: 19.99, // USD per month
    limits: {
      fileSize: 500, // MB
      filesPerBatch: 200,
      dailyOperations: -1, // unlimited
      aiAnalysis: -1 // unlimited
    },
    features: [
      'Everything in Premium',
      'Unlimited file processing',
      'API access',
      'Custom branding options',
      'Advanced analytics',
      'Priority support',
      'Team collaboration features',
      'White-label options'
    ]
  }
};

export const PREMIUM_FEATURES = {
  AI_ANALYSIS_PRO: {
    name: 'AI Document Analysis Pro',
    description: 'Advanced AI analysis with legal, medical, and financial document insights',
    tier: 'PREMIUM',
    category: 'ai'
  },
  BATCH_PROCESSING: {
    name: 'Batch Processing',
    description: 'Process up to 50 files simultaneously',
    tier: 'PREMIUM',
    category: 'productivity'
  },
  ADVANCED_OCR: {
    name: 'Advanced OCR',
    description: '99%+ accuracy OCR with multiple language support',
    tier: 'PREMIUM',
    category: 'ocr'
  },
  CUSTOM_COMPRESSION: {
    name: 'Custom Compression',
    description: 'Fine-tune compression settings for optimal results',
    tier: 'PREMIUM',
    category: 'compression'
  },
  API_ACCESS: {
    name: 'API Access',
    description: 'Integrate PDF processing into your applications',
    tier: 'PRO',
    category: 'developer'
  },
  UNLIMITED_PROCESSING: {
    name: 'Unlimited Processing',
    description: 'No daily limits on file operations',
    tier: 'PRO',
    category: 'limits'
  },
  TEAM_COLLABORATION: {
    name: 'Team Collaboration',
    description: 'Share settings and templates with your team',
    tier: 'PRO',
    category: 'collaboration'
  }
};

class PremiumManager {
  constructor() {
    this.userTier = this.getCurrentTier();
    this.dailyUsage = this.getDailyUsage();
    this.trialStatus = this.getTrialStatus();
  }

  getCurrentTier() {
    // In a real app, this would check subscription status
    // For now, everyone starts as FREE
    return getUserPreference('userTier') || 'FREE';
  }

  getDailyUsage() {
    const today = new Date().toDateString();
    const usage = getUserPreference('dailyUsage') || {};
    
    // Reset if it's a new day
    if (usage.date !== today) {
      usage.date = today;
      usage.operations = 0;
      usage.aiAnalysis = 0;
      setUserPreference('dailyUsage', usage);
    }
    
    return usage;
  }

  getTrialStatus() {
    return getUserPreference('trialStatus') || {
      hasTrialed: false,
      trialStartDate: null,
      trialEndDate: null,
      isActive: false
    };
  }

  // Check if user can access a feature
  canAccessFeature(featureKey) {
    const feature = PREMIUM_FEATURES[featureKey];
    if (!feature) return true; // Unknown features are accessible
    
    const requiredTier = feature.tier;
    const userTier = this.userTier;
    
    // Check tier hierarchy
    const tierOrder = ['FREE', 'PREMIUM', 'PRO'];
    const userTierIndex = tierOrder.indexOf(userTier);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);
    
    return userTierIndex >= requiredTierIndex || this.isTrialActive();
  }

  // Check usage limits
  canPerformOperation(operationType = 'general', fileSize = 0, fileCount = 1) {
    const limits = PREMIUM_TIERS[this.userTier].limits;
    
    // Check file size limit
    if (fileSize > limits.fileSize) {
      return {
        allowed: false,
        reason: 'file_size_limit',
        limit: limits.fileSize,
        current: fileSize
      };
    }
    
    // Check batch size limit
    if (fileCount > limits.filesPerBatch) {
      return {
        allowed: false,
        reason: 'batch_size_limit',
        limit: limits.filesPerBatch,
        current: fileCount
      };
    }
    
    // Check daily operations limit
    if (limits.dailyOperations !== -1 && this.dailyUsage.operations >= limits.dailyOperations) {
      return {
        allowed: false,
        reason: 'daily_limit',
        limit: limits.dailyOperations,
        current: this.dailyUsage.operations
      };
    }
    
    // Check AI analysis limit
    if (operationType === 'ai_analysis' && limits.aiAnalysis !== -1 && this.dailyUsage.aiAnalysis >= limits.aiAnalysis) {
      return {
        allowed: false,
        reason: 'ai_analysis_limit',
        limit: limits.aiAnalysis,
        current: this.dailyUsage.aiAnalysis
      };
    }
    
    return { allowed: true };
  }

  // Record usage
  recordUsage(operationType = 'general', fileCount = 1) {
    this.dailyUsage.operations += fileCount;
    
    if (operationType === 'ai_analysis') {
      this.dailyUsage.aiAnalysis += 1;
    }
    
    setUserPreference('dailyUsage', this.dailyUsage);
  }

  // Trial management
  startTrial(tier = 'PREMIUM') {
    if (this.trialStatus.hasTrialed) {
      return { success: false, reason: 'already_trialed' };
    }
    
    const trialDuration = 7; // days
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (trialDuration * 24 * 60 * 60 * 1000));
    
    const newTrialStatus = {
      hasTrialed: true,
      trialStartDate: startDate.toISOString(),
      trialEndDate: endDate.toISOString(),
      isActive: true,
      tier
    };
    
    setUserPreference('trialStatus', newTrialStatus);
    setUserPreference('userTier', tier);
    
    this.trialStatus = newTrialStatus;
    this.userTier = tier;
    
    trackConversion('trial_started', 0, { tier });
    
    return { success: true, endDate };
  }

  isTrialActive() {
    if (!this.trialStatus.isActive) return false;
    
    const endDate = new Date(this.trialStatus.trialEndDate);
    const now = new Date();
    
    if (now > endDate) {
      // Trial expired
      this.endTrial();
      return false;
    }
    
    return true;
  }

  endTrial() {
    const updatedTrialStatus = {
      ...this.trialStatus,
      isActive: false
    };
    
    setUserPreference('trialStatus', updatedTrialStatus);
    setUserPreference('userTier', 'FREE');
    
    this.trialStatus = updatedTrialStatus;
    this.userTier = 'FREE';
    
    trackConversion('trial_ended', 0, { tier: this.trialStatus.tier });
  }

  getTrialDaysRemaining() {
    if (!this.isTrialActive()) return 0;
    
    const endDate = new Date(this.trialStatus.trialEndDate);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  // Premium prompts and conversion
  shouldShowPremiumPrompt(context) {
    const promptHistory = getUserPreference('premiumPrompts') || {};
    const today = new Date().toDateString();
    
    // Don't show if already premium
    if (this.userTier !== 'FREE') return false;
    
    // Don't show more than 3 prompts per day
    if (promptHistory[today] >= 3) return false;
    
    // Show based on context
    const showPrompt = this.getPromptStrategy(context);
    
    if (showPrompt) {
      // Record prompt shown
      promptHistory[today] = (promptHistory[today] || 0) + 1;
      setUserPreference('premiumPrompts', promptHistory);
      
      trackConversion('premium_prompt_shown', 0, { context });
    }
    
    return showPrompt;
  }

  getPromptStrategy(context) {
    const usage = this.dailyUsage;
    const limits = PREMIUM_TIERS.FREE.limits;
    
    switch (context) {
      case 'file_size_limit':
        return true; // Always show when hitting file size limit
      
      case 'batch_limit':
        return true; // Always show when hitting batch limit
      
      case 'daily_limit_warning':
        return usage.operations >= limits.dailyOperations * 0.8; // Show at 80% of daily limit
      
      case 'ai_analysis_limit':
        return usage.aiAnalysis >= limits.aiAnalysis; // Show when hitting AI limit
      
      case 'feature_discovery':
        return usage.operations >= 10; // Show after 10 operations
      
      default:
        return false;
    }
  }

  getPremiumPromptContent(context) {
    const prompts = {
      file_size_limit: {
        title: 'File Too Large',
        message: 'Upgrade to Premium to process files up to 100MB',
        cta: 'Upgrade Now',
        benefits: ['100MB file limit', 'Batch processing', 'Advanced AI analysis']
      },
      batch_limit: {
        title: 'Process More Files',
        message: 'Premium users can process up to 50 files at once',
        cta: 'Start Free Trial',
        benefits: ['50 files per batch', 'No daily limits', 'Priority processing']
      },
      daily_limit_warning: {
        title: 'Almost at Daily Limit',
        message: 'Upgrade for unlimited daily operations',
        cta: 'Go Premium',
        benefits: ['Unlimited operations', 'Advanced features', 'Priority support']
      },
      ai_analysis_limit: {
        title: 'AI Analysis Limit Reached',
        message: 'Get unlimited AI analysis with Premium',
        cta: 'Upgrade Now',
        benefits: ['Unlimited AI analysis', 'Advanced insights', 'Multiple document types']
      },
      feature_discovery: {
        title: 'Unlock Advanced Features',
        message: 'See what Premium can do for your workflow',
        cta: 'Try Free for 7 Days',
        benefits: ['All premium features', 'No commitment', 'Cancel anytime']
      }
    };
    
    return prompts[context] || prompts.feature_discovery;
  }

  // Subscription management (placeholder for real implementation)
  async subscribe(tier, paymentMethod) {
    // This would integrate with Stripe, PayPal, or other payment processors
    // For now, simulate successful subscription
    
    trackConversion('subscription_started', PREMIUM_TIERS[tier].price, { 
      tier, 
      payment_method: paymentMethod 
    });
    
    setUserPreference('userTier', tier);
    this.userTier = tier;
    
    return { success: true, subscriptionId: 'sub_' + Date.now() };
  }

  async cancelSubscription() {
    trackConversion('subscription_cancelled', 0, { tier: this.userTier });
    
    setUserPreference('userTier', 'FREE');
    this.userTier = 'FREE';
    
    return { success: true };
  }
}

// Global premium manager instance
const premiumManager = new PremiumManager();

// Convenience functions
export const canAccessFeature = (featureKey) => premiumManager.canAccessFeature(featureKey);
export const canPerformOperation = (type, fileSize, fileCount) => premiumManager.canPerformOperation(type, fileSize, fileCount);
export const recordUsage = (type, fileCount) => premiumManager.recordUsage(type, fileCount);
export const shouldShowPremiumPrompt = (context) => premiumManager.shouldShowPremiumPrompt(context);
export const getPremiumPromptContent = (context) => premiumManager.getPremiumPromptContent(context);
export const startTrial = (tier) => premiumManager.startTrial(tier);
export const isTrialActive = () => premiumManager.isTrialActive();
export const getTrialDaysRemaining = () => premiumManager.getTrialDaysRemaining();
export const getCurrentTier = () => premiumManager.userTier;
export const getDailyUsage = () => premiumManager.dailyUsage;

export default premiumManager;