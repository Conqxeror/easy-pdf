import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary action - bold and prominent
        default:
          "bg-gray-950 dark:bg-gray-500 text-white shadow-md hover:bg-gray-950 dark:hover:bg-gray-950 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-gray-500",
        
        // Destructive actions
        destructive:
          "bg-red-600 dark:bg-red-500 text-white shadow-md hover:bg-red-700 dark:hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-red-500",
        
        // Bordered secondary actions
        outline:
          "border border-gray-300 dark:border-gray-500 bg-transparent text-gray-900 dark:text-white shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-500 focus-visible:ring-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500",
        
        // Subtle secondary actions
        secondary:
          "bg-gray-200 dark:bg-black/80 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-300 dark:hover:bg-black/70 hover:shadow-md focus-visible:ring-gray-500",
        
        // Minimal ghost button
        ghost:
          "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white focus-visible:ring-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500",
        
        // Text link style
        link: 
          "text-gray-600 dark:text-gray-400 underline-offset-4 hover:underline focus-visible:ring-gray-500 px-0",
        
        // NEW: Premium variant - subtle gradient, elegant
        premium:
          "bg-gradient-to-b from-gray-500 to-gray-600 dark:from-gray-400 dark:to-gray-500 text-white shadow-lg hover:shadow-xl hover:from-gray-600 hover:to-gray-700 dark:hover:from-gray-500 dark:hover:to-gray-600 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-gray-500",
        
        // NEW: Subtle variant - barely visible, reveals on hover
        subtle:
          "bg-gray-100/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-black/30 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm focus-visible:ring-gray-500",
        
        // NEW: Elevated variant - strong shadow, prominent
        elevated:
          "bg-white dark:bg-black text-gray-900 dark:text-gray-100 shadow-xl border border-gray-200 dark:border-gray-600 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 focus-visible:ring-gray-500",
        
        // NEW: Glass variant - glassmorphism effect
        glass:
          "bg-white/70 dark:bg-black/70 backdrop-blur-md text-gray-900 dark:text-gray-100 border border-white/30 dark:border-gray-600/30 shadow-lg hover:bg-white/80 dark:hover:bg-black/80 hover:shadow-xl focus-visible:ring-gray-500",
        
        // Semantic status variants
        success:
          "bg-green-600 dark:bg-green-500 text-white shadow-md hover:bg-green-700 dark:hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-green-500",
        warning:
          "bg-yellow-600 dark:bg-yellow-500 text-white shadow-md hover:bg-yellow-700 dark:hover:bg-yellow-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-yellow-500",
        info:
          "bg-gray-950 dark:bg-gray-500 text-white shadow-md hover:bg-gray-950 dark:hover:bg-gray-950 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-gray-500",
        
        // Bold gradient for hero CTAs
        gradient:
          "bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white shadow-lg hover:shadow-2xl hover:from-gray-700 hover:via-gray-800 hover:to-gray-900 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-gray-500",
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