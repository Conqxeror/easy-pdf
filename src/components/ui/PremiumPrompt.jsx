// Premium Prompt Component
// Displays conversion prompts for premium features

import React, { useState  } from 'react';
import { X, Star, Zap, Shield, Clock } from 'lucide-react';
import { trackConversion } from '@/lib/analytics';
import { startTrial, getCurrentTier } from '@/lib/premiumFeatures';

const PremiumPrompt = ({ 
  context, 
  title, 
  message, 
  benefits = [], 
  cta = 'Upgrade Now',
  onClose,
  onUpgrade 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showTrial, setShowTrial] = useState(false);

  const handleStartTrial = async () => {
    setIsLoading(true);
    
    try {
      const result = startTrial('PREMIUM');
      if (result.success) {
        trackConversion('trial_started', 0, { context, source: 'premium_prompt' });
        onUpgrade?.();
        onClose?.();
      }
    } catch (error) {
      console.error('Failed to start trial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    trackConversion('upgrade_clicked', 0, { context, source: 'premium_prompt' });
    onUpgrade?.();
  };

  const handleClose = () => {
    trackConversion('premium_prompt_dismissed', 0, { context });
    onClose?.();
  };

  const getIcon = () => {
    switch (context) {
      case 'file_size_limit':
        return <Shield className="w-6 h-6 text-blue-400" />;
      case 'batch_limit':
        return <Zap className="w-6 h-6 text-blue-400" />;
      case 'daily_limit_warning':
        return <Clock className="w-6 h-6 text-blue-400" />;
      default:
        return <Star className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-6">{message}</p>

          {/* Benefits */}
          {benefits.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
                Premium Benefits
              </h4>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-300">
                    <Star className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trial offer */}
          {!showTrial && getCurrentTier() === 'FREE' && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 font-medium">7-Day Free Trial</p>
                  <p className="text-blue-400 text-sm">Try all premium features risk-free</p>
                </div>
                <button
                  onClick={() => setShowTrial(true)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Learn More
                </button>
              </div>
            </div>
          )}

          {/* Trial details */}
          {showTrial && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-4">
              <h4 className="text-green-300 font-medium mb-2">Free Trial Includes:</h4>
              <ul className="text-sm text-green-400 space-y-1">
                <li>• All premium features for 7 days</li>
                <li>• No credit card required</li>
                <li>• Cancel anytime</li>
                <li>• Full access to advanced tools</li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col space-y-3">
            {getCurrentTier() === 'FREE' && (
              <button
                onClick={handleStartTrial}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Start Free Trial
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleUpgrade}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {cta}
            </button>
            
            <button
              onClick={handleClose}
              className="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPrompt;