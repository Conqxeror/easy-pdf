// Sponsor Dashboard Page
// Admin interface for viewing sponsor analytics and performance

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SponsorDashboard from '@/components/ui/SponsorDashboard';
import { trackEvent } from '@/lib/analytics';

const SponsorDashboardPage = () => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    // Check if already authorized
    const authorized = sessionStorage.getItem('sponsor_dashboard_auth');
    if (authorized === 'true') {
      setIsAuthorized(true);
      setShowLogin(false);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple password protection (in production, use proper auth)
    if (password === 'sponsor2024' || password === 'demo') {
      setIsAuthorized(true);
      setShowLogin(false);
      sessionStorage.setItem('sponsor_dashboard_auth', 'true');
      trackEvent('sponsor_dashboard_login', { success: true });
    } else {
      alert('Invalid password');
      trackEvent('sponsor_dashboard_login', { success: false });
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Sponsor Dashboard Access
          </h1>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Access Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter dashboard password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Access Dashboard
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Demo password: <code className="bg-gray-700 px-2 py-1 rounded">demo</code>
            </p>
            <button
              onClick={() => router.push('/sponsors')}
              className="text-blue-400 hover:text-blue-300 text-sm mt-2"
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return <SponsorDashboard />;
};

export default SponsorDashboardPage;