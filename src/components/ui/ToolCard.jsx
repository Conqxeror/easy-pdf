import React from "react";
import Link from "next/link";
import { Card } from "./Layout";
import { cn } from "@/lib/utils";

export default function ToolCard({ tool, className }) {
  const isDisabled = tool.comingSoon;
  
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
          "text-center h-full group-hover:border-primary group-hover:shadow-lg transition-all duration-200 relative overflow-hidden",
          isDisabled && "opacity-60"
        )}
        padding="lg"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg -z-10"></div>
        <div className="flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-200">
          {tool.icon}
        </div>
        
        <h3 className="text-h4 font-semibold text-foreground group-hover:text-primary mb-3 transition-colors flex items-center justify-center">
          {tool.title}
          {isDisabled && (
            <span className="ml-2 text-xs bg-warning/20 text-warning px-2 py-1 rounded-full">
              Coming Soon
            </span>
          )}
        </h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          {tool.description}
        </p>
        
        {!isDisabled && (
          <div className="mt-4">
            <span className="inline-flex items-center text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
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
