import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 rounded-none",
  {
    variants: {
      variant: {
        // Primary action - bold and prominent
        default:
          "bg-primary text-primary-foreground border border-primary hover:bg-background hover:text-primary transition-colors duration-200",
        
        // Destructive actions
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        
        // Bordered secondary actions
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        
        // Subtle secondary actions
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        
        // Minimal ghost button
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        
        // Text link style
        link: 
          "text-primary underline-offset-4 hover:underline",
        
        // NEW: Premium variant - subtle gradient, elegant
        premium:
          "bg-primary text-primary-foreground border border-primary hover:bg-background hover:text-primary transition-colors duration-200",
        
        // NEW: Subtle variant - barely visible, reveals on hover
        subtle:
          "bg-background/50 dark:bg-background/20 text-foreground dark:text-foreground border border-border/50 dark:border-border/50 hover:bg-background dark:hover:bg-background/30 hover:border-border dark:hover:border-border hover:shadow-sm focus-visible:ring-gray-500",
        
        // NEW: Elevated variant - strong shadow, prominent
        elevated:
          "bg-background text-foreground shadow-xl border border-border dark:border-border hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 focus-visible:ring-gray-500",
        
        // NEW: Glass variant - glassmorphism effect
        glass:
          "bg-background/70 dark:bg-background/70 backdrop-blur-xl text-foreground border border-white/30 dark:border-border/30 shadow-lg hover:bg-background/80 dark:hover:bg-background/80 hover:shadow-xl focus-visible:ring-gray-500",
        
        // Semantic status variants
        success:
          "bg-green-600 dark:bg-green-500 text-foreground shadow-md hover:bg-green-700 dark:hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-green-500",
        warning:
          "bg-yellow-600 dark:bg-yellow-500 text-foreground shadow-md hover:bg-yellow-700 dark:hover:bg-yellow-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-yellow-500",
        info:
          "bg-background dark:bg-background0 text-foreground shadow-md hover:bg-background dark:hover:bg-background hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-gray-500",
        
        // Bold gradient for hero CTAs
        gradient:
          "bg-primary text-primary-foreground border border-primary hover:bg-background hover:text-primary transition-colors duration-200",
      },
      size: {
        sm: "h-8 gap-1.5 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({ 
  className, 
  variant, 
  size, 
  asChild = false, 
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props 
}) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;

  // When asChild is true, just render children as-is (Slot requires single child)
  if (asChild) {
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  // Normal button rendering with icons and loading state
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      )}
      {!loading && leftIcon && (
        <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="shrink-0" aria-hidden="true">{rightIcon}</span>
      )}
      {loading && <span className="sr-only">Loading...</span>}
    </Comp>
  );
}

export { Button, buttonVariants };