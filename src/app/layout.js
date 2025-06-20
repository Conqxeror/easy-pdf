"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image"; // Import the Image component from next/image
import {
  Menu,
  X,
  FileText,
  ChevronDown,
  Combine,
  Spline,
  Shrink,
  FileImage, // Keep FileImage if used for icons, but actual image optimization needs next/image
  RotateCw,
  Stamp,
  Lock,
  Unlock,
  Eraser,
  ListOrdered,
  PlusCircle,
  FileCode,
  Search,
  Signature,
  FileBadge,
  FileType,
  FileTextIcon,
  Text,
  Minimize2,
  FileBadge2,
} from "lucide-react"; // Import all necessary icons
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Footer from "@/components/ui/Footer";

const inter = Inter({ subsets: ["latin"] });

// Categorized tools for better dropdown organization
const toolCategories = [
  {
    name: "Convert & Create",
    icon: <FileTextIcon className="w-4 h-4" />,
    submenu: [
      {
        name: "JPG to PDF",
        href: "/jpg-to-pdf",
        icon: <FileImage className="w-4 h-4" />, // This FileImage is from lucide-react, not next/image
      },
      {
        name: "PDF to JPG",
        href: "/pdf-to-jpg",
        icon: <FileImage className="w-4 h-4" />,
      },
      {
        name: "HTML to PDF",
        href: "/html-to-pdf",
        icon: <FileCode className="w-4 h-4" />,
      },
      {
        name: "Word to PDF",
        href: "/word-to-pdf",
        icon: <FileType className="w-4 h-4" />,
      },
      {
        name: "PDF to Word",
        href: "/pdf-to-word",
        icon: <FileTextIcon className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Organize & Edit",
    icon: <ListOrdered className="w-4 h-4" />,
    submenu: [
      {
        name: "Merge PDF",
        href: "/merge",
        icon: <Combine className="w-4 h-4" />,
      },
      {
        name: "Split PDF",
        href: "/split",
        icon: <Spline className="w-4 h-4" />,
      },
      {
        name: "Reorder PDF Pages",
        href: "/reorder",
        icon: <ListOrdered className="w-4 h-4" />,
      },
      {
        name: "Delete PDF Pages",
        href: "/delete-pages",
        icon: <Eraser className="w-4 h-4" />,
      },
      {
        name: "Rotate PDF",
        href: "/rotate",
        icon: <RotateCw className="w-4 h-4" />,
      },
      {
        name: "Organize PDF",
        href: "/organize",
        icon: <ListOrdered className="w-4 h-4" />,
      }, // Keeping this as a separate tool for its distinct UI
    ],
  },
  {
    name: "Optimize & Secure",
    icon: <Shrink className="w-4 h-4" />,
    submenu: [
      {
        name: "Compress PDF",
        href: "/compress",
        icon: <Minimize2 className="w-4 h-4" />,
      },
      {
        name: "Protect PDF",
        href: "/protect",
        icon: <Lock className="w-4 h-4" />,
      },
      {
        name: "Unlock PDF",
        href: "/unlock",
        icon: <Unlock className="w-4 h-4" />,
      },
      {
        name: "Watermark PDF",
        href: "/watermark",
        icon: <Stamp className="w-4 h-4" />,
      },
      {
        name: "Add Page Numbers",
        href: "/page-numbers",
        icon: <PlusCircle className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Advanced Tools",
    icon: <FileBadge2 className="w-4 h-4" />, // Example icon for advanced tools
    submenu: [
      { name: "OCR", href: "/ocr", icon: <Search className="w-4 h-4" /> },
      {
        name: "Sign/Annotate PDF",
        href: "/sign",
        icon: <Signature className="w-4 h-4" />,
      },
      {
        name: "PDF Form Filler",
        href: "/form-filler",
        icon: <Text className="w-4 h-4" />,
      },
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
              <Image // Changed <img> to <Image>
                src="/icon.png"
                alt="easy-pdf Logo"
                className="h-8 w-8"
                width={32} // Ensure width and height are provided for next/image
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
              {toolCategories.map((category) => (
                <div
                  key={category.name}
                  className="relative h-full flex items-center group" // Added group for hover effect
                  onMouseEnter={() => setDesktopSubmenuOpen(category.name)}
                  onMouseLeave={() => setDesktopSubmenuOpen(null)}
                >
                  <button
                    className={clsx(
                      "px-3 py-2 rounded-md text-sm font-medium flex items-center h-full",
                      desktopSubmenuOpen === category.name ||
                        category.submenu.some((i) => pathname === i.href)
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white",
                      "transition-colors duration-200"
                    )}
                  >
                    {category.icon}
                    <span className="ml-2">{category.name}</span>
                    <ChevronDown
                      className={clsx(
                        "ml-1 h-4 w-4 transition-transform duration-200",
                        desktopSubmenuOpen === category.name && "rotate-180"
                      )}
                    />
                  </button>

                  {desktopSubmenuOpen === category.name && (
                    <div className="absolute z-10 left-0 top-full mt-0 w-56 rounded-md shadow-lg bg-gray-800 border border-gray-700 animate-fade-in-up">
                      {" "}
                      {/* Increased width */}
                      <div className="py-1">
                        {category.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={closeAllMenus} // Close all menus on submenu item click
                            className={clsx(
                              "px-4 py-2 text-sm flex items-center gap-2", // Added gap-2 for icon
                              pathname === subItem.href
                                ? "bg-blue-600 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "transition-colors duration-200"
                            )}
                          >
                            {subItem.icon} {/* Display icon */}
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
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
        <div className="md:hidden bg-gray-900 border-t border-gray-800 pb-2">
          {" "}
          {/* Added pb-2 */}
          <div className="px-2 pt-2 space-y-1 sm:px-3">
            {toolCategories.map((category) => (
              <div
                key={category.name}
                className="border-b border-gray-700 last:border-b-0"
              >
                {" "}
                {/* Separator */}
                <div>
                  <button
                    onClick={() =>
                      setMobileSubmenuOpen(
                        mobileSubmenuOpen === category.name
                          ? null
                          : category.name
                      )
                    }
                    className={clsx(
                      "group w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium",
                      mobileSubmenuOpen === category.name ||
                        category.submenu.some((i) => pathname === i.href)
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white",
                      "transition-colors duration-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {" "}
                      {/* Increased gap for mobile icons */}
                      {category.icon}
                      <span>{category.name}</span>
                    </div>
                    <ChevronDown
                      className={clsx(
                        "h-5 w-5 transform transition-transform duration-200",
                        mobileSubmenuOpen === category.name && "rotate-180"
                      )}
                    />
                  </button>

                  {mobileSubmenuOpen === category.name && (
                    <div className="pl-6 pt-1 pb-2 space-y-1 bg-gray-800 rounded-b-md">
                      {" "}
                      {/* Increased padding and added background */}
                      {category.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          onClick={closeAllMenus}
                          className={clsx(
                            "block px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2", // Added gap for icon
                            pathname === subItem.href
                              ? "bg-blue-600 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            "transition-colors duration-200"
                          )}
                        >
                          {subItem.icon} {/* Display icon */}
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

function LanguageSwitcher() {
  return (
    <div className="flex gap-2 items-center ml-auto">
      <span className="text-xs text-gray-400">Language:</span>
      <button
        className="text-blue-500 underline"
        aria-label="Switch to English"
      >
        EN
      </button>
      <button className="text-blue-500 underline" aria-label="Switch to Hindi">
        हिंदी
      </button>
      <button
        className="text-blue-500 underline"
        aria-label="Switch to Marathi"
      >
        मराठी
      </button>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        <Navbar />
        {/* Add pt-16 (same as navbar height) to main content */}
        <main className="min-h-screen pt-16" aria-label="Main content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
