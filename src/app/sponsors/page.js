// Enhanced Sponsors Page
// Showcases sponsors with detailed analytics and value proposition

"use client";

import React, { useState, useEffect  } from 'react';
import { 
  Heart, 
  Star, 
  TrendingUp, 
  Users, 
  Globe, 
  Shield,
  Zap,
  Coffee,
  Award,
  ExternalLink,
  BarChart3,
  Target
} from 'lucide-react';
import { trackSponsorView, trackSponsorClick, getAllSponsorReports } from '@/lib/sponsorAnalytics';
import { trackEvent } from '@/lib/analytics';
import { getAppUsageAnalytics } from '@/lib/freeAppFeatures';

const SponsorsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [, setSponsorReports] = useState([]);

  useEffect(() => {
    // Load analytics data
    const appAnalytics = getAppUsageAnalytics();
    setAnalytics(appAnalytics);
    
    // Load sponsor reports
    const reports = getAllSponsorReports();
    setSponsorReports(reports);
    
    // Track page view
    trackEvent('sponsors_page_viewed');
    trackSponsorView('sponsors_page', 'full_page');
  }, []);

  const handleSponsorClick = (sponsorId, url, placement = 'main_page') => {
    trackSponsorClick(sponsorId, placement);
    if (typeof window === 'undefined') return;
    try {
      // Try to open in a new tab and defensively remove opener access
      const newWin = window.open(url, '_blank', 'noopener,noreferrer');
      try {
        if (newWin) newWin.opener = null;
      } catch {
        // ignore inability to set opener
      }
    } catch {
      // fallback: navigate (guarded)
      try { window.location.href = url; } catch { }
    }
  };

  // support keyboard accessibility for sponsor cards
  const handleSponsorKey = (e, sponsor) => {
    // Accept Enter and both common Space key identifiers for broad browser support
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      handleSponsorClick(sponsor.id, sponsor.url);
    }
  };

  const handleSponsorInquiryClick = () => {
    trackEvent('sponsor_inquiry_clicked');
    if (typeof window === 'undefined') return;
    try {
      // mailto navigation is a simple location change; guard for non-browser contexts
      window.location.href = 'mailto:kadriwalimohammad@gmail.com?subject=Sponsorship Inquiry';
    } catch {
      // ignore
    }
  };

  const sponsors = [
    {
      id: 'privacy_tools',
      name: 'PrivacyTools.io',
      description: 'Comprehensive privacy guides and tool recommendations',
      category: 'Privacy & Security',
      url: 'https://privacytools.io',
      logo: '🔒',
      tier: 'platinum',
      value: 'Protecting user privacy since 2015'
    },
    {
      id: 'pdf_toolkit',
      name: 'PDF Toolkit Pro',
      description: 'Advanced PDF manipulation software for professionals',
      category: 'Software Tools',
      url: 'https://pdftoolkit.example.com',
      logo: '📄',
      tier: 'gold',
      value: 'Professional PDF solutions'
    },
    {
      id: 'secure_cloud',
      name: 'SecureCloud Storage',
      description: 'End-to-end encrypted cloud storage for sensitive documents',
      category: 'Cloud Storage',
      url: 'https://securecloud.example.com',
      logo: '☁️',
      tier: 'gold',
      value: 'Zero-knowledge cloud storage'
    },
    {
      id: 'dev_tools',
      name: 'DevTools Suite',
      description: 'Essential development tools for modern developers',
      category: 'Developer Tools',
      url: 'https://devtools.example.com',
      logo: '⚡',
      tier: 'silver',
      value: 'Streamline your development workflow'
    },
    {
      id: 'business_forms',
      name: 'BusinessForms.net',
      description: 'Professional document templates and forms',
      category: 'Business Services',
      url: 'https://businessforms.example.com',
      logo: '📋',
      tier: 'silver',
      value: 'Professional document templates'
    }
  ];

  const getTierColor = (tier) => {
    switch (tier) {
      case 'platinum': return 'from-purple-500 to-pink-500';
      case 'gold': return 'from-yellow-400 to-orange-500';
      case 'silver': return 'from-gray-400 to-gray-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'platinum': return <Award className="w-5 h-5" />;
      case 'gold': return <Star className="w-5 h-5" />;
      case 'silver': return <Target className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Our Amazing Sponsors ❤️
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            These incredible partners make easy-pdf completely free for everyone. 
            Show them some love and check out their amazing services!
          </p>
          <div className="mt-4">
            <button
              onClick={handleSponsorInquiryClick}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              <Coffee className="w-4 h-4 mr-2" />
              Contact to Sponsor
            </button>
          </div>
          
          {/* App Stats */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{analytics.totalOperations?.toLocaleString() || '10,000+'}</div>
                <div className="text-sm text-gray-300">Files Processed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{analytics.totalSessions?.toLocaleString() || '5,000+'}</div>
                <div className="text-sm text-gray-300">User Sessions</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-gray-300">Free Forever</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-300">Files Uploaded</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sponsors Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Meet Our Sponsors</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            These trusted partners share our commitment to privacy, security, and providing 
            valuable tools to the community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              role="button"
              tabIndex={0}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all duration-300 hover:scale-105 cursor-pointer group"
              onClick={() => handleSponsorClick(sponsor.id, sponsor.url)}
              onKeyDown={(e) => handleSponsorKey(e, sponsor)}
              data-sponsor-id={sponsor.id}
              data-placement="main_grid"
            >
              {/* Tier Badge */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTierColor(sponsor.tier)} text-white mb-4`}>
                {getTierIcon(sponsor.tier)}
                <span className="ml-1 capitalize">{sponsor.tier} Sponsor</span>
              </div>

              {/* Logo and Name */}
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">{sponsor.logo}</div>
                <div>
                  <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                    {sponsor.name}
                  </h3>
                  <p className="text-sm text-gray-400">{sponsor.category}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 mb-4 line-clamp-3">
                {sponsor.description}
              </p>

              {/* Value Proposition */}
              <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-300 font-medium">
                  {sponsor.value}
                </p>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Click to visit</span>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why We Use Sponsors */}
      <div className="bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Sponsors?</h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              We believe in keeping powerful tools free and accessible. Our sponsor model 
              allows us to maintain the highest standards while never charging users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Privacy First</h3>
              <p className="text-gray-400">
                All sponsors are vetted for privacy practices. We only partner with 
                companies that respect user privacy and data protection.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
              <p className="text-gray-400">
                Our sponsors share our values of building tools that serve the community. 
                They help us keep improving without compromising our mission.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sustainable Growth</h3>
              <p className="text-gray-400">
                Sponsorships allow us to invest in new features, better performance, 
                and expanded capabilities while keeping everything free.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsor Value Metrics */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Sponsor Impact</h2>
          <p className="text-gray-400">
            See how our sponsors help deliver value to thousands of users
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <Globe className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">Global</div>
            <div className="text-sm text-gray-400">Worldwide reach</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">Growing</div>
            <div className="text-sm text-gray-400">User base expansion</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">Engaged</div>
            <div className="text-sm text-gray-400">High user engagement</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <Coffee className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">Trusted</div>
            <div className="text-sm text-gray-400">Community approved</div>
          </div>
        </div>
      </div>

      {/* Become a Sponsor CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Sponsor</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our community of sponsors and help keep powerful tools free for everyone
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <BarChart3 className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="font-semibold">Detailed Analytics</div>
              <div className="text-sm text-blue-100">Track your ROI with comprehensive metrics</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Target className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="font-semibold">Targeted Audience</div>
              <div className="text-sm text-blue-100">Reach privacy-conscious professionals</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Heart className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="font-semibold">Community Impact</div>
              <div className="text-sm text-blue-100">Support free tools for everyone</div>
            </div>
          </div>

          <button
            onClick={() => {
              trackEvent('sponsor_inquiry_clicked');
              window.location.href = 'mailto:kadriwalimohammad@gmail.com?subject=Sponsorship Inquiry';
            }}
            className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Get Sponsorship Info
          </button>
        </div>
      </div>

      {/* Thank You */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Thank You! 🙏</h2>
          <p className="text-gray-400">
            To our sponsors and users - you make this possible. Together, we&apos;re building 
            a better, more private, and more accessible web.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SponsorsPage;