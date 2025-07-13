// Premium Badge Component
// Shows user's current tier and trial status

import React from "react";
import { Crown, Star, Zap } from 'lucide-react';
import { getCurrentTier, isTrialActive, getTrialDaysRemaining } from '@/lib/premiumFeatures';

const PremiumBadge = ({ className = '', showDetails = false }) => {
  const currentTier = getCurrentTier();
  const trialActive = isTrialActive();
  const daysRemaining = getTrialDaysRemaining();

  const getTierConfig = () => {
    if (trialActive) {
      return {
        icon: Star,
        label: `Premium Trial (${daysRemaining}d)`,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/30',
        borderColor: 'border-yellow-700'
      };
    }

    switch (currentTier) {
      case 'PRO':
        return {
          icon: Crown,
          label: 'Pro',
          color: 'text-purple-400',
          bgColor: 'bg-purple-900/30',
          borderColor: 'border-purple-700'
        };
      case 'PREMIUM':
        return {
          icon: Star,
          label: 'Premium',
          color: 'text-blue-400',
          bgColor: 'bg-blue-900/30',
          borderColor: 'border-blue-700'
        };
      default:
        return {
          icon: Zap,
          label: 'Free',
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/30',
          borderColor: 'border-gray-700'
        };
    }
  };

  const config = getTierConfig();
  const Icon = config.icon;

  if (!showDetails && currentTier === 'FREE' && !trialActive) {
    return null; // Don't show badge for free users unless details are requested
  }

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${config.bgColor} ${config.borderColor} ${className}`}>
      <Icon className={`w-4 h-4 mr-2 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};

export default PremiumBadge;