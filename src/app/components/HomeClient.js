"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toolsData } from "@/lib/toolData";
import { trackEvent } from "@/lib/analytics";
import { usePerformanceMonitoring } from "@/components/ui/AccessibilityEnhancements";
import { useWebVitals } from "@/hooks/useWebVitals";
import StatsSection from "@/components/ui/StatsSection";
import Supporters from "@/components/ui/Supporters";
import BentoGrid from "@/components/ui/BentoGrid";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomeClient() {
  const [installPrompt, setInstallPrompt] = useState(null);

  usePerformanceMonitoring();
  useWebVitals();

  useEffect(() => {
    trackEvent("homepage_viewed", {
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
    });

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    trackEvent("pwa_install_result", { outcome });
    setInstallPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col justify-center items-center border-b border-border overflow-hidden py-12">
        {/* Abstract Geometric Background */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
               </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#grid)" />
           </svg>
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-4 leading-none"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            YOUR DATA.<br/>
            YOUR DEVICE.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/50">
              TOTAL PRIVACY.
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            The privacy-first PDF toolkit that runs entirely in your browser. 
            No uploads. No servers. No compromises.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button size="lg" className="text-base px-8 h-12 rounded-none" onClick={() => document.getElementById('tools').scrollIntoView({ behavior: 'smooth' })}>
              Start Encrypting <ArrowRight className="ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 h-12 rounded-none">
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Supporters Section */}
      <Supporters />

      {/* Stats Section */}
      <StatsSection />

      {/* Tools Section (Bento Grid) */}
      <section id="tools" className="py-24 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
              PRECISION TOOLS
            </h2>
            <div className="h-px w-full bg-border"></div>
          </div>
          
          <BentoGrid tools={toolsData} />
        </div>
      </section>

      {/* PWA Install Button (Floating) */}
      {installPrompt && (
        <motion.div 
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button onClick={handleInstallClick} size="lg" className="shadow-none border-2 border-foreground">
            Install App
          </Button>
        </motion.div>
      )}
    </div>
  );
}
