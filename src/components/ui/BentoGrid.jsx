import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BentoGrid({ tools }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border border border-border">
      {tools.map((tool, index) => {
        // Determine span for bento effect
        // Previously we used hard-coded indices which unintentionally made
        // particular tools (zip-extractor, merge, jpg-to-pdf, pdf-to-jpg, mp4-to-mp3)
        // take too much space. Avoid forcing large/wide spans for those tools.
        const shrinkList = new Set([
          '/zip-extractor',
          '/pdf/merge',
          '/jpg-to-pdf',
          '/pdf-to-jpg',
          '/mp4-to-mp3',
        ]);

        // Only allow large/wide spans when the tool is explicitly eligible
        // (previous default fallback kept some indexes large). This keeps the
        // grid more consistent and prevents the specified tools from dominating.
        const isEligibleLarge = (index === 0 || index === 6) && !shrinkList.has(tool.href);
        const isEligibleWide = (index === 3 || index === 4) && !shrinkList.has(tool.href);
        
        let spanClass = "col-span-1 row-span-1";
        if (isEligibleLarge) spanClass = "md:col-span-2 md:row-span-2";
        if (isEligibleWide) spanClass = "md:col-span-2";

        return (
          <Link 
            // tool.id was not present in toolData; use href as a stable unique key
            key={tool.href ?? tool.title ?? index}
            href={tool.href}
            className={cn(
              "group relative bg-background p-4 md:p-6 flex flex-col justify-between overflow-hidden transition-all duration-300",
              spanClass
            )}
          >
            <div className="relative z-10">
              <div className="mb-3 text-foreground group-hover:text-background transition-colors duration-300">
                {React.isValidElement(tool.icon) ? 
                  React.cloneElement(tool.icon, { 
                    size: isEligibleLarge ? 40 : 28, 
                    strokeWidth: 1.5,
                    className: "text-foreground group-hover:text-background transition-colors duration-300" 
                  }) 
                  : null
                }
              </div>
              <h3 className={cn(
                "font-bold tracking-tight mb-1 text-foreground group-hover:text-background transition-colors duration-300",
                isEligibleLarge ? "text-2xl" : "text-lg"
              )}>
                {tool.title}
              </h3>
              <p className="text-muted-foreground group-hover:text-background/80 text-xs leading-relaxed transition-colors duration-300 line-clamp-2">
                {tool.description}
              </p>
            </div>
            
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-background">
              <ArrowUpRight size={24} />
            </div>

            {/* Glitch/Scan effect overlay */}
            <div className="scan-line text-background" />
            <div className="absolute inset-0 bg-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" />
          </Link>
        );
      })}
    </div>
  );
}
