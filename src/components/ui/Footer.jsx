import React from "react";
import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react"; // Import necessary icons

// Define the footer links structure
const footerLinks = [
  {
    section: "Tools",
    links: [
      { name: "Merge PDF", href: "/merge" },
      { name: "Split PDF", href: "/split" },
      { name: "Compress PDF", href: "/compress" },
      { name: "JPG to PDF", href: "/jpg-to-pdf" },
      { name: "PDF to JPG", href: "/pdf-to-jpg" },
      { name: "Rotate PDF", href: "/rotate" },
      { name: "Watermark PDF", href: "/watermark" },
      { name: "Protect PDF", href: "/protect" },
      { name: "Unlock PDF", href: "/unlock" },
      { name: "Delete PDF Pages", href: "/delete-pages" },
      { name: "Reorder PDF Pages", href: "/reorder" },
      { name: "Organize PDF", href: "/organize" },
      { name: "Add Page Numbers", href: "/page-numbers" },
      
      { name: "OCR", href: "/ocr" },
      { name: "Sign/Annotate PDF", href: "/sign" },
      { name: "PDF Form Filler", href: "/form-filler" },
      { name: "Certificate Generator", href: "/certificate-generator" },
      { name: "Invoice Generator", href: "/invoice-generator" },
      { name: "Portfolio Creator", href: "/portfolio-creator" },
      { name: "QR Generator", href: "/qr-generator" },
      { name: "Report Generator", href: "/report-generator" },
      { name: "Legal Document Analyzer", href: "/legal-analyzer" },
      { name: "Medical Document Analyzer", href: "/medical-analyzer" },
    ],
  },
  {
    section: "Company",
    links: [
      {
        name: "About easy-pdf",
        href: "https://easy-pdf-murex.vercel.app/about",
        external: true,
      },
      {
        name: "Sitemap", // Added Sitemap link
        href: "/sitemap.xml", // Assuming your sitemap is at /sitemap.xml
        external: true,
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
    <footer className="w-full bg-gray-950 border-t border-gray-800 mt-16 py-12 px-4 font-inter">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-8">
        {/* Branding/About Section */}
        <div className="flex flex-col gap-4 col-span-full md:col-span-2 lg:col-span-1">
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
        </div>

        {/* Dynamic Footer Links Sections (Tools & Company) */}
        {footerLinks.map((section) => (
          <div
            key={section.section}
            className={`flex flex-col gap-3 ${
              section.section === "Tools"
                ? "col-span-full md:col-span-2" // Tools section spans 2 columns on medium+ screens
                : "col-span-full md:col-span-1" // Company section takes 1 column
            }`}
          >
            <h2 className="text-xl font-semibold mb-3 text-white">
              {section.section}
            </h2>
            {section.section === "Tools" ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-blue-400 transition-colors text-base break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.name}
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-blue-400 transition-colors text-base"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}

                {/* New Contact Section */}
                <div className="flex flex-col gap-3 col-span-full md:col-span-1 pt-4">
                  {" "}
                  {/* This will naturally sit after Company if Tools is col-span-2 */}
                  <h2 className="text-xl font-semibold mb-3 text-white">
                    Contact:
                  </h2>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="mailto:kadriwalimohammad@gmail.com"
                        aria-label="Email"
                        className="text-gray-400 hover:text-red-400 transition-colors text-base flex items-center gap-2"
                      >
                        <Mail size={18} /> kadriwalimohammad@gmail.com
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.linkedin.com/in/walimohammadkadri/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn Profile"
                        className="text-gray-400 hover:text-blue-500 transition-colors text-base flex items-center gap-2"
                      >
                        <Linkedin size={18} /> LinkedIn Profile
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://github.com/Conqxeror"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub Profile"
                        className="text-gray-400 hover:text-gray-300 transition-colors text-base flex items-center gap-2"
                      >
                        <Github size={18} /> GitHub Profile
                      </a>
                    </li>
                  </ul>
                </div>
              </ul>
            )}
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
