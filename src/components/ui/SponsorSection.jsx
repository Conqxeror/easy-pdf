// src/components/ui/SponsorSection.jsx

import React from "react";
import Link from "next/link";
import { Heart, ArrowRight, Users, Sparkles } from "lucide-react";
import SponsorCard from "./SponsorCard";
import { getFeaturedSponsors, getSponsorsByTier, hasRealSponsors } from "@/lib/sponsorData";

export default function SponsorSection({ variant = "homepage" }) {
  const hasSponsors = hasRealSponsors();
  const featuredSponsors = getFeaturedSponsors(false);
  const goldSponsors = getSponsorsByTier("GOLD", false);
  const silverSponsors = getSponsorsByTier("SILVER", false);
  const bronzeSponsors = getSponsorsByTier("BRONZE", false);

  if (variant === "homepage") {
    // Empty state when no real sponsors
    if (!hasSponsors) {
      return (
        <section className="w-full max-w-6xl mt-16 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-100">
              <Heart className="inline-block w-6 h-6 mr-2 text-red-500" />
              Support Our Mission
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Help us keep easy-pdf free for everyone while supporting privacy-first technology. 
              Become our first sponsor and get maximum visibility!
            </p>
          </div>

          {/* Empty State Call to Action */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 border border-gray-700/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-700 to-teal-600 mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-100 mb-4">
                Be Our First Sponsor!
              </h3>
              
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Join us in building the future of privacy-first PDF tools. 
                Early sponsors get premium placement and help shape our platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/sponsors"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-teal-600 text-white font-medium hover:from-gray-800 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Users className="mr-2 w-4 h-4" />
                  View Sponsorship Plans
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                
                <Link
                  href="/sponsors#become-sponsor"
                  className="text-sm link-blue underline"
                >
                  Learn More About Benefits
                </Link>
              </div>
              
              {/* Sponsorship tiers preview */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-950/50 p-3 border border-gray-700/50">
                  <div className="text-yellow-400 font-semibold">Platinum</div>
                  <div className="text-gray-400">$500/month</div>
                  <div className="text-gray-500 text-xs">Max visibility</div>
                </div>
                <div className="bg-gray-950/50 p-3 border border-gray-700/50">
                  <div className="text-amber-400 font-semibold">Gold</div>
                  <div className="text-gray-400">$200/month</div>
                  <div className="text-gray-500 text-xs">Premium placement</div>
                </div>
                <div className="bg-gray-950/50 p-3 border border-gray-700/50">
                  <div className="text-gray-400 font-semibold">Silver</div>
                  <div className="text-gray-400">$100/month</div>
                  <div className="text-gray-500 text-xs">Great exposure</div>
                </div>
                <div className="bg-gray-950/50 p-3 border border-gray-700/50">
                  <div className="text-orange-400 font-semibold">Bronze</div>
                  <div className="text-gray-400">$50/month</div>
                  <div className="text-gray-500 text-xs">Community support</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    // Regular state when we have sponsors
    return (
      <section className="w-full max-w-6xl mt-16 mb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-100">
            <Heart className="inline-block w-6 h-6 mr-2 text-red-500" />
            Proudly Supported By
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            These amazing companies help keep easy-pdf free for everyone while supporting privacy-first technology.
          </p>
        </div>

        {/* Featured/Platinum Sponsors */}
        {featuredSponsors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-center mb-6 text-gray-200">
              Platinum Sponsors
            </h3>
            <div className="flex justify-center">
                <div className="inline-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center mx-auto">
                {featuredSponsors.map((sponsor) => (
                  <SponsorCard 
                    key={sponsor.id} 
                    sponsor={sponsor} 
                    size="large"
                    showDescription={false}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Gold Sponsors */}
        {goldSponsors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-300">
              Gold Sponsors
            </h3>
            <div className="flex justify-center">
                <div className="inline-grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center mx-auto">
                {goldSponsors.slice(0, 4).map((sponsor) => (
                  <SponsorCard 
                    key={sponsor.id} 
                    sponsor={sponsor} 
                    size="medium"
                    showDescription={false}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Silver Sponsors */}
        {silverSponsors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-300">
              Silver Sponsors
            </h3>
            <div className="flex justify-center">
              <div className="inline-grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 justify-items-center mx-auto">
                {silverSponsors.slice(0, 6).map((sponsor) => (
                  <SponsorCard 
                    key={sponsor.id} 
                    sponsor={sponsor} 
                    size="small"
                    showDescription={false}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bronze Supporters */}
        {bronzeSponsors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-400">
              Bronze Supporters
            </h3>
            <div className="flex justify-center">
              <div className="flex flex-wrap gap-4 justify-center max-w-4xl">
                {bronzeSponsors.slice(0, 8).map((sponsor) => (
                  <div key={sponsor.id} className="flex items-start justify-center">
                    <SponsorCard 
                      sponsor={sponsor} 
                      size="small"
                      showDescription={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-8">
          <Link
            href="/sponsors"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-teal-600 text-white font-medium hover:from-gray-800 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View All Sponsors
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <div className="mt-4">
            <Link
              href="/sponsors#become-sponsor"
              className="text-gray-400 hover:text-gray-300 text-sm underline"
            >
              Become a Sponsor
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Full page variant would be implemented here
  return null;
}