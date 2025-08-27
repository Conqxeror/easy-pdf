import Link from "next/link";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import React, { useState  } from "react";
import { usePathname } from "next/navigation";
import { toolCategories } from "@/lib/toolCategories";


export default function DesktopNav({ closeAllMenus }) {
  const [desktopSubmenuOpen, setDesktopSubmenuOpen] = useState(null);
  const pathname = usePathname();

  return (
    <div className="hidden md:block h-full">
      <div className="ml-10 flex items-center space-x-2 h-full">
        {toolCategories.map((category) => (
          <div
            key={category.name}
            className="relative h-full flex items-center group"
            onMouseEnter={() => setDesktopSubmenuOpen(category.name)}
            onMouseLeave={() => setDesktopSubmenuOpen(null)}
          >
            <button
              className={clsx(
                "px-3 py-2 rounded-lg text-sm font-medium flex items-center h-full transition-colors duration-200",
                desktopSubmenuOpen === category.name ||
                  category.submenu.some((i) => pathname === i.href)
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              )}
              aria-expanded={desktopSubmenuOpen === category.name}
              aria-haspopup="true"
              aria-label={`${category.name} tools menu`}
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
              <div className="absolute z-10 left-0 top-full mt-2 w-56 rounded-xl shadow-xl bg-gray-800 border border-gray-700 animate-fade-in-up">
                <div className="py-2">
                  {category.submenu.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      onClick={closeAllMenus}
                      className={clsx(
                        "px-4 py-3 text-sm flex items-center gap-3 transition-colors duration-200",
                        pathname === subItem.href
                          ? "bg-blue-600/20 text-white border-r-2 border-blue-500"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      )}
                    >
                      <span className="flex-shrink-0">{subItem.icon}</span>
                      <span>{subItem.name}</span>
                    </Link>
                  ))}
                  <div className="border-t border-gray-700 mt-2 pt-2">
                    <Link
                      href="/tools"
                      onClick={closeAllMenus}
                      className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors duration-200"
                    >
                      <span>View all {category.name.toLowerCase()} tools</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        
      </div>
    </div>
  );
}
