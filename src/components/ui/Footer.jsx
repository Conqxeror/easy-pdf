import React from "react";
import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { toolCategories } from "@/lib/toolCategories";

// Define the footer links structure
const footerLinks = [
  {
    section: "Company",
    links: [
      {
        name: "About easy-pdf",
        href: "/about",
        external: false,
      },
      {
        name: "Sitemap",
        href: "/sitemap.xml",
        external: false,
      },
      {
        name: "Privacy Policy",
        href: "/security",
        external: false,
      },
      { name: "Sponsors", href: "/sponsors" },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-t from-gray-950 to-gray-900 border-t border-gray-800 mt-16 py-12 px-4 font-inter">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Branding/About Section */}
        <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
          <Link
            href="/"
            className="text-3xl font-extrabold text-white hover:text-blue-400 transition-colors"
          >
            easy-pdf
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed">
            easy-pdf is a blazing-fast, privacy-first PDF toolkit for India and
            the world. 100% client-side, open-source, and SEO-optimized.
          </p>
          <div className="flex space-x-4 mt-2">
            <a
              href="mailto:kadriwalimohammad@gmail.com"
              aria-label="Email"
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <Mail size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/walimohammadkadri/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="https://github.com/Conqxeror"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
        </div>

        {/* Tools Section - Organized by Categories */}
        <div className="md:col-span-2 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-white">PDF Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {toolCategories.map((category) => (
              <div key={category.name} className="flex flex-col gap-3">
                <h3 className="text-base font-medium text-blue-400 flex items-center gap-2">
                  {category.icon}
                  {category.name}
                </h3>
                <ul className="space-y-2">
                  {category.submenu.slice(0, 4).map((tool) => (
                    <li key={tool.href}>
                      <Link
                        href={tool.href}
                        className="text-gray-400 hover:text-blue-400 transition-colors text-sm hover:underline flex items-center gap-1"
                      >
                        {tool.icon}
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href="/tools"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View all tools
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>

        {/* Company Section */}
        {footerLinks.map((section) => (
          <div key={section.section} className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {section.section}
            </h2>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors text-base break-all hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.name}
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors text-base hover:underline"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Copyright and Bottom Info */}
      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <span>&copy; {currentYear} easy-pdf. All rights reserved.</span>
        <span className="text-gray-600">Made with &hearts; in India.</span>
      </div>

      {/* SEO: Organization structured data */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "easy-pdf",
            url: "https://easy-pdf-murex.vercel.app/",
            contactPoint: [
              {
                "@type": "ContactPoint",
                email: "kadriwalimohammad@gmail.com",
                contactType: "customer support",
              },
            ],
            sameAs: [
              "https://www.linkedin.com/in/walimohammadkadri/",
              "https://github.com/Conqxeror",
            ],
          }),
        }}
      />
    </footer>
  );
}
