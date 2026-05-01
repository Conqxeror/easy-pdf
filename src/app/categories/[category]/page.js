import React from 'react';
import { notFound } from 'next/navigation';
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
import { generateComprehensiveJsonLd, generateEnhancedMetadata } from "@/lib/seoEnhancements";
import { resolveSiteUrl } from '@/lib/siteUrl';

export async function generateMetadata({ params }) {
  const { category } = await params;
  const formattedCategory = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const resolvedSiteUrl = resolveSiteUrl();

  return generateEnhancedMetadata({
    title: `${formattedCategory} PDF Tools | easy-pdf`,
    description: `All ${formattedCategory.toLowerCase()} PDF tools in one place. Privacy-first, client-side processing. Free ${formattedCategory.toLowerCase()} PDF tools.`,
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
    canonicalUrl: `${resolvedSiteUrl}/categories/${category}`,
    metadataBaseUrl: resolvedSiteUrl,
    pageType: 'website',
    breadcrumbs: [
      { name: 'Home', url: resolvedSiteUrl },
      { name: 'Tools', url: `${resolvedSiteUrl}/tools` },
      { name: formattedCategory, url: `${resolvedSiteUrl}/categories/${category}` },
    ],
  });
}

const CategoryPage = async ({ params }) => {
  const { category } = await params;
  const normalizedCategory = slugify(category);
  const formattedCategory = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const structuredData = generateComprehensiveJsonLd('website', {
    title: `${formattedCategory} PDF Tools`,
    description: `All ${formattedCategory.toLowerCase()} PDF tools in one place.`,
    url: `${resolveSiteUrl()}/categories/${category}`
  });


  // Filter tools by category
  const categoryTools = toolsData.filter(tool =>
    tool.category &&
    slugify(tool.category) === normalizedCategory
  );

  if (categoryTools.length === 0) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader
        title={`${formattedCategory} PDF Tools`}
        subtitle={`All PDF tools in the ${formattedCategory.toLowerCase()} category`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </PageHeader>


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