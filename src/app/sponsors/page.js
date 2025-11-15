// Enhanced Sponsors Page
// Showcases sponsors with detailed analytics and value proposition

"use client";

import React, { useState, useEffect } from 'react';
import {
  Heart,

  TrendingUp,
  Users,
  Globe,
  Shield,
  Zap,
  Coffee,

  BarChart3,
  Target
} from 'lucide-react';
import { trackSponsorView, trackSponsorClick, getAllSponsorReports } from '@/lib/sponsorAnalytics';
import { getAllSponsors } from '@/lib/sponsorData';
import { trackEvent } from '@/lib/analytics';
import { getAppUsageAnalytics } from '@/lib/freeAppFeatures';
import Image from 'next/image';
import SponsorCard from '@/components/ui/SponsorCard';

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
    try { trackSponsorClick && trackSponsorClick(sponsorId, placement); } catch { }
    if (typeof window === 'undefined') return;
    try {
      const newWin = window.open(url, '_blank', 'noopener,noreferrer');
      try { if (newWin) newWin.opener = null; } catch { }
    } catch {
      try { window.location.href = url; } catch { }
    }
  };

  // SponsorCard provides keyboard accessibility — no page-level key handlers required

  // handleSponsorInquiryClick removed; leave analytics event calls inline where needed.

  // Pull sponsors from central data. Using `getAllSponsors()` will include
  // the mock entry in `src/lib/sponsorData.js` for local testing.
  const sponsors = getAllSponsors();

  // Formatting and tier icons are handled by `SponsorCard` itself.

  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Our Amazing Sponsors ❤️
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            These incredible partners make easy-pdf completely free for everyone.
            Show them some love and check out their amazing services!
          </p>
          {/* removed green 'Contact to Sponsor' button to simplify hero */}

          {/* App Stats */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm p-4">
                <div className="text-2xl font-bold">{analytics.totalOperations?.toLocaleString() || '10,000+'}</div>
                <div className="text-sm text-gray-300">Files Processed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4">
                <div className="text-2xl font-bold">{analytics.totalSessions?.toLocaleString() || '5,000+'}</div>
                <div className="text-sm text-gray-300">User Sessions</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-gray-300">Free Forever</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-300">Files Uploaded</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sponsors Grid */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Meet Our Sponsors</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            These trusted partners share our commitment to privacy, security, and providing
            valuable tools to the community.
          </p>
        </div>

        <div className="max-w-6xl mx-auto text-center">
          {sponsors.length === 0 ? (
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 shadow-lg ring-1 ring-white/5">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">We don’t have sponsors yet — you can be the first ✨</h3>
              <p className="text-gray-300 mb-6">
                easy-pdf will always provide free access to students, teachers, researchers, doctors, institutions, and community projects.
                We’re building a sustainable model and would love to partner with organizations that share our values: privacy, accessibility and education.
              </p>

              <ul className="text-left mx-auto mb-6 max-w-xl space-y-3">
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span><strong>Free for education & research</strong> — lifelong access for students, teachers, and researchers.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span><strong>Trusted by professionals</strong> — special arrangements for doctors and institutions.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">•</span>
                  <span><strong>Transparent partnership</strong> — sponsors are carefully chosen to protect user privacy.</span>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="inline-flex items-center px-6 py-3 bg-transparent">
                  <a href="https://www.buymeacoffee.com/kadriwalimt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                    <Image className="preserve-color" src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height={43} width={157} priority={false} />
                  </a>
                </div>

                <a
                  href="#partnership-tiers"
                  onClick={(e) => {
                    e.preventDefault();
                    try {
                      const el = document.getElementById('partnership-tiers');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        try { trackEvent && trackEvent('scroll_to_partnership_tiers'); } catch { }
                      }
                    } catch {
                      window.location.href = '/#partnership-tiers';
                    }
                  }}
                  className="inline-flex items-center px-6 py-3 border border-white/10 text-white hover:bg-white/5 transition-colors"
                >
                  Learn about partnership tiers
                </a>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              {sponsors.length === 1 ? (
                <div className="w-full flex justify-center">
                  <SponsorCard
                    key={sponsors[0].id}
                    sponsor={sponsors[0]}
                    size="medium"
                    showDescription={true}
                    onVisit={(id, url) => handleSponsorClick(id, url)}
                  />
                </div>
              ) : (
                <div className="inline-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center place-items-center justify-center mx-auto">
                  {sponsors.map((sponsor) => (
                    <SponsorCard
                      key={sponsor.id}
                      sponsor={sponsor}
                      size="medium"
                      showDescription={true}
                      onVisit={(id, url) => handleSponsorClick(id, url)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Why We Use Sponsors */}
      <div className="bg-gray-950 py-16">
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
              <div className="bg-gray-950 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Privacy First</h3>
              <p className="text-gray-400">
                All sponsors are vetted for privacy practices. We only partner with
                companies that respect user privacy and data protection.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
              <p className="text-gray-400">
                Our sponsors share our values of building tools that serve the community.
                They help us keep improving without compromising our mission.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-950 w-16 h-16 flex items-center justify-center mx-auto mb-4">
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
          <div className="bg-gray-950 border border-gray-700 p-6 text-center">
            <Globe className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">Global</div>
            <div className="text-sm text-gray-400">Worldwide reach</div>
          </div>

          <div className="bg-gray-950 border border-gray-700 p-6 text-center">
            <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">Growing</div>
            <div className="text-sm text-gray-400">User base expansion</div>
          </div>

          <div className="bg-gray-950 border border-gray-700 p-6 text-center">
            <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">Engaged</div>
            <div className="text-sm text-gray-400">High user engagement</div>
          </div>

          <div className="bg-gray-950 border border-gray-700 p-6 text-center">
            <Coffee className="w-8 h-8 text-orange-400 mx-auto mb-3 preserve-color" />
            <div className="text-2xl font-bold mb-1">Trusted</div>
            <div className="text-sm text-gray-400">Community approved</div>
          </div>
        </div>
      </div>

      {/* Become a Sponsor CTA */}
      <div id="partnership-tiers" className="bg-gradient-to-r from-gray-700 to-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Sponsor</h2>
          <p className="text-xl text-gray-100 mb-8">
            Join our community of sponsors and help keep powerful tools free for everyone
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm p-4">
              <BarChart3 className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="font-semibold">Detailed Analytics</div>
              <div className="text-sm text-gray-100">Track your ROI with comprehensive metrics</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4">
              <Target className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="font-semibold">Targeted Audience</div>
              <div className="text-sm text-gray-100">Reach privacy-conscious professionals</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4">
              <Heart className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="font-semibold">Community Impact</div>
              <div className="text-sm text-gray-100">Support free tools for everyone</div>
            </div>
          </div>

          {/* Buy Me A Coffee anchor + image */}
          <div className="flex items-center justify-center">
            <div className="preserve-color">
              <div dangerouslySetInnerHTML={{ __html: `<script type="text/javascript" src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js" data-name="bmc-button" data-slug="kadriwalimt" data-color="#FFDD00" data-emoji=""  data-font="Cookie" data-text="Sponsor this project." data-outline-color="#000000" data-font-color="#000000" data-coffee-color="#ffffff" ></script>` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Thank You */}
      <div className="bg-black py-12">
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