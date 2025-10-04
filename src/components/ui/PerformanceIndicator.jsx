// Enhanced Tool Performance Component
import React, { useState, useEffect, memo  } from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { performanceMonitor } from '@/lib/enhancedPerformance';

const PerformanceIndicator = memo(({ toolName, className = "" }) => {
  const [metrics, setMetrics] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      const stats = performanceMonitor.getStats(toolName);
      setMetrics(stats);
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, [toolName]);

  if (!metrics || metrics.count === 0) {
    return null;
  }

  const getPerformanceColor = (avg) => {
    if (avg < 100) return 'text-green-500';
    if (avg < 500) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className={`${className}`}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        title="Performance metrics"
      >
        <Activity className="w-4 h-4" />
        <span>Performance</span>
      </button>
      
      {isVisible && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-gray-950 border border-gray-700 shadow-lg z-50 min-w-[280px]">
          <h4 className="font-semibold mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance Metrics
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Operations:</span>
              <span className="font-medium">{metrics.count}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average time:</span>
              <span className={`font-medium ${getPerformanceColor(metrics.average)}`}>
                {formatTime(metrics.average)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Fastest:</span>
              <span className="font-medium text-green-500">
                {formatTime(metrics.min)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Slowest:</span>
              <span className="font-medium text-red-500">
                {formatTime(metrics.max)}
              </span>
            </div>
            
            {metrics.recent && metrics.recent.length > 0 && (
              <div className="pt-2 border-t border-gray-600">
                <span className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                  Recent trend:
                </span>
                <div className="flex space-x-1">
                  {metrics.recent.map((time, index) => (
                    <div
                      key={index}
                      className={`w-2 h-8 ${getPerformanceColor(time).replace('text-', 'bg-')}`}
                      style={{
                        height: `${Math.min((time / Math.max(...metrics.recent)) * 32, 32)}px`
                      }}
                      title={formatTime(time)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

PerformanceIndicator.displayName = 'PerformanceIndicator';

export default PerformanceIndicator;