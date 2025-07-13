// Usage Indicator Component
// Shows current usage against limits

import React, { useState, useEffect } from "react";
import { Progress } from '@/components/ui/progress';
import { getDailyUsage, getCurrentTier, PREMIUM_TIERS } from '@/lib/premiumFeatures';
import { AlertCircle, TrendingUp } from 'lucide-react';

const UsageIndicator = ({ className = '', compact = false }) => {
  const [usage, setUsage] = useState(getDailyUsage());
  const [tier, setTier] = useState(getCurrentTier());

  useEffect(() => {
    // Update usage every minute
    const interval = setInterval(() => {
      setUsage(getDailyUsage());
      setTier(getCurrentTier());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const limits = PREMIUM_TIERS[tier].limits;
  const operationsPercent = limits.dailyOperations === -1 ? 0 : (usage.operations / limits.dailyOperations) * 100;
  const aiAnalysisPercent = limits.aiAnalysis === -1 ? 0 : (usage.aiAnalysis / limits.aiAnalysis) * 100;

  const getProgressColor = (percent) => {
    if (percent < 50) return 'bg-green-500';
    if (percent < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getWarningLevel = (percent) => {
    if (percent >= 90) return 'high';
    if (percent >= 75) return 'medium';
    return 'low';
  };

  if (compact) {
    const maxPercent = Math.max(operationsPercent, aiAnalysisPercent);
    const warningLevel = getWarningLevel(maxPercent);
    
    if (warningLevel === 'low') return null;

    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <AlertCircle className={`w-4 h-4 ${warningLevel === 'high' ? 'text-red-400' : 'text-yellow-400'}`} />
        <span className="text-sm text-gray-400">
          {Math.round(maxPercent)}% daily limit used
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">Daily Usage</h3>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <TrendingUp className="w-3 h-3" />
          <span>{tier}</span>
        </div>
      </div>

      {/* Operations Usage */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Operations</span>
          <span className="text-gray-300">
            {usage.operations} / {limits.dailyOperations === -1 ? '∞' : limits.dailyOperations}
          </span>
        </div>
        {limits.dailyOperations !== -1 && (
          <Progress 
            value={operationsPercent} 
            className="h-2"
            indicatorClassName={getProgressColor(operationsPercent)}
          />
        )}
      </div>

      {/* AI Analysis Usage */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">AI Analysis</span>
          <span className="text-gray-300">
            {usage.aiAnalysis} / {limits.aiAnalysis === -1 ? '∞' : limits.aiAnalysis}
          </span>
        </div>
        {limits.aiAnalysis !== -1 && (
          <Progress 
            value={aiAnalysisPercent} 
            className="h-2"
            indicatorClassName={getProgressColor(aiAnalysisPercent)}
          />
        )}
      </div>

      {/* Warning messages */}
      {operationsPercent >= 75 && limits.dailyOperations !== -1 && (
        <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-700 rounded text-xs text-yellow-300">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          Approaching daily operations limit
        </div>
      )}

      {aiAnalysisPercent >= 75 && limits.aiAnalysis !== -1 && (
        <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-700 rounded text-xs text-yellow-300">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          Approaching AI analysis limit
        </div>
      )}
    </div>
  );
};

export default UsageIndicator;