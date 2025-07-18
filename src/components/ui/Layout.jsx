import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Standardized page layout component for consistent structure across all pages
 */

export const PageContainer = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn("min-h-screen bg-background text-foreground", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const PageHeader = ({ 
  title, 
  subtitle, 
  children, 
  className,
  gradient = true,
  ...props 
}) => {
  return (
    <header 
      className={cn(
        "section-spacing-sm text-center animate-slide-up",
        className
      )} 
      {...props}
    >
      <div className="container-standard">
        {title && (
          <h1 className={cn(
            "text-h1 font-extrabold mb-4",
            gradient && "gradient-text"
          )}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </header>
  );
};

export const PageContent = ({ children, className, narrow = false, ...props }) => {
  return (
    <main 
      className={cn(
        "section-spacing",
        narrow ? "container-narrow" : "container-standard",
        className
      )} 
      {...props}
    >
      {children}
    </main>
  );
};

export const Section = ({ 
  title, 
  subtitle, 
  children, 
  className,
  spacing = "default",
  ...props 
}) => {
  const spacingClass = spacing === "small" ? "section-spacing-sm" : "section-spacing";
  
  return (
    <section 
      className={cn(spacingClass, className)} 
      {...props}
    >
      <div className="container-standard">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-h2 font-bold mb-4">{title}</h2>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export const Card = ({ 
  children, 
  className, 
  hover = true, 
  padding = "default",
  ...props 
}) => {
  const paddingClass = {
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
    none: ""
  }[padding];

  return (
    <div 
      className={cn(
        "card-standard",
        hover && "hover:scale-[1.02] transition-transform duration-200",
        paddingClass,
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const Grid = ({ 
  children, 
  cols = "auto", 
  gap = "6", 
  className, 
  ...props 
}) => {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    auto: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  }[cols];

  return (
    <div 
      className={cn(
        "grid",
        colsClass,
        `gap-${gap}`,
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const Hero = ({ 
  title, 
  subtitle, 
  children, 
  className,
  backgroundImage,
  overlay = true,
  ...props 
}) => {
  return (
    <section 
      className={cn(
        "relative section-spacing text-center overflow-hidden",
        backgroundImage && "bg-cover bg-center bg-no-repeat",
        className
      )}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
      {...props}
    >
      {overlay && backgroundImage && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      )}
      <div className="relative container-standard">
        {title && (
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 gradient-text animate-slide-up">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {subtitle}
          </p>
        )}
        {children && (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
};

export const FeatureGrid = ({ features, className, ...props }) => {
  return (
    <Grid cols={3} gap="8" className={cn("mt-12", className)} {...props}>
      {features.map((feature, index) => (
        <Card 
          key={index} 
          className="text-center group animate-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {feature.icon && (
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 mx-auto group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
          )}
          <h3 className="text-h4 font-semibold mb-2">{feature.title}</h3>
          <p className="text-muted-foreground">{feature.description}</p>
        </Card>
      ))}
    </Grid>
  );
};

export const CTASection = ({ 
  title, 
  subtitle, 
  primaryAction, 
  secondaryAction,
  className,
  ...props 
}) => {
  return (
    <Section className={cn("bg-gradient-to-r from-primary/10 to-primary-light/10 rounded-2xl", className)} {...props}>
      <div className="text-center">
        {title && <h2 className="text-h2 font-bold mb-4">{title}</h2>}
        {subtitle && <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryAction}
          {secondaryAction}
        </div>
      </div>
    </Section>
  );
};

// Layout composition component for tool pages
export const ToolPageLayout = ({ 
  title, 
  subtitle, 
  children, 
  relatedTools, 
  className,
  ...props 
}) => {
  return (
    <PageContainer className={className} {...props}>
      <PageHeader title={title} subtitle={subtitle} />
      <PageContent>
        {children}
      </PageContent>
      {relatedTools && (
        <Section title="Related Tools" spacing="small">
          <Grid cols="auto" gap="6">
            {relatedTools}
          </Grid>
        </Section>
      )}
    </PageContainer>
  );
};

export default {
  PageContainer,
  PageHeader,
  PageContent,
  Section,
  Card,
  Grid,
  Hero,
  FeatureGrid,
  CTASection,
  ToolPageLayout,
};