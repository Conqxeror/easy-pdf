// src/components/ui/SponsorCard.jsx

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Calendar } from "lucide-react";

export default function SponsorCard({ sponsor, size = "medium", showDescription = true }) {
  const sizeClasses = {
    small: "p-4 max-w-xs",
    medium: "p-6 max-w-sm", 
    large: "p-8 max-w-md"
  };

  const logoSizes = {
    small: { width: 80, height: 40 },
    medium: { width: 120, height: 60 },
    large: { width: 160, height: 80 }
  };

  const tierColors = {
    PLATINUM: "border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100",
    GOLD: "border-yellow-600 bg-gradient-to-br from-yellow-50 to-orange-50", 
    SILVER: "border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100",
    BRONZE: "border-orange-600 bg-gradient-to-br from-orange-50 to-red-50"
  };

  const tierBadgeColors = {
    PLATINUM: "bg-yellow-400 text-yellow-900",
    GOLD: "bg-yellow-600 text-white",
    SILVER: "bg-gray-400 text-gray-900", 
    BRONZE: "bg-orange-600 text-white"
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      ${tierColors[sponsor.tier]}
      border-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 
      hover:scale-105 relative overflow-hidden
    `}>
      {/* Tier Badge */}
      <div className={`
        absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold
        ${tierBadgeColors[sponsor.tier]}
      `}>
        {sponsor.tier}
      </div>

      {/* Logo Section */}
      <div className="flex justify-center items-center mb-4 h-16">
        {sponsor.logo ? (
          <Image
            src={sponsor.logo}
            alt={`${sponsor.name} logo`}
            width={logoSizes[size].width}
            height={logoSizes[size].height}
            className="object-contain"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-200 rounded-lg">
            <span className="text-gray-600 font-semibold text-lg">
              {sponsor.name.split(' ').map(word => word[0]).join('').toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Company Name */}
      <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
        {sponsor.name}
      </h3>

      {/* Description */}
      {showDescription && sponsor.description && (
        <p className="text-sm text-gray-700 text-center mb-4 line-clamp-3">
          {sponsor.description}
        </p>
      )}

      {/* Join Date */}
      <div className="flex items-center justify-center text-xs text-gray-600 mb-4">
        <Calendar className="w-3 h-3 mr-1" />
        Sponsor since {new Date(sponsor.joinDate).toLocaleDateString('en-IN', { 
          month: 'short', 
          year: 'numeric' 
        })}
      </div>

      {/* Website Link */}
      <div className="flex justify-center">
        <Link
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Visit Website
          <ExternalLink className="w-3 h-3 ml-1" />
        </Link>
      </div>

      {/* Featured Badge */}
      {sponsor.featured && (
        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
          Featured
        </div>
      )}
    </div>
  );
}