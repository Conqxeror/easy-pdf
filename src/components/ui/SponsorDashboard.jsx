// Enhanced Sponsor Dashboard Component
// Provides detailed analytics and value demonstration for sponsors

"use client";

import React, { useState, useEffect  } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  // LineChart, // Unused
  // Line, // Unused
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  Target,
  Download,
  // Calendar, // Unused
  Globe,
  Smartphone
} from 'lucide-react';
import { getAllSponsorReports, exportSponsorData } from '@/lib/sponsorAnalytics';
import { trackEvent } from '@/lib/analytics';

const SponsorDashboard = () => {
  const [sponsorReports, setSponsorReports] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  // const [selectedSponsor, setSelectedSponsor] = useState('all'); // Feature incomplete
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSponsorData();
    trackEvent('sponsor_dashboard_viewed');
  }, []);

  const loadSponsorData = () => {
    setIsLoading(true);
    try {
      const reports = getAllSponsorReports();
      setSponsorReports(reports);
    } catch (error) {
      console.error('Failed to load sponsor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      exportSponsorData();
      trackEvent('sponsor_dashboard_export');
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  // Calculate summary metrics
  const summaryMetrics = sponsorReports.reduce((acc, report) => {
    acc.totalViews += report.totalViews;
    acc.totalClicks += report.totalClicks;
    acc.totalConversions += report.totalConversions;
    return acc;
  }, { totalViews: 0, totalClicks: 0, totalConversions: 0 });

  const avgCTR = summaryMetrics.totalViews > 0 
    ? (summaryMetrics.totalClicks / summaryMetrics.totalViews * 100).toFixed(2)
    : 0;

  const avgConversionRate = summaryMetrics.totalClicks > 0
    ? (summaryMetrics.totalConversions / summaryMetrics.totalClicks * 100).toFixed(2)
    : 0;

  // Prepare chart data
  const sponsorPerformanceData = sponsorReports.map(report => ({
    name: report.sponsorId,
    views: report.totalViews,
    clicks: report.totalClicks,
    ctr: parseFloat(report.ctr),
    conversions: report.totalConversions
  }));

  const placementData = sponsorReports.reduce((acc, report) => {
    Object.entries(report.placements).forEach(([placement, views]) => {
      acc[placement] = (acc[placement] || 0) + views;
    });
    return acc;
  }, {});

  const placementChartData = Object.entries(placementData).map(([placement, views]) => ({
    name: placement,
    value: views
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sponsor Analytics Dashboard</h1>
            <p className="text-gray-400">
              Comprehensive metrics and ROI tracking for all sponsors
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            
            <button
              onClick={handleExportData}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Views</p>
                <p className="text-2xl font-bold">{summaryMetrics.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-400" />
            </div>
            <div className="mt-2">
              <span className="text-green-400 text-sm">
                {Math.round(summaryMetrics.totalViews / 30)} avg/day
              </span>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Clicks</p>
                <p className="text-2xl font-bold">{summaryMetrics.totalClicks.toLocaleString()}</p>
              </div>
              <MousePointer className="w-8 h-8 text-green-400" />
            </div>
            <div className="mt-2">
              <span className="text-green-400 text-sm">
                {avgCTR}% CTR
              </span>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Conversions</p>
                <p className="text-2xl font-bold">{summaryMetrics.totalConversions.toLocaleString()}</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
            <div className="mt-2">
              <span className="text-green-400 text-sm">
                {avgConversionRate}% conversion rate
              </span>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Sponsors</p>
                <p className="text-2xl font-bold">{sponsorReports.length}</p>
              </div>
              <Users className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="mt-2">
              <span className="text-green-400 text-sm">
                All tiers active
              </span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sponsor Performance Chart */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Sponsor Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sponsorPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="views" fill="#3B82F6" name="Views" />
                <Bar dataKey="clicks" fill="#10B981" name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Placement Distribution */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Views by Placement</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={placementChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {placementChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Sponsor Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Detailed Sponsor Metrics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Sponsor</th>
                  <th className="text-right py-3 px-4">Views</th>
                  <th className="text-right py-3 px-4">Clicks</th>
                  <th className="text-right py-3 px-4">CTR</th>
                  <th className="text-right py-3 px-4">Conversions</th>
                  <th className="text-right py-3 px-4">Conv. Rate</th>
                  <th className="text-right py-3 px-4">Avg Daily Views</th>
                  <th className="text-right py-3 px-4">Days Active</th>
                </tr>
              </thead>
              <tbody>
                {sponsorReports.map((report, _index) => (
                  <tr key={report.sponsorId} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4 font-medium">{report.sponsorId}</td>
                    <td className="text-right py-3 px-4">{report.totalViews.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{report.totalClicks.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">
                      <span className={`${parseFloat(report.ctr) > 2 ? 'text-green-400' : parseFloat(report.ctr) > 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {report.ctr}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">{report.totalConversions}</td>
                    <td className="text-right py-3 px-4">
                      <span className={`${parseFloat(report.conversionRate) > 5 ? 'text-green-400' : parseFloat(report.conversionRate) > 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {report.conversionRate}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">{report.avgDailyViews}</td>
                    <td className="text-right py-3 px-4">{report.daysActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Value Proposition for Sponsors */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4">Why Sponsor easy-pdf?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Globe className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Global Reach</h4>
              <p className="text-gray-400 text-sm">
                {summaryMetrics.totalViews.toLocaleString()} monthly views from users worldwide
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Growing Audience</h4>
              <p className="text-gray-400 text-sm">
                Consistent growth with high engagement rates and return users
              </p>
            </div>
            <div className="text-center">
              <Smartphone className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Privacy-Focused Users</h4>
              <p className="text-gray-400 text-sm">
                Attract privacy-conscious professionals and businesses
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorDashboard;