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
          "h-full group-hover:border-blue-500 group-hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50",
          isDisabled && "opacity-60"
        )}
        padding="lg"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg -z-10"></div>
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-200">
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
        
        <h3 className="text-h4 font-semibold text-white group-hover:text-blue-400 mb-2 transition-colors">
          {tool.title}
        </h3>
        
        {showCategory && tool.category && (
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs py-1 px-2 bg-gray-700/50">
              {tool.category}
            </Badge>
          </div>
        )}
        
        <p className="text-gray-400 text-sm leading-relaxed flex-grow">
          {tool.description}
        </p>
        
        {!isDisabled && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <span className="inline-flex items-center text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
              Try now
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          </div>
        )}
      </Card>
    </Link>
  );
}
