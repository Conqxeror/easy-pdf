"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Menu, X, FileText, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });

const tools = [
  {
    name: "Merge PDF",
    href: "/merge",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    name: "Split PDF",
    href: "/split",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    name: "Compress PDF",
    href: "/compress",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    name: "Convert",
    icon: <FileText className="w-4 h-4" />,
    submenu: [
      { name: "JPG to PDF", href: "/jpg-to-pdf" },
      { name: "PDF to JPG", href: "/pdf-to-jpg" },
    ],
  },
  {
    name: "Edit",
    icon: <FileText className="w-4 h-4" />,
    submenu: [
      { name: "Rotate PDF", href: "/rotate" },
      { name: "Watermark PDF", href: "/watermark" },
      { name: "Protect PDF", href: "/protect" },
      { name: "Unlock PDF", href: "/unlock" },
    ],
  },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(null);
  const [desktopSubmenuOpen, setDesktopSubmenuOpen] = useState(null);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setMobileSubmenuOpen(null);
    }
  };

  const closeAllMenus = () => {
    setIsOpen(false);
    setMobileSubmenuOpen(null);
    setDesktopSubmenuOpen(null);
  };

  return (
    <nav
      className={clsx(
        "fixed w-full z-50 transition-all duration-300 border-b h-16",
        scrolled
          ? "bg-gray-900/95 backdrop-blur-md border-gray-800"
          : "bg-gray-900/80 backdrop-blur-sm border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              onClick={closeAllMenus}
            >
              <img
                src="/icon.png"
                alt="easy-pdf Logo"
                className="h-8 w-8"
                width={32}
                height={32}
              />
              <span className="text-xl font-bold text-white hidden sm:block">
                easy-pdf
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block h-full">
            <div className="ml-10 flex items-center space-x-4 h-full">
              {tools.map((item) => (
                <div
                  key={item.name}
                  className="relative h-full flex items-center"
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={clsx(
                        "px-3 py-2 rounded-md text-sm font-medium flex items-center h-full",
                        pathname === item.href
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      {item.icon}
                      <span className="ml-2">{item.name}</span>
                    </Link>
                  ) : (
                    <div className="relative h-full flex items-center">
                      <button
                        onClick={() =>
                          setDesktopSubmenuOpen(
                            desktopSubmenuOpen === item.name ? null : item.name
                          )
                        }
                        className={clsx(
                          "px-3 py-2 rounded-md text-sm font-medium flex items-center h-full",
                          desktopSubmenuOpen === item.name ||
                            item.submenu?.some((i) => pathname === i.href)
                            ? "bg-gray-800 text-white"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        )}
                      >
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                        <ChevronDown
                          className={clsx(
                            "ml-1 h-4 w-4 transition-transform",
                            desktopSubmenuOpen === item.name && "rotate-180"
                          )}
                        />
                      </button>

                      {desktopSubmenuOpen === item.name && (
                        <div className="absolute z-10 left-0 top-full mt-0 w-48 rounded-md shadow-lg bg-gray-800 border border-gray-700">
                          <div className="py-1">
                            {item.submenu?.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                onClick={() => setDesktopSubmenuOpen(null)}
                                className={clsx(
                                  "block px-4 py-2 text-sm flex items-center",
                                  pathname === subItem.href
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                )}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {tools.map((item) => (
              <div key={item.name}>
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={closeAllMenus}
                    className={clsx(
                      "group flex items-center px-3 py-2 rounded-md text-base font-medium",
                      pathname === item.href
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() =>
                        setMobileSubmenuOpen(
                          mobileSubmenuOpen === item.name ? null : item.name
                        )
                      }
                      className={clsx(
                        "group w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium",
                        mobileSubmenuOpen === item.name ||
                          item.submenu?.some((i) => pathname === i.href)
                          ? "bg-gray-800 text-white"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </div>
                      <ChevronDown
                        className={clsx(
                          "h-5 w-5 transform transition-transform",
                          mobileSubmenuOpen === item.name && "rotate-180"
                        )}
                      />
                    </button>

                    {mobileSubmenuOpen === item.name && (
                      <div className="pl-8 pt-1 pb-2 space-y-1">
                        {item.submenu?.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={closeAllMenus}
                            className={clsx(
                              "block px-3 py-2 rounded-md text-base font-medium",
                              pathname === subItem.href
                                ? "bg-blue-600 text-white"
                                : "text-gray-300 hover:bg-gray-800 hover:text-white"
                            )}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        <Navbar />
        {/* Add pt-16 (same as navbar height) to main content */}
        <main className="min-h-screen pt-16">{children}</main>
      </body>
    </html>
  );
}
