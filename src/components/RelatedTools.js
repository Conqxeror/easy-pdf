import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react';
import { toolCategories } from '@/lib/toolCategories';
import { Card } from '@/components/ui/Layout';

const RelatedTools = ({ currentTool, tools }) => {
  // Get related tools based on categories and functionality
  const getRelatedTools = () => {
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
    <div className="container-standard">
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
          Related PDF Tools
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-start p-4 rounded-lg border border-gray-600 hover:border-blue-500 hover:bg-gray-700/50 transition-all duration-200"
            >
              <div className="flex items-start w-full">
                <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-600/20 transition-colors flex-shrink-0">
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors text-sm leading-tight mb-1">
                    {tool.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2 mt-0.5" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <Link
            href="/"
            className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center group"
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