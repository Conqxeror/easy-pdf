import React from 'react';
import { Section, Grid } from '@/components/ui/Layout';
import ToolCard from '@/components/ui/ToolCard';
import { toolCategories } from '@/lib/toolCategories';
import { slugify } from '@/lib/slugify';
import { toolsData } from '@/lib/toolData';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const CategorizedToolsSection = () => {
  // Create a map of tool href to tool data for quick lookup
  const toolsMap = toolsData.reduce((acc, tool) => {
    acc[tool.href] = tool;
    return acc;
  }, {});

  return (
    <Section 
      id="tools"
      title="All PDF Tools"
      subtitle="Complete suite of PDF tools organized by category for all your document needs"
    >
      <div className="space-y-16">
        {toolCategories.map((category) => {
          // Get tools for this category
          const categoryTools = category.submenu
            .map(item => toolsMap[item.href])
            .filter(tool => tool !== undefined)
            .slice(0, 4); // Limit to 4 tools per category for homepage

          if (categoryTools.length === 0) return null;

          return (
            <div key={category.name} className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-blue-400">
                    {category.icon}
                  </span>
                  {category.name}
                </h3>
                <Link 
                  href={`/categories/${slugify(category.name)}`}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center group"
                >
                  View all
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              
              <Grid cols={4} gap="6">
                {categoryTools.map((tool) => (
                  <ToolCard key={tool.href} tool={tool} />
                ))}
              </Grid>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 text-center">
        <Link 
          href="/tools"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium group"
        >
          View all PDF tools
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </Section>
  );
};

export default CategorizedToolsSection;