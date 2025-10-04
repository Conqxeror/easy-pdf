import Link from "next/link";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import React, { useState  } from "react";
import { usePathname } from "next/navigation";
import { toolCategories } from "@/lib/toolCategories";

export default function MobileNav({ isOpen, closeAllMenus }) {
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(null);
  const pathname = usePathname();

  return (
    isOpen && (
  <div className="md:hidden bg-black border-t border-gray-700 pb-4">
        <div className="px-4 pt-3 space-y-2">
          {toolCategories.map((category) => (
            <div
              key={category.name}
              className="border-b border-gray-700 last:border-b-0"
            >
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
                    "group w-full flex items-center justify-between px-4 py-3 text-base font-medium",
                    mobileSubmenuOpen === category.name ||
                      category.submenu.some((i) => pathname === i.href)
                      ? "bg-black/20 text-white"
                        : "text-gray-300 hover:bg-black/90 hover:text-white",
                    "transition-colors duration-200"
                  )}
                >
                  <div className="flex items-center gap-3">
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
                  <div className="pl-8 pt-2 pb-3 space-y-1 bg-black/60">
                    {category.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        onClick={closeAllMenus}
                        className={clsx(
                          "px-4 py-2.5 text-sm font-medium flex items-center gap-3",
                          pathname === subItem.href
                            ? "bg-gray-950/20 text-white border-r-2 border-gray-600"
                            : "text-gray-300 hover:bg-gray-950 hover:text-white",
                          "transition-colors duration-200"
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
                        className="px-4 py-2 text-sm text-gray-400 hover:text-gray-300 flex items-center gap-2 transition-colors duration-200"
                      >
                        <span>View all {category.name.toLowerCase()} tools</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );
}
