"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, Database, UserCheck, FileText, Globe, Mail } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export default function PrivacyClient() {
  return (
  <main className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-16 px-6 my-8 px-6">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] -z-10" />
        
        <div className="container-standard px-6 py-8">
          <Breadcrumb items={breadcrumbs} />
          
          <div className="mt-8 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-950/30 text-gray-800 dark:text-gray-300 font-medium mb-6">
              <Shield className="h-4 w-4" />
              Privacy First
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Your privacy is our top priority. We believe in complete transparency about how we handle your data.
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Last Updated: January 4, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Key Highlights */}
      <div className="container-standard py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card variant="glass" className="text-center p-6">
            <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3 preserve-color" />
            <h3 className="font-semibold mb-2">100% Client-Side</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All processing happens in your browser. We never see your files.
            </p>
          </Card>
          
          <Card variant="glass" className="text-center p-6">
            <Database className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-3 preserve-color" />
            <h3 className="font-semibold mb-2">Zero Storage</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We don&apos;t store any of your files or data on our servers.
            </p>
          </Card>
          
          <Card variant="glass" className="text-center p-6">
            <Eye className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-3 preserve-color" />
            <h3 className="font-semibold mb-2">No Tracking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We use minimal analytics. No personal data collection.
            </p>
          </Card>
          
          <Card variant="glass" className="text-center p-6">
            <UserCheck className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-3 preserve-color" />
            <h3 className="font-semibold mb-2">No Sign-up</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use all tools instantly. No account or login required.
            </p>
          </Card>
        </div>

        {/* TL;DR Alert */}
        <Alert variant="info" className="mb-12">
          <AlertDescription>
            <strong>TL;DR:</strong> We process everything in your browser. We don&apos;t upload, store, or see your files. 
            We use Vercel Analytics (privacy-friendly) for basic usage metrics. That&apos;s it.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Section 1 */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-950/30">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 preserve-color" />
                </div>
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Information You Never Give Us:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Your PDF files and documents</li>
                  <li>File names or content</li>
                  <li>Personal information from documents</li>
                  <li>Email addresses or contact details</li>
                  <li>Account credentials (we don&apos;t have accounts)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Information We Collect Automatically:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  <li><strong>Usage Analytics:</strong> Page views, tool usage, browser type (via Vercel Analytics)</li>
                  <li><strong>Technical Data:</strong> Device type, screen resolution, operating system</li>
                  <li><strong>Error Reports:</strong> Anonymous error logs to improve service reliability</li>
                </ul>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Note: Vercel Analytics is privacy-focused and doesn&apos;t use cookies or track individuals.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-950/30">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400 preserve-color" />
                </div>
                2. How We Use Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>We use the limited analytics data solely to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>Understand which tools are most popular</li>
                <li>Identify and fix technical issues</li>
                <li>Improve user experience and performance</li>
                <li>Make informed decisions about new features</li>
              </ul>
              <Alert variant="success" className="mt-4">
                <AlertDescription>
                  <strong>We never:</strong> Sell your data, share it with third parties, or use it for advertising.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-950/30">
                  <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 preserve-color" />
                </div>
                3. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>Your files are processed entirely in your browser using client-side JavaScript:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li><strong>No Upload:</strong> Files never leave your device</li>
                <li><strong>Local Processing:</strong> All operations happen in your browser&apos;s memory</li>
                <li><strong>Automatic Cleanup:</strong> Files are automatically cleared when you close the page</li>
                <li><strong>HTTPS:</strong> All traffic is encrypted with industry-standard SSL/TLS</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-950/30">
                  <Globe className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                4. Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Vercel (Hosting & Analytics)</h4>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  easy-pdf is hosted on Vercel. We use Vercel Analytics for privacy-friendly usage metrics.
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                  <li>No cookies or persistent identifiers</li>
                  <li>No cross-site tracking</li>
                  <li>Aggregated, anonymous data only</li>
                  <li>GDPR and CCPA compliant</li>
                </ul>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Learn more: <Link href="https://vercel.com/docs/analytics/privacy-policy" className="text-gray-700 dark:text-gray-400 hover:underline" target="_blank" rel="noopener noreferrer">Vercel Analytics Privacy Policy</Link>
                </p>
              </div>
              
              <Alert variant="info">
                <AlertDescription>
                  We don&apos;t use Google Analytics, Facebook Pixel, or any other invasive tracking scripts.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-950/30">
                  <UserCheck className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                5. Your Rights (GDPR & CCPA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>Under GDPR (Europe) and CCPA (California), you have the right to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li><strong>Access:</strong> Request a copy of any data we hold about you</li>
                <li><strong>Deletion:</strong> Request deletion of your data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Portability:</strong> Request your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Opt out of any data collection</li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                However, since we don&apos;t collect personal data or create user accounts, there&apos;s typically nothing to access, delete, or export.
              </p>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-950/30">
                  <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                6. Children&apos;s Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">
                easy-pdf is not directed to children under 13. We do not knowingly collect personal information from children. 
                If you believe we have inadvertently collected such information, please contact us immediately so we can delete it.
              </p>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950/30">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 preserve-color" />
                </div>
                7. Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                We may update this Privacy Policy from time to time. When we do:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>we&apos;ll update the &quot;Last Updated&quot; date at the top</li>
                <li>Significant changes will be highlighted on our homepage</li>
                <li>Continued use of the service after changes constitutes acceptance</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-950/30">
                  <Mail className="h-5 w-5 text-cyan-600 dark:text-cyan-400 preserve-color" />
                </div>
                8. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-black/50 p-4 space-y-2">
                <p className="font-medium">easy-pdf Support</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Email: <Link href="mailto:privacy@easy-pdf.app" className="text-gray-700 dark:text-gray-400 hover:underline">privacy@easy-pdf.app</Link>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Website: <Link href="https://easy-pdf.app" className="text-gray-700 dark:text-gray-400 hover:underline">https://easy-pdf.app</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <Card variant="glass" className="inline-block p-8">
            <h3 className="text-xl font-semibold mb-6">Our Commitment to You</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="premium" size="lg">
                  <Shield className="h-4 w-4 preserve-color" />
                GDPR Compliant
              </Badge>
              <Badge variant="info" size="lg">
                  <Shield className="h-4 w-4 preserve-color" />
                CCPA Compliant
              </Badge>
              <Badge variant="success" size="lg">
                  <Lock className="h-4 w-4 preserve-color" />
                Privacy-First
              </Badge>
              <Badge variant="secondary" size="lg">
                <Database className="h-4 w-4" />
                Zero Storage
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

