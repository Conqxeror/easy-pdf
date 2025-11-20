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
    PLATINUM: "border-yellow-400 bg-background dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900",
    GOLD: "border-yellow-600 bg-background dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900", 
    SILVER: "border-border bg-background dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900",
    // Bronze: explicit light/dark theming — white card with bronze border in light,
    // black card in dark mode. Text and button colors handled separately.
    BRONZE: "border-orange-600 bg-white dark:bg-background"
  };

  const tierBadgeColors = {
    PLATINUM: "bg-yellow-400 text-foreground",
    GOLD: "bg-yellow-600 text-foreground",
    SILVER: "bg-background text-foreground", 
    BRONZE: "bg-orange-600 text-foreground"
  };

  // Button styles per tier to ensure good contrast in light mode
  const tierButtonStyles = {
    PLATINUM: "border-yellow-400",
    GOLD: "border-yellow-600",
    SILVER: "border-border",
    // Light: black button with white text. Dark: white button with black text.
    BRONZE: "border-orange-600 bg-black text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
  };

  // Tier-specific text colors to make names/descriptions readable
  const tierTextColors = {
    PLATINUM: 'text-foreground',
    GOLD: 'text-foreground',
    SILVER: 'text-foreground',
    BRONZE: 'text-black dark:text-foreground'
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      ${tierColors[sponsor.tier]}
      ${tierTextColors[sponsor.tier] || 'text-foreground'}
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
                className="object-cover border-2 border-border shadow-xl"
              />
              {/* Instagram overlay when website is Instagram */}
              {sponsor.website && sponsor.website.includes('instagram.com') && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400 p-1 shadow-md">
                  <Instagram className="w-4 h-4 text-foreground" />
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
          <div className="flex items-center justify-center w-full h-full bg-background dark:bg-background border border-border">
            <span className="text-foreground dark:text-foreground font-semibold text-lg">
              {sponsor.name.split(' ').map(word => word[0]).join('').toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Company Name */}
      <h3 className={`text-center mb-2 ${size === 'small' ? 'text-base font-semibold' : 'text-lg font-bold'} ${tierTextColors[sponsor.tier] || 'text-foreground'}`}>
        {sponsor.name}
      </h3>

      {/* Description */}
      {showDescription && sponsor.description && (
        <p className={`text-sm text-center mb-4 line-clamp-3 ${tierTextColors[sponsor.tier] || 'text-foreground'}`}>
          {sponsor.description}
        </p>
      )}

      {/* Join Date (hide for small cards to save space) */}
      {size !== 'small' && (
        <div className={`flex items-center justify-center text-xs mb-4 ${tierTextColors[sponsor.tier] || 'text-foreground'}`}>
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
          className={
            `inline-flex items-center gap-2 px-4 ${size === 'small' ? 'py-1 text-xs' : 'py-2 text-sm'} bg-background dark:bg-background font-medium transition-colors duration-150 border border-transparent dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-white/20 ` +
            // Append tier-specific button styles to increase contrast for some tiers (e.g., Bronze)
            (tierButtonStyles[sponsor.tier] || ' text-foreground')
          }
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
        <div className="absolute top-3 left-3 bg-red-500 text-foreground px-2 py-1 text-xs font-semibold">
          Featured
        </div>
      )}
    </div>
  );
}