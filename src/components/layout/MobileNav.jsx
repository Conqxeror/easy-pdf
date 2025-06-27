import Link from "next/link";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { toolCategories } from "@/lib/toolCategories";

export default function MobileNav({ isOpen, closeAllMenus }) {
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(null);
  const pathname = usePathname();

  return (
    isOpen && (
      <div className="md:hidden bg-gray-900 border-t border-gray-800 pb-2">
        {" "}
        <div className="px-2 pt-2 space-y-1 sm:px-3">
          {toolCategories.map((category) => (
            <div
              key={category.name}
              className="border-b border-gray-700 last:border-b-0"
            >
              {" "}
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
                    {category.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        onClick={closeAllMenus}
                        className={clsx(
                          "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2",
                          pathname === subItem.href
                            ? "bg-blue-600 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "transition-colors duration-200"
                        )}
                      >
                        {subItem.icon}
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
    )
  );
}
