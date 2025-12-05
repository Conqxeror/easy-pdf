// Sponsor Dashboard Page
// Admin interface for viewing sponsor analytics and performance

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SponsorDashboard from '@/components/ui/SponsorDashboard';
import { trackEvent } from '@/lib/analytics';

const SponsorDashboardPage = () => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(() => {
    try {
      return typeof window !== 'undefined' && sessionStorage.getItem('sponsor_dashboard_auth') === 'true';
    } catch { return false; }
  });
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple password protection (in production, use proper auth)
    if (password === 'sponsor2024' || password === 'demo') {
      setIsAuthorized(true);
      try { sessionStorage.setItem('sponsor_dashboard_auth', 'true'); } catch { /* ignore */ }
      trackEvent('sponsor_dashboard_login', { success: true });
    } else {
      alert('Invalid password');
      trackEvent('sponsor_dashboard_login', { success: false });
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-background border border-border p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-foreground mb-6 text-center">
            Sponsor Dashboard Access
          </h1>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-foreground text-sm font-medium mb-2">
                Access Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-foreground focus:outline-none focus:border-border"
                placeholder="Enter dashboard password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-background hover:bg-background text-foreground font-medium py-2 px-4 transition-colors"
            >
              Access Dashboard
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-foreground text-sm">
              Demo password: <code className="bg-background px-2 py-1">demo</code>
            </p>
            <button
              onClick={() => router.push('/sponsors')}
              className="text-foreground hover:text-foreground text-sm mt-2"
            >
              ← Back to Sponsors Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-32 w-32 border-b-2 border-border mx-auto"></div>
          <p className="text-foreground mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return <SponsorDashboard />;
};

export default SponsorDashboardPage;