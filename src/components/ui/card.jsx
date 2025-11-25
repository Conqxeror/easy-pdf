import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "flex flex-col transition-all duration-200 rounded-none",
  {
    variants: {
      variant: {
        // Default card - subtle elevation
        default: "bg-background text-foreground border border-border hover:bg-foreground hover:text-background transition-all duration-200",
        
        // Elevated card - stronger shadow, lifts on hover
        elevated: "bg-card text-foreground border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all",
        
        // Glass card - glassmorphism effect
        // Change to solid white in light mode for highest contrast, preserve translucency in dark mode
        glass: "bg-card dark:bg-background/90 backdrop-blur-xl text-foreground border border-border/50 dark:border-border/50 shadow-lg",
        
        // Interactive card - for clickable cards
        interactive: "bg-background text-foreground border border-border hover:bg-foreground hover:text-background transition-all duration-200 cursor-pointer",
        
        // Flat card - no shadow, subtle border
        flat: "bg-card dark:bg-background text-foreground border-2 border-border",
        
        // Outlined card - prominent border
        outlined: "bg-transparent text-foreground border-2 border-border dark:border-border",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

function Card({
  className,
  variant,
  padding,
  ...props
}) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, padding }), "gap-6", className)}
      {...props} />
  );
}

function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props} />
  );
}

function CardTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold text-2xl", className)}
      {...props} />
  );
}

function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-foreground text-sm", className)}
      {...props} />
  );
}

function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props} />
  );
}

function CardContent({
  className,
  ...props
}) {
  return (<div data-slot="card-content" className={cn("px-6", className)} {...props} />);
}

function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
