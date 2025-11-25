import React from "react";
import Link from "next/link";
import { Github, Linkedin, Mail, PenTool } from "lucide-react";
import { Orbitron } from "next/font/google";
import { cn } from "@/lib/utils";
import FooterClient from './FooterClient';
import { toolCategories } from "@/lib/toolCategories";

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap'
});

const footerLinks = [
  {
    section: "Company",
    links: [
      { name: "About easy-pdf", href: "/about" },
      { name: "Sitemap", href: "/sitemap.xml" },
      { name: "Privacy Policy", href: "/security" },
      { name: "Buy me a coffee", href: "https://buymeacoffee.com/kadriwalimt", external: true },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border mt-20 pt-16 pb-8 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6">
            <Link
              href="/"
              className="flex items-center gap-2 group w-fit"
            >
              <div className="bg-primary/10 p-1.5 group-hover:bg-primary/20 transition-colors duration-300">
                <PenTool className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className={cn(orbitron.className, "text-2xl font-bold tracking-tight text-foreground")}>
                easy-pdf
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              A blazing-fast, privacy-first PDF toolkit. 100% client-side processing ensures your documents never leave your device. Completely free forever.
            </p>
            <div className="flex items-center gap-4">
              <SocialLink href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'kadriwalimohammad@gmail.com'}`} icon={<Mail size={18} />} label="Email" />
              <SocialLink href="https://www.linkedin.com/in/walimohammadkadri/" icon={<Linkedin size={18} />} label="LinkedIn" />
            </div>
            <div className="pt-2">
              <FooterClient />
            </div>
          </div>

          {/* Tools Section */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {toolCategories.map((category) => (
              <div key={category.name} className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="text-primary-foreground/80">{category.icon}</span>
                  {category.name}
                </h3>
                <ul className="space-y-2.5">
                  {category.submenu.slice(0, 6).map((tool) => (
                    <li key={tool.name}>
                      <Link 
                        href={tool.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 bg-border group-hover:bg-primary transition-colors" />
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                  {category.submenu.length > 6 && (
                    <li>
                      <Link 
                        href="/tools"
                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1 mt-2"
                      >
                        View all {category.name}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks[0].links.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} easy-pdf. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/security" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-foreground transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 flex items-center justify-center bg-background border border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300"
    >
      {icon}
    </a>
  );
}
