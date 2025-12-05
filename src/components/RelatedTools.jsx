import React from 'react';
import BentoGrid from '@/components/ui/BentoGrid';

export default function RelatedTools({ currentTool, tools }) {
  if (!currentTool || !tools) return null;

  // 1. Try to get explicitly related tools
  let relatedTools = [];
  if (currentTool.relatedTools && currentTool.relatedTools.length > 0) {
    relatedTools = tools.filter(t => currentTool.relatedTools.includes(t.href));
  }

  // 2. If not enough related tools, fill with tools from the same category
  if (relatedTools.length < 4 && currentTool.category) {
    const categoryTools = tools.filter(t => 
      t.category === currentTool.category && 
      t.href !== currentTool.href && 
      !relatedTools.some(rt => rt.href === t.href)
    );
    relatedTools = [...relatedTools, ...categoryTools];
  }

  // 3. If still not enough, fill with random tools (excluding current)
  if (relatedTools.length < 4) {
    const otherTools = tools.filter(t => 
      t.href !== currentTool.href && 
      !relatedTools.some(rt => rt.href === t.href)
    );
    // Shuffle and take needed amount
    const shuffled = otherTools.sort(() => 0.5 - Math.random());
    relatedTools = [...relatedTools, ...shuffled.slice(0, 4 - relatedTools.length)];
  }

  // Limit to 4 tools for a nice grid
  const displayTools = relatedTools.slice(0, 4);

  if (displayTools.length === 0) return null;

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-foreground">
        Related Tools
      </h2>
      <BentoGrid tools={displayTools} />
    </div>
  );
}
