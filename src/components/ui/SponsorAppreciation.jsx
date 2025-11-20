// Sponsor Appreciation Component
// Shows sponsor appreciation prompts instead of premium conversion

import React, { useState  } from 'react';
import { X, Heart, Star, Users, Coffee } from 'lucide-react';
// import { trackSponsorView, trackSponsorClick } from '@/lib/sponsorAnalytics'; // Feature incomplete
import { trackEvent } from '@/lib/analytics';

const SponsorAppreciation = ({ 
  context, 
  title: _title = "❤️ Enjoying easy-pdf?", 
  message: _message = "This app is completely free thanks to our amazing sponsors! Help us keep it that way by checking out their offers.",
  onClose,
  onViewSponsors 
}) => {
  const [isLoading] = useState(false);

  const handleViewSponsors = () => {
    trackEvent('sponsor_appreciation_action', { context, action: 'view_sponsors' });
    // trackSponsorClick('appreciation_prompt', 'modal', { context }); // Feature incomplete
    onViewSponsors?.();
  };

  const handleClose = () => {
    trackEvent('sponsor_appreciation_dismissed', { context });
    onClose?.();
  };

  const getIcon = () => {
    switch (context) {
      case 'milestone_reached':
        return <Star className="w-6 h-6 text-yellow-400 preserve-color" />;
      case 'frequent_user':
        return <Heart className="w-6 h-6 text-red-400 preserve-color" />;
      case 'feature_appreciation':
        return <Coffee className="w-6 h-6 text-orange-400 preserve-color" />;
      default:
        return <Users className="w-6 h-6 text-foreground" />;
    }
  };

  const getAppreciationContent = () => {
    const content = {
      milestone_reached: {
        title: "🎉 You've processed many files!",
        message: "Thanks for using easy-pdf! Our sponsors make this possible.",
        benefits: [
          "100% free PDF processing",
          "No file uploads or privacy concerns", 
          "Supported by trusted sponsors",
          "Always improving with new features"
        ]
      },
      frequent_user: {
        title: "❤️ Thanks for being a loyal user!",
        message: "Your continued use helps us attract sponsors who keep this free.",
        benefits: [
          "Free forever promise",
          "Privacy-first approach",
          "Community-driven development",
          "Sponsor-supported innovation"
        ]
      },
      feature_appreciation: {
        title: "☕ Enjoying the features?",
        message: "Show some love to our sponsors who make development possible!",
        benefits: [
          "All features completely free",
          "No subscriptions or hidden costs",
          "Ethical sponsor partnerships",
          "User-focused development"
        ]
      },
      default: {
        title: "🌟 Powered by Community",
        message: "easy-pdf stays free thanks to our sponsor community.",
        benefits: [
          "Zero cost to users",
          "Privacy-respecting sponsors",
          "Sustainable development model",
          "Community-first approach"
        ]
      }
    };

    return content[context] || content.default;
  };

  const appreciationContent = getAppreciationContent();

  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background dark:bg-background shadow-2xl max-w-md w-full border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <h3 className="text-xl font-semibold text-foreground">{appreciationContent.title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-foreground mb-6">{appreciationContent.message}</p>

          {/* Benefits */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3 uppercase tracking-wide">
              Why We Stay Free
            </h4>
            <ul className="space-y-2">
              {appreciationContent.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-sm text-foreground">
                  <Heart className="w-4 h-4 text-red-400 mr-2 flex-shrink-0 preserve-color" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Sponsor appreciation */}
          <div className="bg-gradient-to-r from-gray-900/30 to-gray-900/30 border border-border/50 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Our Amazing Sponsors</p>
                <p className="text-foreground text-sm">Supporting free tools for everyone</p>
              </div>
              <Star className="w-6 h-6 text-yellow-400 preserve-color" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleViewSponsors}
              disabled={isLoading}
              className="w-full bg-background hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed text-foreground font-medium py-3 px-4 transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  View Our Sponsors
                </>
              )}
            </button>
            
            <button
              onClick={handleClose}
              className="w-full text-foreground hover:text-foreground text-sm py-2 transition-colors"
            >
              Continue Using App
            </button>
          </div>

          {/* Thank you note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-foreground">
              Thank you for supporting our sponsor ecosystem! 🙏
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorAppreciation;