import React from 'react'
import Link from 'next/link'
import { ChevronRight, PenTool } from 'lucide-react';
import { toolCategories } from '@/lib/toolCategories';
import { Card } from '@/components/ui/Layout';

const RelatedTools = ({ currentTool, tools }) => {
  // Get related tools based on relatedTools field in toolData, with fallback to category
  const getRelatedTools = () => {
    // Find current tool in tools array
    const currentToolData = tools.find(tool =>
      tool.href === `/${currentTool}` || tool.href === currentTool
    );

    // If current tool has relatedTools field, use that for best internal linking
    if (currentToolData && currentToolData.relatedTools && currentToolData.relatedTools.length > 0) {
      return tools
        .filter(tool => currentToolData.relatedTools.includes(tool.href))
        .slice(0, 4);
    }

    // Fallback: Get related tools based on categories
    let currentToolCategory = null;
    // Find the category of the current tool from toolCategories
    for (const category of toolCategories) {
      if (category.submenu.some(item => item.href === `/${currentTool}`)) {
        currentToolCategory = category.name;
        break;
      }
    }

    // If not found, try without the slash prefix
    if (!currentToolCategory) {
      for (const category of toolCategories) {
        if (category.submenu.some(item => item.href === currentTool)) {
          currentToolCategory = category.name;
          break;
        }
      }
    }

    if (!currentToolCategory) return [];

    return tools
      .filter(tool => {
        // Find the category of the tool being filtered
        let toolCategory = null;
        for (const category of toolCategories) {
          if (category.submenu.some(item => item.href === tool.href)) {
            toolCategory = category.name;
            break;
          }
        }
        return toolCategory === currentToolCategory && tool.href !== `/${currentTool}` && tool.href !== currentTool;
      })
      .slice(0, 4);
  }

  const relatedTools = getRelatedTools()

  if (relatedTools.length === 0) return null

  return (
    <div className="container-standard px-4 md:px-6 py-8">
      {/* Make the related tools card white in light theme; keep default dark bg in dark mode */}
      <Card className="bg-transparent md:bg-card border-0 md:border-2 border-border p-0 md:p-6 shadow-none md:shadow-xl">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
          <span className="mr-3 flex-shrink-0">
            <PenTool className="w-5 h-5 text-foreground" />
          </span>
          Related PDF Tools
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-start p-4 border-2 border-border hover:border-border hover:bg-background transition-all duration-200 bg-card md:bg-transparent"
            >
              <div className="flex items-start w-full">
                <div className="w-10 h-10 bg-background/10 flex items-center justify-center mr-3 group-hover:bg-background/20 transition-colors flex-shrink-0">
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground group-hover:text-foreground transition-colors text-sm leading-tight mb-1">
                    {tool.title}
                  </h4>
                  <p className="text-xs text-foreground leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-foreground group-hover:text-foreground transition-colors flex-shrink-0 ml-2 mt-0.5" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <Link
            href="/tools"
            className="text-sm text-foreground hover:text-foreground font-medium inline-flex items-center group"
          >
            View all PDF tools
            <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default RelatedTools