// src/lib/sponsorData.js

export const sponsorTiers = {
  PLATINUM: {
    name: "Platinum Sponsor",
    price: "$500/month",
    maxSponsors: 3,
    benefits: [
      "Large logo on homepage hero section",
      "Dedicated sponsor page feature",
      "Social media mentions",
      "Newsletter mentions",
      "Analytics reports"
    ]
  },
  GOLD: {
    name: "Gold Sponsor",
    price: "$200/month",
    maxSponsors: 5,
    benefits: [
      "Medium logo on homepage",
      "Sponsor page listing",
      "Social media mentions",
      "Newsletter mentions"
    ]
  },
  SILVER: {
    name: "Silver Sponsor",
    price: "$100/month",
    maxSponsors: 10,
    benefits: [
      "Small logo on homepage",
      "Sponsor page listing",
      "Newsletter mentions"
    ]
  },
  BRONZE: {
    name: "Bronze Supporter",
    price: "$50/month",
    maxSponsors: 20,
    benefits: [
      "Name listing on sponsor page",
      "Newsletter mentions"
    ]
  }
};

// Real sponsors - currently empty, add real sponsors here when they join
export const currentSponsors = [
  // Real sponsors will be added here when they join.
  // Keeping this array intentionally empty ensures the UI shows an honest
  // "no sponsors yet" state rather than placeholder/mock content.

  // This sponsor represents a real community contributor from Instagram.
  {
    id: "instagram-adnann-42",
    name: "Adnann",
    tier: "BRONZE",
    website: "https://www.instagram.com/adnann_.42/",
    description: "Creator and supporter on Instagram.",
    joinDate: "2025-11-15T00:00:00.000Z",
    featured: false,
    avatar: true,
    // Local path to downloaded Instagram profile image. Use the provided script
    // `scripts/fetch_instagram_profile_image.ps1` to download to
    // `public/images/sponsors/<username>.jpg` and set the `logo` field.
    // If the image is not available this will fallback to showing initials.
    logo: "/images/sponsors/adnann_.42.jpg"
  }
];

// NOTE: we intentionally removed placeholder sponsors. Showing real,
// up-to-date sponsor information avoids misleading users. When sponsors join,
// add them to `currentSponsors` above.

// Helper functions
export const getSponsorsByTier = (tier) => {
  return currentSponsors.filter(sponsor => sponsor.tier === tier);
};

export const getFeaturedSponsors = () => {
  return currentSponsors.filter(sponsor => sponsor.featured);
};

export const getAllSponsors = () => {
  // Return a sorted shallow copy to avoid mutating the source array
  const sponsors = [...currentSponsors];
  return sponsors.sort((a, b) => {
    const tierOrder = { PLATINUM: 0, GOLD: 1, SILVER: 2, BRONZE: 3 };
    return (tierOrder[a.tier] || 99) - (tierOrder[b.tier] || 99);
  });
};

export const hasRealSponsors = () => {
  return currentSponsors.length > 0;
};

export const getTotalMonthlyRevenue = () => {
  const tierPrices = {
    PLATINUM: 500,
    GOLD: 200,
    SILVER: 100,
    BRONZE: 50
  };

  return currentSponsors.reduce((total, sponsor) => {
    return total + tierPrices[sponsor.tier];
  }, 0);
};

// Sponsor application form fields
export const sponsorApplicationFields = [
  {
    name: "companyName",
    label: "Company Name",
    type: "text",
    required: true
  },
  {
    name: "contactEmail",
    label: "Contact Email",
    type: "email",
    required: true
  },
  {
    name: "website",
    label: "Company Website",
    type: "url",
    required: true
  },
  {
    name: "tier",
    label: "Sponsorship Tier",
    type: "select",
    options: Object.keys(sponsorTiers),
    required: true
  },
  {
    name: "description",
    label: "Company Description (50 words max)",
    type: "textarea",
    required: true,
    maxLength: 250
  },
  {
    name: "logo",
    label: "Company Logo (SVG preferred)",
    type: "file",
    accept: ".svg,.png,.jpg,.jpeg",
    required: false
  }
];