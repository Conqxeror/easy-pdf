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
  Coffee
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export default function AboutPage() {

  const handleSupportClick = () => {
    trackEvent('support_link_clicked');
    window.open('https://buymeacoffee.com/walimohammad', '_blank');
  };

  const handleContactClick = () => {
    trackEvent('contact_link_clicked');
  window.location.href = `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'kadriwalimohammad@gmail.com'}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground dark:text-foreground mb-6">
          About Easy-PDF
        </h1>
        <p className="text-xl text-foreground dark:text-foreground max-w-3xl mx-auto">
          We&apos;re building the future of document processing with privacy-first, 
          secure PDF tools that work entirely in your browser.
        </p>
      </div>

      {/* Mission Section */}
      <Card className="mb-8 bg-background dark:bg-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground dark:text-foreground">
            <Heart className="h-6 w-6 text-red-500" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-foreground dark:text-foreground mb-4">
            To democratize document processing by providing powerful, privacy-first PDF tools 
            that are completely free and accessible to everyone.
          </p>
          <p className="text-foreground dark:text-foreground">
            We believe that powerful tools should be available to everyone, regardless of 
            their technical expertise or financial resources. That&apos;s why we&apos;ve built a 
            comprehensive suite of PDF tools that work entirely in your browser, ensuring 
            your documents never leave your device.
          </p>
        </CardContent>
      </Card>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="bg-background dark:bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-foreground">
              <Shield className="h-5 w-5 text-foreground" />
              Privacy First
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground dark:text-foreground">
              All processing happens locally in your browser. Your files never touch our servers, 
              ensuring complete privacy and security.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background dark:bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-foreground">
              <Zap className="h-5 w-5 text-yellow-500" />
              Lightning Fast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground dark:text-foreground">
              Built with modern web technologies for optimal performance. Process your documents 
              quickly and efficiently.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background dark:bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-foreground">
              <Users className="h-5 w-5 text-green-500" />
              Community Driven
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground dark:text-foreground">
              Community-focused. We welcome contributions and feedback from 
              users worldwide.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background dark:bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-foreground">
              <Globe className="h-5 w-5 text-foreground" />
              Accessible Everywhere
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground dark:text-foreground">
              Works on any device with a modern browser. No downloads, no installations, 
              no platform restrictions.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background dark:bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-foreground">
              <Lock className="h-5 w-5 text-red-500" />
              Secure by Design
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground dark:text-foreground">
              Built with security in mind from the ground up. Your data stays on your device 
              and is never transmitted to our servers.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background dark:bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-foreground">
              <Star className="h-5 w-5 text-yellow-500" />
              Always Free
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground dark:text-foreground">
              Completely free to use with no hidden costs, premium features, or usage limits. 
              We&apos;re committed to keeping it that way.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Technology Stack */}
      <Card className="mb-8 bg-background dark:bg-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground dark:text-foreground">
            <Code className="h-6 w-6 text-foreground" />
            Built with Modern Technology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background dark:bg-background">
              <div className="text-2xl font-bold text-foreground">Next.js</div>
              <div className="text-sm text-foreground dark:text-foreground">React Framework</div>
            </div>
            <div className="text-center p-4 bg-background dark:bg-background">
              <div className="text-2xl font-bold text-green-600">PDF-lib</div>
              <div className="text-sm text-foreground dark:text-foreground">PDF Processing</div>
            </div>
            <div className="text-center p-4 bg-background dark:bg-background">
              <div className="text-2xl font-bold text-foreground">Tailwind</div>
              <div className="text-sm text-foreground dark:text-foreground">Styling</div>
            </div>
            <div className="text-center p-4 bg-background dark:bg-background">
              <div className="text-2xl font-bold text-yellow-600">TypeScript</div>
              <div className="text-sm text-foreground dark:text-foreground">Type Safety</div>
            </div>
.
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <Card className="mb-8 bg-background dark:bg-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground dark:text-foreground">
            <TrendingUp className="h-6 w-6 text-green-500" />
            Our Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">10,000+</div>
              <div className="text-sm text-foreground dark:text-foreground">Files Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">5,000+</div>
              <div className="text-sm text-foreground dark:text-foreground">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">20+</div>
              <div className="text-sm text-foreground dark:text-foreground">PDF Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">100%</div>
              <div className="text-sm text-foreground dark:text-foreground">Free Forever</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Section */}
      <Card className="mb-8 bg-background dark:bg-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground dark:text-foreground">
            <Users className="h-6 w-6 text-foreground" />
            Meet the Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 overflow-hidden flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-r from-gray-600 to-gray-800 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">W</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-foreground">Wali Mohammad Kadri</h3>
            <p className="text-foreground dark:text-foreground mb-4">
              Full-stack developer passionate about building privacy-first tools that make a difference.
            </p>
            <p className="text-sm text-foreground dark:text-foreground">
              Based in Mumbai, India • Building the future, one line of code at a time
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="mb-8 bg-background dark:bg-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground dark:text-foreground">
            <Award className="h-6 w-6 text-yellow-500" />
            Get Involved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleSupportClick}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Coffee className="h-5 w-5 text-yellow-500" />
              Support Us
            </Button>
            <Button 
              onClick={handleContactClick}
              className="flex items-center gap-2"
            >
              <Coffee className="h-5 w-5 preserve-color" />
              Get in Touch
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-foreground dark:text-foreground">
        <p>
          Made with ❤️ for the community
        </p>
        <p className="text-sm mt-2">
          © 2024 Easy-PDF. All rights reserved.
        </p>
      </div>
    </div>
  );
}
