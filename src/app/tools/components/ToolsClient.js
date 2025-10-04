"use client";

import React, { useState, useMemo } from 'react';
import { toolsData } from '@/lib/toolData';
import { toolCategories } from '@/lib/toolCategories';
import ToolCard from '@/components/ui/ToolCard.jsx';
import {
  PageContainer,
  PageHeader,
  PageContent,
  Section,
  Grid
} from '@/components/ui/Layout.jsx';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ToolsClient() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tools based on search query
  const filteredTools = useMemo(() => {
    if (!searchQuery) return toolsData;

    const query = searchQuery.toLowerCase();
    return toolsData.filter(tool =>
      tool.title.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.keywords?.some(keyword => keyword.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Group tools by category
  const toolsByCategory = useMemo(() => {
    const categories = {};

    // Initialize all categories
    toolCategories.forEach(category => {
      categories[category.name] = {
        ...category,
        tools: []
      };
    });

    // Add tools to their respective categories
    filteredTools.forEach(tool => {
      const toolCategory = tool.category;
      if (toolCategory && categories[toolCategory]) {
        categories[toolCategory].tools.push(tool);
      }
    });

    // Convert to array and filter out empty categories
    return Object.values(categories).filter(category => category.tools.length > 0);
  }, [filteredTools]);

  return (
    <PageContainer>
      <PageHeader
        title="All PDF Tools"
        subtitle="Complete suite of PDF tools organized by category for all your document needs"
      >
        <div className="max-w-2xl mx-auto mt-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for tools..."
              className="pl-10 py-6 text-lg bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 focus:border-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </PageHeader>

      <PageContent>
        {filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">No tools found</h3>
            <p className="text-gray-400">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="space-y-16">
            {toolsByCategory.map((category) => (
              <Section
                key={category.name}
                title={
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">
                      {category.icon}
                    </span>
                    {category.name}
                  </div>
                }
                className="text-left"
              >
                <Grid cols={4} gap="6">
                  {category.tools.map((tool) => (
                    <ToolCard key={tool.href} tool={tool} showCategory />
                  ))}
                </Grid>
              </Section>
            ))}
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
}