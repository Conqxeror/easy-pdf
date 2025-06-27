import Link from "next/link";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { toolCategories } from "@/lib/toolCategories";

export default function DesktopNav({ closeAllMenus }) {
  const [desktopSubmenuOpen, setDesktopSubmenuOpen] = useState(null);
  const pathname = usePathname();

  return (
    <div className="hidden md:block h-full">
      <div className="ml-10 flex items-center space-x-4 h-full">
        {toolCategories.map((category) => (
          <div
            key={category.name}
            className="relative h-full flex items-center group"
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
                <div className="py-1">
                  {category.submenu.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      onClick={closeAllMenus}
                      className={clsx(
                        "px-4 py-2 text-sm flex items-center gap-2",
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
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
