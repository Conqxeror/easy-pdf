"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMenu } from "@/contexts/MenuContext";
import { cn } from "@/lib/utils";
import { Orbitron } from "next/font/google";
import { ThemeToggleSimple } from "@/components/ui/theme-toggle";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import { PenTool, Menu, X } from "lucide-react";

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
  variable: '--font-orbitron'
});

export default function Navbar() {
  const { isMenuOpen, toggleMenu } = useMenu();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(64);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set mounted for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMenuOpen) {
      toggleMenu();
    }
  }, [pathname]);

  // Measure header height so mobile overlay can be positioned exactly
  useLayoutEffect(() => {
    function measure() {
      try {
        const el = headerRef.current;
        if (el) setHeaderHeight(Math.ceil(el.getBoundingClientRect().height));
      } catch (e) {
        // ignore
      }
    }
    measure();
    window.addEventListener('resize', measure, { passive: true });
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prev || '';
    }
    return () => {
      document.body.style.overflow = prev || '';
    };
  }, [isMenuOpen]);

  const closeMenu = () => {
    if (isMenuOpen) {
      toggleMenu();
    }
  };

  const mobileMenuTop = headerHeight > 0 ? `${headerHeight}px` : "64px";

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        toggleMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, toggleMenu]);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
          scrolled || isMenuOpen
            ? "bg-background/80 backdrop-blur-xl border-border shadow-sm"
            : "bg-transparent border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col justify-center h-full">
            {/* Top row: Logo + controls share single row on mobile */}
            <div className="relative flex items-center justify-between gap-4 py-3 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-4">
              <div className="flex-shrink-0 flex items-center">
                <Link
                  href="/"
                  className="flex items-center gap-2 group focus:outline-none"
                  onClick={closeMenu}
                >
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-none bg-secondary/10 group-hover:bg-secondary/20 transition-colors duration-300">
                    <PenTool className="h-5 w-5 text-primary-foreground transition-transform duration-300 group-hover:-rotate-12" />
                  </div>
                  <span className={cn(
                    orbitron.className,
                    "text-xl font-bold text-foreground tracking-tight group-hover:text-primary-foreground transition-colors duration-300"
                  )}>
                    easy-pdf
                  </span>
                </Link>
              </div>

              <div className="hidden lg:flex justify-self-center w-full">
                <DesktopNav closeAllMenus={closeMenu} />
              </div>

              <div className="flex items-center gap-3 lg:justify-self-end">
                <div className="hidden lg:flex">
                  <ThemeToggleSimple />
                </div>
                <div className="flex items-center gap-4 lg:hidden">
                  <ThemeToggleSimple />
                  <button
                    type="button"
                    onClick={toggleMenu}
                    className="inline-flex items-center justify-center p-2 rounded-none text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors"
                    aria-expanded={isMenuOpen}
                    aria-controls="mobile-menu"
                  >
                    <span className="sr-only">
                      {isMenuOpen ? "Close main menu" : "Open main menu"}
                    </span>
                    {isMenuOpen ? (
                      <X className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Menu className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Portal - rendered outside header stacking context */}
      {mounted && isMenuOpen && createPortal(
        <>
          {/* Dark Overlay */}
          <div
            aria-hidden="true"
            className="lg:hidden fixed w-full bg-black opacity-100 pointer-events-auto"
            style={{ top: mobileMenuTop, height: `calc(100vh - ${mobileMenuTop})`, zIndex: 40 }}
            onClick={closeMenu}
          />
          {/* Mobile Menu Dialog */}
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal={isMenuOpen}
            aria-hidden={!isMenuOpen}
            className="lg:hidden fixed inset-x-0 opacity-100 pointer-events-auto overflow-y-auto text-white"
            style={{ top: mobileMenuTop, bottom: 0, zIndex: 41, height: `calc(100vh - ${mobileMenuTop})`, backgroundColor: '#1a1a2e' }}
          >
            <div className="pb-20">
              <MobileNav isOpen={isMenuOpen} closeAllMenus={closeMenu} />
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
