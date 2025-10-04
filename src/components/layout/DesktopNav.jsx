import Link from "next/link";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState  } from "react";
import { usePathname } from "next/navigation";
import { toolCategories } from "@/lib/toolCategories";


export default function DesktopNav({ closeAllMenus }) {
  const [desktopSubmenuOpen, setDesktopSubmenuOpen] = useState(null);
  const pathname = usePathname();

  return (
    <div className="hidden md:block h-full">
      <div className="ml-10 flex items-center space-x-1 h-full">
        {toolCategories.map((category) => (
          <div
            key={category.name}
            className="relative h-full flex items-center group"
            onMouseEnter={() => setDesktopSubmenuOpen(category.name)}
            onMouseLeave={() => setDesktopSubmenuOpen(null)}
          >
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium flex items-center h-full transition-all duration-200",
                desktopSubmenuOpen === category.name ||
                  category.submenu.some((i) => pathname === i.href)
                  ? "bg-white/10 dark:bg-white/10 text-white backdrop-blur-sm shadow-md"
                  : "text-gray-300 dark:text-gray-300 hover:bg-white/5 dark:hover:bg-white/5 hover:text-white",
                "focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-transparent"
              )}
              aria-expanded={desktopSubmenuOpen === category.name}
              aria-haspopup="true"
              aria-label={`${category.name} tools menu`}
            >
              <span className="text-gray-400 dark:text-gray-400">{category.icon}</span>
              <span className="ml-2">{category.name}</span>
              <ChevronDown
                className={cn(
                  "ml-1.5 h-4 w-4 transition-transform duration-300",
                  desktopSubmenuOpen === category.name && "rotate-180"
                )}
              />
            </button>

            {desktopSubmenuOpen === category.name && (
              <div className="absolute z-10 left-0 top-full mt-2 w-64 shadow-2xl bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                <div className="py-2">
                  {category.submenu.map((subItem, index) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      onClick={closeAllMenus}
                      className={cn(
                        "mx-2 px-4 py-3 text-sm flex items-center gap-3 transition-all duration-200",
                        "animate-in fade-in-0 slide-in-from-left-2",
                        pathname === subItem.href
                          ? "bg-gray-50 dark:bg-gray-950/30 text-gray-800 dark:text-gray-300 font-medium shadow-sm"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-black/90 hover:text-gray-900 dark:hover:text-white",
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <span className="flex-shrink-0 text-gray-600 dark:text-gray-400">{subItem.icon}</span>
                      <span className="flex-1">{subItem.name}</span>
                      {subItem.popular && (
                        <Sparkles className="h-3 w-3 text-yellow-500" />
                      )}
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 mx-2 my-2" />
                  <Link
                    href="/tools"
                    onClick={closeAllMenus}
                    className="mx-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-950/30 flex items-center gap-2 transition-all duration-200 font-medium"
                  >
                    <span>View all {category.name.toLowerCase()} tools</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
