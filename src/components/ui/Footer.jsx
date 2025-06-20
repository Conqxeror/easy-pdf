import Link from "next/link";

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
      { name: "HTML to PDF", href: "/html-to-pdf" },
      { name: "OCR", href: "/ocr" },
      { name: "Sign/Annotate PDF", href: "/sign" },
      { name: "PDF Form Filler", href: "/form-filler" },
      { name: "Word to PDF", href: "/word-to-pdf" },
      { name: "PDF to Word", href: "/pdf-to-word" },
    ],
  },
  {
    section: "Contact",
    links: [
      {
        name: "kadriwalimohammad@gmail.com",
        href: "mailto:kadriwalimohammad@gmail.com",
        external: true,
      },
    ],
  },
  {
    section: "About",
    links: [
      {
        name: "easy-pdf is a blazing-fast, privacy-first PDF toolkit for India and the world. 100% client-side, open-source, and SEO-optimized.",
        href: "https://easy-pdf-murex.vercel.app/",
        external: true,
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-gray-950 border-t border-gray-800 mt-12 py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {footerLinks.map((section) => (
          <div key={section.section} className="flex flex-col gap-2">
            <h2 className="text-lg font-bold mb-2 text-white">
              {section.section}
            </h2>
            <ul className="space-y-1">
              {section.links.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="text-blue-400 hover:underline text-sm break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.name}
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="hover:text-blue-400 underline-offset-2 hover:underline focus:outline-none focus:text-blue-500 text-sm"
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
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mt-8 gap-2 text-xs text-gray-400">
        <span>
          &copy; {new Date().getFullYear()} easy-pdf. All rights reserved.
        </span>
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
            url: "https://easy-pdf.in",
            contactPoint: [
              {
                "@type": "ContactPoint",
                email: "kadriwalimohammad@gmail.com",
                contactType: "customer support",
              },
            ],
          }),
        }}
      />
    </footer>
  );
}
