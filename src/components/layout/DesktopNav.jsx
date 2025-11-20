"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { toolCategories } from "@/lib/toolCategories";

const PANEL_CLASSNAME = "easy-pdf-nav-panel";
const PANEL_BASE_STYLES = "pointer-events-auto border border-border dark:border-border bg-background/95 dark:bg-background/95 shadow-[0_25px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl text-foreground";
const PANEL_ANIMATION = "overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200";
const OVERLAY_STYLES = "fixed inset-0 pointer-events-none z-[55] bg-background/20 dark:bg-background/60 backdrop-blur-2xl";

export default function DesktopNav({ closeAllMenus }) {
  const [desktopSubmenuOpen, setDesktopSubmenuOpen] = useState(null);
  const [dropdownOffset, setDropdownOffset] = useState(null);
  const [dropdownShift, setDropdownShift] = useState(0);
  const pathname = usePathname();
  const lastHoverRef = useRef(null);

  const recomputeOffset = (categoryName) => {
    const trigger = lastHoverRef.current;
    if (!trigger || typeof window === "undefined") return;

    const rect = trigger.getBoundingClientRect();
    const baseWidth = categoryName === "Convert & Create" ? 800 : 256;
    const maxWidth = Math.max(0, window.innerWidth - 16);
    const widthPx = Math.min(baseWidth, maxWidth);
    const center = rect.left + rect.width / 2;
    const minViewport = 8;
    const maxViewport = Math.max(minViewport, window.innerWidth - widthPx - 8);
    let leftViewport = Math.round(center - widthPx / 2);
    leftViewport = Math.max(minViewport, Math.min(leftViewport, maxViewport));
    const topViewport = Math.round(rect.bottom + 8);

    setDropdownOffset((current) => ({
      left: current?.left ?? null,
      width: widthPx,
      leftViewport,
      topViewport,
    }));
  };

  useEffect(() => {
    if (!desktopSubmenuOpen) return;
    const handleResize = () => recomputeOffset(desktopSubmenuOpen);
    const handleScroll = () => recomputeOffset(desktopSubmenuOpen);

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [desktopSubmenuOpen]);

  const chunkItems = (items, columnCount) => {
    if (!items.length) return [];
    if (columnCount <= 1) return [items];

    const perColumn = Math.ceil(items.length / columnCount);
    const columns = [];

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const start = columnIndex * perColumn;
      if (start >= items.length) break;
      const chunk = items.slice(start, start + perColumn);
      if (chunk.length) columns.push(chunk);
    }

    return columns;
  };

  return (
    <nav className="hidden lg:flex lg:flex-wrap lg:gap-x-4 lg:gap-y-2 items-center gap-1 h-auto justify-center">
      {toolCategories.map((category) => {
        const isOpen = desktopSubmenuOpen === category.name;

        const panelContent = (
          <>
            <div style={{ transform: `translateX(${dropdownShift}px)` }} className="relative">
              <div
                className={cn(
                  "p-4",
                  category.name === "Convert & Create"
                    ? "grid gap-6 grid-cols-3"
                    : "flex flex-col gap-1"
                )}
              >
                {(category.name === "Convert & Create"
                  ? chunkItems(category.submenu, 3)
                  : [category.submenu]
                ).map((columnItems, columnIndex) => (
                  <div key={`${category.name}-column-${columnIndex}`} className="space-y-1">
                    {columnItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        onClick={closeAllMenus}
                        className={cn(
                          "flex items-center gap-3 rounded-none px-3 py-2.5 text-sm transition-all duration-200 group/item",
                          pathname === subItem.href
                            ? "bg-primary/10 text-primary dark:text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/10 dark:hover:bg-background/15 dark:hover:text-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "flex-shrink-0 transition-colors duration-200",
                            pathname === subItem.href ? "text-primary dark:text-primary" : "text-muted-foreground group-hover/item:text-foreground dark:group-hover/item:text-foreground"
                          )}
                        >
                          {subItem.icon}
                        </span>
                        <span>{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-background/80 dark:bg-background/80 px-4 py-3 border-t border-border dark:border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {category.submenu.length} tools available
              </span>
              <Link
                href="/tools"
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                onClick={closeAllMenus}
              >
                View all tools
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </>
        );

        const renderDropdownPanel = () => {
          const panelClasses = cn(PANEL_BASE_STYLES, PANEL_ANIMATION, PANEL_CLASSNAME);
          const overlay = (
            <div
              data-testid="dropdown-overlay-fixed"
              className={OVERLAY_STYLES}
              style={{
                WebkitBackdropFilter: "blur(30px)",
                backdropFilter: "blur(30px)",
                willChange: "backdrop-filter",
              }}
            />
          );

          if (dropdownOffset?.leftViewport && typeof document !== "undefined") {
            return createPortal(
              <>
                {overlay}
                <div
                  className={panelClasses}
                  style={{
                    position: "fixed",
                    left: `${dropdownOffset.leftViewport}px`,
                    top: `${dropdownOffset.topViewport}px`,
                    width: `${dropdownOffset.width}px`,
                    zIndex: 60,
                  }}
                >
                  {panelContent}
                </div>
              </>,
              document.body
            );
          }

          return (
            <div
              className={panelClasses}
              style={
                dropdownOffset
                  ? { position: "absolute", left: `${dropdownOffset.left}px`, width: `${dropdownOffset.width}px`, zIndex: 60 }
                  : undefined
              }
            >
              {panelContent}
            </div>
          );
        };

        return (
          <div
            key={category.name}
            className="relative h-9 flex items-center group"
            onMouseEnter={(event) => {
              setDesktopSubmenuOpen(category.name);
              const triggerElement = event.currentTarget;
              lastHoverRef.current = triggerElement;
              recomputeOffset(category.name);

              if (typeof window !== "undefined") {
                setTimeout(() => {
                  const popup = document.querySelector(`.${PANEL_CLASSNAME}`);
                  if (!popup || !triggerElement) return;

                  const rect = triggerElement.getBoundingClientRect();
                  const baseWidth = category.name === "Convert & Create" ? 800 : 256;
                  const maxWidth = Math.max(0, window.innerWidth - 16);
                  const widthPx = Math.min(baseWidth, maxWidth);
                  const popupRect = popup.getBoundingClientRect();
                  const measured = Math.min(
                    Math.ceil(popup.scrollWidth || popupRect.width || widthPx),
                    Math.max(0, window.innerWidth - 16)
                  );
                  const center = rect.left + rect.width / 2;
                  const minViewport = 8;
                  const maxViewport = Math.max(minViewport, window.innerWidth - measured - 8);
                  let leftViewport = Math.round(center - measured / 2);
                  leftViewport = Math.max(minViewport, Math.min(leftViewport, maxViewport));
                  const topViewport = Math.round(rect.bottom + 8);
                  const wrapperRect = popup.parentElement?.getBoundingClientRect() ?? { left: 0 };
                  const leftInWrapper = Math.max(8, leftViewport - wrapperRect.left);

                  setDropdownOffset({
                    left: leftInWrapper,
                    width: measured,
                    leftViewport,
                    topViewport,
                  });

                  const min = 8;
                  let shift = 0;
                  if (popupRect.left < min) shift = min - popupRect.left;
                  else if (popupRect.right > window.innerWidth - min) {
                    shift = window.innerWidth - min - popupRect.right;
                  }
                  setDropdownShift(Math.round(shift));
                }, 0);
              }
            }}
            onMouseLeave={() => {
              setDesktopSubmenuOpen(null);
              setDropdownOffset(null);
              setDropdownShift(0);
            }}
          >
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium flex items-center gap-2 h-9 rounded-none transition-all duration-200",
                desktopSubmenuOpen === category.name ||
                  category.submenu.some((i) => pathname === i.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                "focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
              aria-expanded={desktopSubmenuOpen === category.name}
              aria-haspopup="true"
            >
              <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                {category.icon}
              </span>
              <span>{category.name}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-300 opacity-50 group-hover:opacity-100",
                  desktopSubmenuOpen === category.name && "rotate-180"
                )}
              />
            </button>

            {desktopSubmenuOpen === category.name && (
              <div
                className="absolute z-50 top-full mt-2 pt-2 left-0 right-0 flex pointer-events-none"
                style={{
                  width: "100vw",
                  marginLeft: "calc(-50vw + 50%)",
                  justifyContent: dropdownOffset ? "flex-start" : "center",
                }}
              >
                {renderDropdownPanel()}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
