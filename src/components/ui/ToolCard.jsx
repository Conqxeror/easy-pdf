import React from "react";
import Link from "next/link";
import { Card } from "./Layout";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function ToolCard({ tool, className, showCategory = false }) {
  const isDisabled = tool.comingSoon;
  const isNew = tool.isNew;
  
  return (
    <Link
      href={isDisabled ? "#" : tool.href}
      className={cn(
        "group block transition-all duration-200",
        isDisabled && "pointer-events-none",
        className
      )}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
    >
      <Card 
        className={cn(
          "h-full group-hover:border-gray-500 group-hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col bg-gradient-to-br from-gray-800/80 to-gray-900/80 hover:from-gray-700/90 hover:to-gray-800/90 border border-gray-700 dark:border-gray-700",
          isDisabled && "opacity-60"
        )}
        padding="lg"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700/10 to-gray-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center justify-center text-gray-300 dark:text-gray-200 group-hover:scale-110 transition-transform duration-200">
            {tool.icon}
          </div>
          <div className="flex gap-1">
            {isNew && (
              <Badge variant="success" className="text-xs py-1 px-2">
                New
              </Badge>
            )}
            {isDisabled && (
              <Badge variant="warning" className="text-xs py-1 px-2">
                Soon
              </Badge>
            )}
          </div>
        </div>
        
        <h3 className="text-h4 font-semibold text-white dark:text-white group-hover:text-gray-200 mb-2 transition-colors">
          {tool.title}
        </h3>
        
        {showCategory && tool.category && (
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs py-1 px-2 bg-black/20">
              {tool.category}
            </Badge>
          </div>
        )}
        
        <p className="text-gray-300 dark:text-gray-300 text-sm leading-relaxed flex-grow">
          {tool.description}
        </p>
        
        {!isDisabled && (
          <div className="mt-4 pt-3 border-t border-gray-600 dark:border-gray-600">
            <span className="inline-flex items-center text-sm font-medium text-blue-400 group-hover:text-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 transition-colors">
              Try now
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          </div>
        )}
      </Card>
    </Link>
  );
}
