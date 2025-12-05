"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggleSimple } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Menu, X, PenTool } from "lucide-react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap'
});

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        scrolled ? "bg-background/80 backdrop-blur-md border-border py-2" : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-1.5 group-hover:bg-primary/20 transition-colors duration-300">
            <PenTool className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className={cn(orbitron.className, "text-2xl font-bold tracking-tight text-foreground")}>
            easy-pdf
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#tools" className="text-sm font-medium hover:text-muted-foreground transition-colors">
            Tools
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-muted-foreground transition-colors">
            About
          </Link>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggleSimple />
          <Button variant="outline" className="rounded-none border-foreground hover:bg-foreground hover:text-background transition-colors" asChild>
            <Link href="/#tools">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <ThemeToggleSimple />
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border p-4 flex flex-col gap-4 animate-in slide-in-from-top-5 shadow-2xl">
          <Link href="/#tools" className="text-lg font-medium py-2 border-b border-border/50">
            Tools
          </Link>
          <Link href="/about" className="text-lg font-medium py-2 border-b border-border/50">
            About
          </Link>
          <Button className="w-full rounded-none mt-4" asChild>
            <Link href="/#tools">Get Started</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
