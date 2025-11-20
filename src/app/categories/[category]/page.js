import React from 'react';
import { toolsData } from '@/lib/toolData';
import { slugify } from '@/lib/slugify';
import ToolCard from '@/components/ui/ToolCard';
import { 
  PageContainer, 
  PageHeader, 
  PageContent,
  Section,
  Grid
} from '@/components/ui/Layout';

export async function generateMetadata({ params }) {
  const category = params.category;
  const formattedCategory = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${formattedCategory} PDF Tools - easy-pdf | Free Online ${formattedCategory} PDF Tools`,
    description: `All ${formattedCategory.toLowerCase()} PDF tools in one place. Privacy-first, client-side processing with no file uploads. 100% free online ${formattedCategory.toLowerCase()} PDF tools for secure document processing.`,
    keywords: [
      `${formattedCategory} PDF tools`, 
      `PDF ${category.replace('-', ' ')}`, 
      `Free ${formattedCategory} PDF tools`,
      `Online ${formattedCategory} PDF tools`,
      `Privacy-first ${formattedCategory} PDF`,
      `Client-side ${formattedCategory} PDF processing`,
      `No upload ${formattedCategory} PDF tools`,
      `Secure ${formattedCategory} PDF tools`,
      `Browser-based ${formattedCategory} PDF tools`,
      `${formattedCategory} PDF editor`,
      `${formattedCategory} PDF processor`,
      `Online ${formattedCategory} PDF editor`,
      `Free online ${formattedCategory} PDF tools`
    ],
  };
}

const CategoryPage = ({ params }) => {
  const category = params.category;
  const normalizedCategory = slugify(category);
  const formattedCategory = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Filter tools by category
  const categoryTools = toolsData.filter(tool => 
    tool.category && 
    slugify(tool.category) === normalizedCategory
  );

  if (categoryTools.length === 0) {
    return (
      <PageContainer>
        <PageHeader 
          title="Category Not Found" 
          subtitle="The requested category does not exist or has no tools."
        />
        <PageContent>
          <div className="text-center py-12">
            <p className="text-foreground">No tools found in this category.</p>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title={`${formattedCategory} PDF Tools`} 
        subtitle={`All PDF tools in the ${formattedCategory.toLowerCase()} category`}
      />
      
      <PageContent>
        <Section>
          <Grid cols={4} gap="6">
            {categoryTools.map((tool) => (
              <ToolCard key={tool.href} tool={tool} showCategory />
            ))}
          </Grid>
        </Section>
      </PageContent>
    </PageContainer>
  );
};

export default CategoryPage;