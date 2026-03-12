"use client";

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Link2, TriangleAlert } from 'lucide-react';

export default function ShortRedirectClient({ id }) {
  const lookupResult = useMemo(() => {
    if (typeof window === 'undefined') {
      return { status: 'loading', targetUrl: '' };
    }

    try {
      const savedLinks = JSON.parse(localStorage.getItem('shortened_links') || '[]');
      const matchedLink = savedLinks.find((entry) => entry.id === id);

      if (!matchedLink?.original) {
        return { status: 'missing', targetUrl: '' };
      }

      return { status: 'ready', targetUrl: matchedLink.original };
    } catch {
      return { status: 'error', targetUrl: '' };
    }
  }, [id]);

  const { status, targetUrl } = lookupResult;

  useEffect(() => {
    if (status === 'ready' && targetUrl) {
      window.location.replace(targetUrl);
    }
  }, [status, targetUrl]);

  const description = useMemo(() => {
    if (status === 'missing') {
      return 'This short link only works on the browser profile where it was created, and no local record was found for this ID.';
    }

    if (status === 'error') {
      return 'The redirect record could not be read from local storage.';
    }

    if (status === 'ready') {
      return `Redirecting to ${targetUrl}`;
    }

    return 'Looking up the destination in this browser\'s local storage.';
  }, [status, targetUrl]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            {status === 'loading' || status === 'ready' ? <Link2 className="h-5 w-5" /> : <TriangleAlert className="h-5 w-5" />}
            Local Short Link
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(status === 'loading' || status === 'ready') && (
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirect in progress…
            </div>
          )}

          {targetUrl && status !== 'loading' && (
            <Button asChild>
              <a href={targetUrl} rel="noreferrer" target="_self">Open destination</a>
            </Button>
          )}

          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/url-shortener">Back to URL Shortener</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}