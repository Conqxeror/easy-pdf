// src/components/ui/SponsorCard.jsx

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Calendar, Instagram } from "lucide-react";

export default function SponsorCard({ sponsor, size = "medium", showDescription = true, onVisit }) {
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

  // Avatar sizes for profile pictures (square / circular)
  const avatarSizes = {
    small: 64,
    medium: 96,
    large: 128
  };

  const tierColors = {
    PLATINUM: "border-yellow-400 bg-gradient-to-br from-gray-800 to-gray-900",
    GOLD: "border-yellow-600 bg-gradient-to-br from-gray-800 to-gray-900", 
    SILVER: "border-gray-400 bg-gradient-to-br from-gray-800 to-gray-900",
    BRONZE: "border-orange-600 bg-gradient-to-br from-gray-800 to-gray-900"
  };

  const tierBadgeColors = {
    PLATINUM: "bg-yellow-400 text-gray-900",
    GOLD: "bg-yellow-600 text-gray-900",
    SILVER: "bg-gray-400 text-gray-900", 
    BRONZE: "bg-orange-600 text-gray-900"
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      ${tierColors[sponsor.tier]}
      border-2 shadow-lg hover:shadow-xl transition-all duration-300 
      hover:scale-105 relative overflow-hidden mx-auto
    `}>
      {/* Ensure the card itself is centered in its grid/parent */}
      {/* Tier Badge */}
      <div className={`
        absolute top-3 right-3 px-2 py-1 text-xs font-semibold
        ${tierBadgeColors[sponsor.tier]}
      `}>
        {(() => {
          const t = (sponsor.tier || '').toLowerCase();
          return t.charAt(0).toUpperCase() + t.slice(1);
        })()}
      </div>

      {/* Logo / Avatar Section */}
      <div className="flex justify-center items-center mb-4 h-20">
        {sponsor.logo ? (
          sponsor.avatar ? (
            <div className="relative">
              <Image
                src={sponsor.logo}
                alt={`${sponsor.name} profile`}
                width={avatarSizes[size]}
                height={avatarSizes[size]}
                className="object-cover rounded-full border-2 border-gray-700 shadow-xl"
              />
              {/* Instagram overlay when website is Instagram */}
              {sponsor.website && sponsor.website.includes('instagram.com') && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400 rounded-full p-1 shadow-md">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ) : (
            <Image
              src={sponsor.logo}
              alt={`${sponsor.name} logo`}
              width={logoSizes[size].width}
              height={logoSizes[size].height}
              className="object-contain"
            />
          )
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-950 border border-gray-700">
            <span className="text-gray-200 font-semibold text-lg">
              {sponsor.name.split(' ').map(word => word[0]).join('').toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Company Name */}
      <h3 className={`text-center mb-2 ${size === 'small' ? 'text-base font-semibold' : 'text-lg font-bold text-gray-100'}`}>
        {sponsor.name}
      </h3>

      {/* Description */}
      {showDescription && sponsor.description && (
        <p className="text-sm text-gray-300 text-center mb-4 line-clamp-3">
          {sponsor.description}
        </p>
      )}

      {/* Join Date (hide for small cards to save space) */}
      {size !== 'small' && (
        <div className="flex items-center justify-center text-xs text-gray-400 mb-4">
        <Calendar className="w-3 h-3 mr-1" />
        Sponsor since {new Date(sponsor.joinDate).toLocaleDateString('en-IN', { 
          month: 'short', 
          year: 'numeric' 
        })}
        </div>
      )}

      {/* Website Link / Instagram handle */}
      <div className="flex justify-center">
        <Link
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { try { onVisit && onVisit(sponsor.id, sponsor.website); } catch {} }}
          className={`inline-flex items-center gap-2 px-4 ${size === 'small' ? 'py-1 text-xs' : 'py-2 text-sm'} bg-black text-white font-medium hover:bg-white hover:text-black transition-colors duration-150 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20`}
        >
          {sponsor.website && sponsor.website.includes('instagram.com') ? (
            <>
              <Instagram className="w-4 h-4" />
              @{sponsor.website.split('/').filter(Boolean).pop()}
            </>
          ) : (
            <>
              Visit Website
              <ExternalLink className="w-3 h-3 ml-1" />
            </>
          )}
        </Link>
      </div>

      {/* Featured Badge */}
      {sponsor.featured && (
        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-semibold">
          Featured
        </div>
      )}
    </div>
  );
}