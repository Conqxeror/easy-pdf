// Enhanced Tool Page Content Component
// Integrates premium features, analytics, and improved UX

import React, { useState, useEffect, Suspense, lazy  } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Analytics and Premium Features
import { trackEvent, trackFileProcessing } from '@/lib/analytics';
import { 
  canPerformOperation, 
  recordUsage, 
  shouldShowPremiumPrompt,
  getPremiumPromptContent,
  getCurrentTier 
} from '@/lib/premiumFeatures';
import { useUserPreferences } from '@/lib/userPreferences';

// UI Components
import PremiumPrompt from '@/components/ui/PremiumPrompt';
import PremiumBadge from '@/components/ui/PremiumBadge';
import UsageIndicator from '@/components/ui/UsageIndicator';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load components for better performance
const LazyBreadcrumb = lazy(() => import('@/components/Breadcrumb'));
const LazyRelatedTools = lazy(() => import('@/components/RelatedTools'));
const LazyFAQ = lazy(() => import('@/components/FAQ'));

const ToolPageContent = ({ 
  toolName,
  title,
  description,
  children,
  relatedTools = [],
  faqData = [],
  category = 'general',
  requiresPremium = false,
  premiumFeatures = []
}) => {
  const router = useRouter();
  const { addRecentTool } = useUserPreferences();
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [premiumPromptContext, setPremiumPromptContext] = useState(null);
  const [processingFiles, setProcessingFiles] = useState(false);

  useEffect(() => {
    // Track page view and add to recent tools
    trackEvent('tool_page_viewed', {
      tool_name: toolName,
      category,
      requires_premium: requiresPremium
    });
    
    addRecentTool(toolName);
  }, [toolName, category, requiresPremium, addRecentTool]);

  // File processing handler with premium checks
  const handleFileProcessing = async (files, processingFunction, options = {}) => {
    if (!files || files.length === 0) {
      toast.error('Please select files to process');
      return;
    }

    // Calculate total file size
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const totalSizeMB = totalSize / (1024 * 1024);

    // Check if operation is allowed
    const operationCheck = canPerformOperation(
      options.operationType || 'general',
      totalSizeMB,
      files.length
    );

    if (!operationCheck.allowed) {
      handleOperationLimit(operationCheck);
      return;
    }

    setProcessingFiles(true);
    const tracker = trackFileProcessing(toolName, {
      count: files.length,
      sizeMB: totalSizeMB
    });

    try {
      // Show processing notification
      if (files.length > 1) {
        toast.loading(`Processing ${files.length} files...`, {
          id: 'processing'
        });
      } else {
        toast.loading('Processing file...', {
          id: 'processing'
        });
      }

      // Execute the processing function
      const result = await processingFunction(files, options);

      // Record successful usage
      recordUsage(options.operationType || 'general', files.length);
      tracker.complete(true, {
        output_size_mb: result?.sizeMB || 0,
        compression_ratio: result?.compressionRatio || 0
      });

      toast.success('Processing completed successfully!', {
        id: 'processing'
      });

      // Check if we should show premium prompt after successful operation
      checkForPremiumPrompt('post_processing');

      return result;

    } catch (error) {
      console.error('Processing failed:', error);
      tracker.complete(false, { error: error.message });
      
      toast.error(error.message || 'Processing failed. Please try again.', {
        id: 'processing'
      });
      
      throw error;
    } finally {
      setProcessingFiles(false);
    }
  };

  // Handle operation limits
  const handleOperationLimit = (operationCheck) => {
    const { reason, limit, current } = operationCheck;
    
    let context, message;
    
    switch (reason) {
      case 'file_size_limit':
        context = 'file_size_limit';
        message = `File size limit exceeded. Maximum: ${limit}MB, Current: ${Math.round(current)}MB`;
        break;
      case 'batch_size_limit':
        context = 'batch_limit';
        message = `Too many files selected. Maximum: ${limit}, Selected: ${current}`;
        break;
      case 'daily_limit':
        context = 'daily_limit_warning';
        message = `Daily operation limit reached (${limit}). Upgrade for unlimited access.`;
        break;
      case 'ai_analysis_limit':
        context = 'ai_analysis_limit';
        message = `Daily AI analysis limit reached (${limit}). Upgrade for unlimited access.`;
        break;
      default:
        context = 'feature_discovery';
        message = 'This operation requires premium features.';
    }

    toast.error(message);
    showPremiumPromptWithContext(context);
  };

  // Premium prompt management
  const checkForPremiumPrompt = (context) => {
    if (shouldShowPremiumPrompt(context)) {
      showPremiumPromptWithContext(context);
    }
  };

  const showPremiumPromptWithContext = (context) => {
    setPremiumPromptContext(context);
    setShowPremiumPrompt(true);
  };

  const handlePremiumPromptClose = () => {
    setShowPremiumPrompt(false);
    setPremiumPromptContext(null);
  };

  const handleUpgrade = () => {
    trackEvent('upgrade_button_clicked', {
      source: 'tool_page',
      tool_name: toolName,
      context: premiumPromptContext
    });
    
    // In a real app, this would navigate to pricing/checkout
    router.push('/pricing');
  };

  // Get premium prompt content
  const promptContent = premiumPromptContext ? 
    getPremiumPromptContent(premiumPromptContext) : 
    null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Suspense fallback={<Skeleton className="h-6 w-64 mb-4" />}>
            <LazyBreadcrumb />
          </Suspense>
          
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Link>
            
            <div className="flex items-center space-x-3">
              <PremiumBadge />
              <UsageIndicator compact />
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{title}</h1>
              <p className="text-lg text-gray-300 mb-4">{description}</p>
              
              {/* Premium features indicator */}
              {requiresPremium && (
                <div className="flex items-center space-x-2 text-sm text-yellow-400 mb-4">
                  <Star className="w-4 h-4" />
                  <span>Premium feature</span>
                </div>
              )}
              
              {premiumFeatures.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Premium features available:</p>
                  <div className="flex flex-wrap gap-2">
                    {premiumFeatures.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-900/30 text-blue-300 border border-blue-700"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tool Interface */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
          {children({ 
            handleFileProcessing, 
            processingFiles, 
            showPremiumPrompt: showPremiumPromptWithContext,
            currentTier: getCurrentTier()
          })}
        </div>

        {/* Usage Indicator */}
        <div className="mb-8">
          <UsageIndicator />
        </div>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div className="mb-8">
            <Suspense fallback={
              <div className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            }>
              <LazyRelatedTools tools={relatedTools} />
            </Suspense>
          </div>
        )}

        {/* FAQ Section */}
        {faqData.length > 0 && (
          <div className="mb-8">
            <Suspense fallback={
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-700 rounded"></div>
                ))}
              </div>
            }>
              <LazyFAQ faqData={faqData} />
            </Suspense>
          </div>
        )}

        {/* Premium Prompt Modal */}
        {showPremiumPrompt && promptContent && (
          <PremiumPrompt
            context={premiumPromptContext}
            title={promptContent.title}
            message={promptContent.message}
            benefits={promptContent.benefits}
            cta={promptContent.cta}
            onClose={handlePremiumPromptClose}
            onUpgrade={handleUpgrade}
          />
        )}
      </div>
    </div>
  );
};

export default ToolPageContent;