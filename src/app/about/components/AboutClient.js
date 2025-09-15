"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Heart,
  Zap,
  Users,
  Globe,
  Code,
  Lock,
  Star,
  Award,
  TrendingUp,
  Coffee,
  Github
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export default function AboutClient() {

  const handleGitHubClick = () => {
    trackEvent('github_link_clicked');

    window.open(process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/easy-pdf/easy-pdf', '_blank');
  };

  const handleContactClick = () => {
    trackEvent('contact_link_clicked');
    window.location.href = `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'kadriwalimohammad@gmail.com'}`;
  };

  const teamMembers = [
    {
      name: 'Wali Mohammad Kadri',
      role: 'Full-stack developer passionate about building privacy-first tools that make a difference.',
      location: 'Mumbai, India',
      quote: 'Building the future, one line of code at a time',
      avatar: 'W'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          About Easy-PDF
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          We&apos;re building the future of document processing with privacy-first,
          open-source PDF tools that work entirely in your browser.
        </p>
      </div>

      {/* Mission Section */}
      <Card className="mb-8 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Heart className="h-6 w-6 text-red-500" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            To democratize document processing by providing powerful, privacy-first PDF tools
            that are completely free and accessible to everyone.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            We believe that powerful tools should be available to everyone, regardless of
            their technical expertise or financial resources. That&apos;s why we&apos;ve built a
            comprehensive suite of PDF tools that work entirely in your browser, ensuring
            your documents never leave your device.
          </p>
        </CardContent>
      </Card>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Shield className="h-5 w-5 text-blue-500" />
              Privacy First
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              All processing happens locally in your browser. Your files never touch our servers,
              ensuring complete privacy and security.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Zap className="h-5 w-5 text-yellow-500" />
              Lightning Fast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Built with modern web technologies for optimal performance. Process your documents
              quickly and efficiently.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Users className="h-5 w-5 text-green-500" />
              Community Driven
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Open source and community-focused. We welcome contributions and feedback from
              users worldwide.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Globe className="h-5 w-5 text-purple-500" />
              Accessible Everywhere
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Works on any device with a modern browser. No downloads, no installations,
              no platform restrictions.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Lock className="h-5 w-5 text-red-500" />
              Secure by Design
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Built with security in mind from the ground up. Your data stays on your device
              and is never transmitted to our servers.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Star className="h-5 w-5 text-yellow-500" />
              Always Free
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Completely free to use with no hidden costs, premium features, or usage limits.
              We&apos;re committed to keeping it that way.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Technology Stack */}
      <Card className="mb-8 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Code className="h-6 w-6 text-blue-500" />
            Built with Modern Technology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">Next.js</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">React Framework</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-600">PDF-lib</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">PDF Processing</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">Tailwind</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Styling</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">TypeScript</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Type Safety</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <Card className="mb-8 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <TrendingUp className="h-6 w-6 text-green-500" />
            Our Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">10,000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Files Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">5,000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">20+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">PDF Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Free Forever</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Section */}
      <Card className="mb-8 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Users className="h-6 w-6 text-blue-500" />
            Meet the Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center rounded-full">
                  <span className="text-2xl font-bold text-white">{member.avatar}</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{member.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {member.role}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Based in {member.location} • {member.quote}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="mb-8 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Award className="h-6 w-6 text-yellow-500" />
            Get Involved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleGitHubClick}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Github className="h-5 w-5" />
              View on GitHub
            </Button>
            <Button
              onClick={handleContactClick}
              className="flex items-center gap-2"
            >
              <Coffee className="h-5 w-5" />
              Get in Touch
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-gray-500 dark:text-gray-400">
        <p>
          Made with ❤️ for the open source community
        </p>
        <p className="text-sm mt-2">
          © {new Date().getFullYear()} Easy-PDF. All rights reserved.
        </p>
      </div>
    </div>
  );
}