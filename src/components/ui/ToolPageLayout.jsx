import React from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/ui/Layout';
import ToolPageContent from '@/components/ui/ToolPageContent';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card } from '@/components/ui/card';

export const ToolPageLayout = ({ 
  title, 
  subtitle, 
  toolName,
  toolDescription,
  steps,
  faqs,
  currentTool,
  children,
  breadcrumbs = []
}) => {
  return (
    <PageContainer>
      <PageHeader 
        title={title}
        subtitle={subtitle}
        className="pt-20"
      />
      <PageContent className="pb-12">
        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <div className="mb-8">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
        
        {/* Main Tool Content */}
        <Card className="mb-12 p-6 md:p-8">
          {children}
        </Card>
        
        {/* How-to and FAQ Section */}
        <ToolPageContent
          toolName={toolName}
          toolDescription={toolDescription}
          steps={steps}
          faqs={faqs}
          currentTool={currentTool}
        />
      </PageContent>
    </PageContainer>
  );
};

export default ToolPageLayout;