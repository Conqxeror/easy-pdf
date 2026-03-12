import React from 'react';
import { cn } from '@/lib/utils';
import { AccessibleHeading } from "@/components/ui/AccessibilityEnhancements";

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
      <div className="container-standard px-4 md:px-6 py-8">
        {title && (
          <h1 className={cn(
            "text-h1 font-extrabold mb-4",
            gradient && "gradient-text"
          )}>
            {title}
          </h1>
        )}
          {subtitle && (
          <p className="text-lg text-foreground mb-6 max-w-3xl mx-auto">
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
    <div 
      className={cn(
        "section-spacing",
        narrow ? "container-narrow" : "container-standard",
        className
      )} 
      {...props}
    >
      {children}
    </div>
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
      <div className="container-standard px-4 py-6 md:px-6 md:py-8">
        {title && (
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="text-base md:text-lg text-foreground max-w-3xl mx-auto">
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
        "card-standard bg-card border border-border rounded-none",
        hover && "hover:bg-foreground hover:text-background transition-colors duration-200",
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

  // Convert gap number to proper Tailwind class
  const gapClass = typeof gap === 'number' ? `gap-${gap}` : `gap-${gap}`;

  return (
    <div 
      className={cn(
        "grid",
        colsClass,
        gapClass,
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
  headingLevel = 1,
  ...props 
}) => {
  return (
    <section 
      className={cn(
        "relative section-spacing text-center overflow-hidden border-b border-border",
        backgroundImage && "bg-cover bg-center bg-no-repeat",
        className
      )}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
      {...props}
    >
      {/* Abstract Geometric Background */}
      {!backgroundImage && (
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
               </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#grid)" />
           </svg>
        </div>
      )}

      {overlay && backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-900/90 backdrop-blur-sm" />
      )}
      <div className="relative container-standard z-10">
        {title && (
          <AccessibleHeading
            level={headingLevel}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-none tracking-tighter mb-6 text-foreground dark:text-foreground animate-slide-up uppercase"
          >
            {title}
          </AccessibleHeading>
        )}
        {subtitle && (
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-slide-up font-light" style={{ animationDelay: '0.1s' }}>
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
    <Grid cols={2} gap="6" className={cn("mt-8", className)} {...props}>
      {features.map((feature, index) => (
        <Card 
          key={index} 
          className="text-center group animate-slide-up border-0 md:border border-border hover:bg-foreground hover:text-background transition-all duration-300 bg-transparent md:bg-card rounded-none"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
            {feature.icon && (
            <div className="flex items-center justify-center w-12 h-12 bg-background border border-border text-foreground mb-4 mx-auto group-hover:bg-background group-hover:text-foreground transition-transform duration-300">
              {feature.icon}
            </div>
          )}
          <h3 className="text-h4 font-semibold mb-2 text-inherit">{feature.title}</h3>
          <p className="text-muted-foreground group-hover:text-background/80">{feature.description}</p>
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
    <Section className={cn("bg-transparent md:bg-card border-0 md:border border-border rounded-none", className)} {...props}>
      <div className="text-center">
        {title && <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground dark:text-foreground">{title}</h2>}
        {subtitle && <p className="text-lg text-muted-foreground dark:text-foreground mb-8 max-w-2xl mx-auto">{subtitle}</p>}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryAction}
          {secondaryAction}
        </div>
      </div>
    </Section>
  );
};

// Removed duplicate ToolPageLayout component to avoid confusion
// The ToolPageLayout component is now in its own file at @/components/ui/ToolPageLayout.jsx

const Layout = {
  PageContainer,
  PageHeader,
  PageContent,
  Section,
  Card,
  Grid,
  Hero,
  FeatureGrid,
  CTASection
};

export default Layout;