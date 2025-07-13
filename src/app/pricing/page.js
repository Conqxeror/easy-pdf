// Pricing Page for easy-pdf
// Displays subscription tiers and handles upgrades

"use client";

import React, { useState  } from 'react';
import { Check, Star, Crown, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { trackConversion } from '@/lib/analytics';
import { PREMIUM_TIERS, startTrial, getCurrentTier, isTrialActive } from '@/lib/premiumFeatures';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const currentTier = getCurrentTier();
  const trialActive = isTrialActive();

  const handleStartTrial = async (tier) => {
    setIsLoading(true);
    
    try {
      const result = startTrial(tier);
      if (result.success) {
        trackConversion('trial_started', 0, { 
          tier, 
          source: 'pricing_page',
          billing_cycle: billingCycle 
        });
        
        // Redirect to dashboard or show success message
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Failed to start trial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (tier) => {
    trackConversion('upgrade_clicked', PREMIUM_TIERS[tier].price, { 
      tier, 
      source: 'pricing_page',
      billing_cycle: billingCycle 
    });
    
    // In a real app, this would integrate with Stripe/PayPal
    alert(`Upgrade to ${tier} - Integration with payment processor would happen here`);
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'PRO':
        return <Crown className="w-6 h-6" />;
      case 'PREMIUM':
        return <Star className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'PRO':
        return 'border-purple-500 bg-purple-900/20';
      case 'PREMIUM':
        return 'border-blue-500 bg-blue-900/20';
      default:
        return 'border-gray-600 bg-gray-800/50';
    }
  };

  const getButtonColor = (tier) => {
    switch (tier) {
      case 'PRO':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'PREMIUM':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const isCurrentTier = (tier) => currentTier === tier;
  const isHigherTier = (tier) => {
    const tierOrder = ['FREE', 'PREMIUM', 'PRO'];
    return tierOrder.indexOf(tier) > tierOrder.indexOf(currentTier);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Unlock powerful features while keeping your privacy intact. All plans include 100% client-side processing.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Yearly
              <span className="ml-1 text-green-400 text-sm">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {Object.entries(PREMIUM_TIERS).map(([tierKey, tier]) => {
            const price = billingCycle === 'yearly' ? tier.price * 12 * 0.8 : tier.price;
            const isPopular = tierKey === 'PREMIUM';
            
            return (
              <div
                key={tierKey}
                className={`relative rounded-2xl border-2 p-8 ${getTierColor(tierKey)} ${
                  isPopular ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentTier(tierKey) && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                    tierKey === 'PRO' ? 'bg-purple-600' : tierKey === 'PREMIUM' ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    {getTierIcon(tierKey)}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  
                  <div className="mb-4">
                    {tierKey === 'FREE' ? (
                      <span className="text-4xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">
                          ${billingCycle === 'yearly' ? Math.round(price) : price}
                        </span>
                        <span className="text-gray-400 ml-1">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </>
                    )}
                  </div>

                  {billingCycle === 'yearly' && tierKey !== 'FREE' && (
                    <p className="text-green-400 text-sm">
                      Save ${Math.round(tier.price * 12 * 0.2)}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limits */}
                <div className="mb-8 p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-medium mb-3 text-gray-300">Usage Limits</h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>File size limit:</span>
                      <span>{tier.limits.fileSize}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Batch processing:</span>
                      <span>{tier.limits.filesPerBatch} files</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily operations:</span>
                      <span>{tier.limits.dailyOperations === -1 ? 'Unlimited' : tier.limits.dailyOperations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI analysis:</span>
                      <span>{tier.limits.aiAnalysis === -1 ? 'Unlimited' : `${tier.limits.aiAnalysis}/day`}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="space-y-3">
                  {isCurrentTier(tierKey) ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-lg bg-gray-600 text-gray-400 font-medium cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : tierKey === 'FREE' ? (
                    <Link
                      href="/"
                      className="w-full inline-flex items-center justify-center py-3 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors"
                    >
                      Get Started Free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  ) : !trialActive && currentTier === 'FREE' ? (
                    <button
                      onClick={() => handleStartTrial(tierKey)}
                      disabled={isLoading}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${getButtonColor(tierKey)} text-white disabled:opacity-50`}
                    >
                      {isLoading ? 'Starting...' : 'Start 7-Day Free Trial'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(tierKey)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${getButtonColor(tierKey)} text-white`}
                    >
                      {isHigherTier(tierKey) ? 'Upgrade Now' : 'Choose Plan'}
                    </button>
                  )}

                  {tierKey !== 'FREE' && !trialActive && currentTier === 'FREE' && (
                    <p className="text-center text-sm text-gray-400">
                      No credit card required for trial
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Is my data safe?</h3>
              <p className="text-gray-300">
                Absolutely! All processing happens in your browser. Your files never leave your device, 
                ensuring complete privacy and security.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Can I cancel anytime?</h3>
              <p className="text-gray-300">
                Yes, you can cancel your subscription at any time. You&apos;ll continue to have access 
                to premium features until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-300">
                We accept all major credit cards, PayPal, and various regional payment methods 
                including UPI for Indian users.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Do you offer refunds?</h3>
              <p className="text-gray-300">
                Yes, we offer a 30-day money-back guarantee. If you&apos;re not satisfied with our 
                premium features, we&apos;ll provide a full refund.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-8 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Ready to supercharge your PDF workflow?</h2>
            <p className="text-gray-300 mb-6">
              Join thousands of users who trust our privacy-first approach to PDF processing.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;