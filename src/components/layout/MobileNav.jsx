import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toolCategories } from "@/lib/toolCategories";

const MOBILE_SUBMENU_MAX_HEIGHT = "calc(100vh - 160px)";
const slugifyCategory = (name) =>
  `mobile-submenu-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export default function MobileNav({ isOpen, closeAllMenus }) {
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) {
      setMobileSubmenuOpen(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="menu"
      aria-label="Easy PDF navigation"
      className="lg:hidden h-full overflow-y-auto"
    >
      <div className="px-4 pt-4 pb-20 space-y-4">
        {toolCategories.map((category) => {
          const categoryId = slugifyCategory(category.name);
          const isCategoryOpen = mobileSubmenuOpen === category.name;
          return (
            <div
              key={category.name}
              className="border border-border/50 overflow-hidden bg-card/95 rounded-lg shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  setMobileSubmenuOpen(
                    isCategoryOpen ? null : category.name
                  )
                }
                aria-expanded={isCategoryOpen}
                aria-controls={categoryId}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-4 text-base font-medium transition-all duration-200",
                  isCategoryOpen
                    ? "bg-muted/50 text-foreground"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "transition-colors duration-200",
                      isCategoryOpen ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    {category.icon}
                  </span>
                  <span>{category.name}</span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform duration-300 text-muted-foreground",
                    isCategoryOpen && "rotate-180 text-primary-foreground"
                  )}
                  aria-hidden="true"
                />
              </button>

              <div
                id={categoryId}
                role="region"
                aria-live="polite"
                aria-hidden={!isCategoryOpen}
                style={{
                  maxHeight: isCategoryOpen ? MOBILE_SUBMENU_MAX_HEIGHT : "0px",
                }}
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isCategoryOpen ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="px-2 pb-2 space-y-1 bg-muted/85 border-t border-border/50">
                  {category.submenu.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      onClick={closeAllMenus}
                      role="menuitem"
                      aria-current={pathname === subItem.href ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200",
                        pathname === subItem.href
                          ? "bg-primary/10 text-primary-foreground"
                          : "text-muted-foreground hover:bg-background hover:text-foreground"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex-shrink-0",
                          pathname === subItem.href
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {subItem.icon}
                      </span>
                      <span>{subItem.name}</span>
                    </Link>
                  ))}
                  <div className="pt-2 pb-1 px-2">
                    <Link
                      href="/tools"
                      onClick={closeAllMenus}
                      className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      <span>View all {category.name.toLowerCase()} tools</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
