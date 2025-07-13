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
  // Add real sponsors here when they join
  // Example format:
  // {
  //   id: "sponsor-1",
  //   name: "Company Name",
  //   tier: "PLATINUM",
  //   logo: "/sponsors/company-logo.svg",
  //   website: "https://company.com",
  //   description: "Company description",
  //   joinDate: "2024-01-15",
  //   featured: true
  // }
];

// Mock/placeholder sponsors for demonstration purposes
export const mockSponsors = [
  // Platinum Sponsors
  {
    id: "placeholder-platinum-1",
    name: "Your Company Here",
    tier: "PLATINUM",
    logo: "/placeholder-logo.svg",
    website: "#",
    description: "Be the first Platinum sponsor and get maximum visibility",
    joinDate: "2024-01-15",
    featured: true,
    isPlaceholder: true
  },
  
  // Gold Sponsors  
  {
    id: "placeholder-gold-1",
    name: "Your Business",
    tier: "GOLD", 
    logo: "/placeholder-logo.svg",
    website: "#",
    description: "Join as a Gold sponsor for premium benefits",
    joinDate: "2024-02-01",
    featured: false,
    isPlaceholder: true
  },
  {
    id: "placeholder-gold-2", 
    name: "Another Company",
    tier: "GOLD",
    logo: "/placeholder-logo.svg", 
    website: "#",
    description: "Gold sponsorship slot available",
    joinDate: "2024-02-15",
    featured: false,
    isPlaceholder: true
  },

  // Silver Sponsors
  {
    id: "placeholder-silver-1",
    name: "Startup Name",
    tier: "SILVER",
    logo: "/placeholder-logo.svg",
    website: "#", 
    description: "Silver sponsorship opportunity",
    joinDate: "2024-03-01",
    featured: false,
    isPlaceholder: true
  },
  {
    id: "placeholder-silver-2",
    name: "Tech Company",
    tier: "SILVER",
    logo: "/placeholder-logo.svg",
    website: "#",
    description: "Support our platform as a Silver sponsor",
    joinDate: "2024-03-10", 
    featured: false,
    isPlaceholder: true
  },

  // Bronze Supporters
  {
    id: "placeholder-bronze-1",
    name: "Individual Supporter",
    tier: "BRONZE",
    logo: null,
    website: "#",
    description: "Bronze supporter slot available",
    joinDate: "2024-03-20",
    featured: false,
    isPlaceholder: true
  },
  {
    id: "placeholder-bronze-2", 
    name: "Community Member",
    tier: "BRONZE",
    logo: null,
    website: "#",
    description: "Join our community of supporters",
    joinDate: "2024-04-01",
    featured: false,
    isPlaceholder: true
  }
];

// Helper functions
export const getSponsorsByTier = (tier, useMockData = false) => {
  const sponsors = useMockData ? mockSponsors : currentSponsors;
  return sponsors.filter(sponsor => sponsor.tier === tier);
};

export const getFeaturedSponsors = (useMockData = false) => {
  const sponsors = useMockData ? mockSponsors : currentSponsors;
  return sponsors.filter(sponsor => sponsor.featured);
};

export const getAllSponsors = (useMockData = false) => {
  const sponsors = useMockData ? mockSponsors : currentSponsors;
  return sponsors.sort((a, b) => {
    const tierOrder = { PLATINUM: 0, GOLD: 1, SILVER: 2, BRONZE: 3 };
    return tierOrder[a.tier] - tierOrder[b.tier];
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