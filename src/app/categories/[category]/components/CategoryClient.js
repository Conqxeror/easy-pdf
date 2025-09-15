'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { toolCategories } from '@/lib/toolCategories';
import { toolsData } from '@/lib/toolData';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CategoryClient() {
  const params = useParams();
  const categoryName = params.category;
  const formattedCategoryName = categoryName.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const category = toolCategories.find(cat => cat.name.toLowerCase() === formattedCategoryName.toLowerCase());
  const tools = toolsData.filter(tool => tool.category?.toLowerCase() === formattedCategoryName.toLowerCase());

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl border border-gray-200">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p>The requested category of PDF tools could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {category.name} PDF Tools
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Explore our {category.name.toLowerCase()} PDF tools for all your document needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => (
          <Link href={tool.href} key={tool.href}>
            <Card className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  {tool.icon}
                  {tool.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  {tool.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
