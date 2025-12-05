"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Copy, Check } from "lucide-react";

export default function UrlShortenerClient() {
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("shortened_links");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [copied, setCopied] = useState(null);

  const shorten = () => {
    if (!url) return;

    // Simple hash for ID
    const id = Math.random().toString(36).substring(2, 8);
    const shortUrl = `${window.location.origin}/s/${id}`;

    const newLink = {
      id,
      original: url,
      short: shortUrl,
      created: new Date().toISOString()
    };

    const newLinks = [newLink, ...links];
    setLinks(newLinks);
    localStorage.setItem("shortened_links", JSON.stringify(newLinks));
    setUrl("");
  };

  const remove = (id) => {
    const newLinks = links.filter(l => l.id !== id);
    setLinks(newLinks);
    localStorage.setItem("shortened_links", JSON.stringify(newLinks));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ToolPageLayout
      title="URL Shortener"
      subtitle="Create short links for your long URLs (Local Only)."
      toolName="URL Shortener"
      toolDescription="A privacy-focused URL shortener that runs entirely in your browser. Links are stored locally and work only on this device."
      currentTool="url-shortener"
      steps={[
        "Paste your long URL.",
        "Click 'Shorten'.",
        "Copy and use your new short link."
      ]}
      faqs={[
        {
          question: "Do these links work everywhere?",
          answer: "No, this is a local demo tool. The links are generated locally and stored in your browser's LocalStorage. They won't work if shared with others unless we implement a backend database."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "URL Shortener", href: "/url-shortener" }
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="https://example.com/very/long/url..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button onClick={shorten} disabled={!url}>Shorten</Button>
        </div>

        <div className="border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Original URL</TableHead>
                <TableHead>Short Link</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No links created yet.
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate" title={link.original}>
                      {link.original}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary-foreground">{link.short}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(link.short, link.id)}
                        >
                          {copied === link.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => remove(link.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </ToolPageLayout>
  );
}
