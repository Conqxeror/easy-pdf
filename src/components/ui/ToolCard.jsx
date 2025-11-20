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
          "h-full transition-all duration-300 relative overflow-hidden flex flex-col bg-card border-2 border-border hover:border-secondary/50 hover:shadow-lg hover:-translate-y-1",
          isDisabled && "opacity-60"
        )}
        padding="lg"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform duration-200">
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
        
        <h3 className="text-h4 font-bold text-foreground group-hover:text-secondary mb-2 transition-colors">
          {tool.title}
        </h3>
        
        {showCategory && tool.category && (
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs py-1 px-2">
              {tool.category}
            </Badge>
          </div>
        )}
        
        <p className="text-foreground text-sm leading-relaxed flex-grow">
          {tool.description}
        </p>
        
        {!isDisabled && (
          <div className="mt-4 pt-3 border-t border-border">
            <span className="inline-flex items-center text-sm font-medium text-primary-foreground group-hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary transition-colors">
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
