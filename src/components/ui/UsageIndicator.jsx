// Simple Usage Indicator Component (Premium functionality removed)
// Shows that all features are now unlimited

import React from "react";
import { CheckCircle } from 'lucide-react';

const UsageIndicator = ({ className = '', compact = false }) => {
  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <CheckCircle className="w-4 h-4 text-green-400" />
        <span className="text-sm text-gray-400">
          Unlimited usage
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-gray-950 border border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">Usage Status</h3>
        <div className="flex items-center space-x-1 text-xs text-green-400">
            <CheckCircle className="w-3 h-3 preserve-color" />
          <span>Unlimited</span>
        </div>
      </div>

      <div className="text-center py-4">
  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2 preserve-color" />
        <p className="text-sm text-gray-300 mb-1">All Features Unlimited</p>
        <p className="text-xs text-gray-400">
          No daily limits • No file size restrictions • All tools available
        </p>
      </div>
    </div>
  );
};

export default UsageIndicator;