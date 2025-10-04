import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "flex flex-col transition-all duration-200",
  {
    variants: {
      variant: {
        // Default card - subtle elevation
        default: "bg-white dark:bg-black text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-md",
        
        // Elevated card - stronger shadow, lifts on hover
        elevated: "bg-white dark:bg-black text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-1",
        
        // Glass card - glassmorphism effect
        glass: "bg-white/90 dark:bg-black/90 backdrop-blur-md text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-gray-700/50 shadow-lg",
        
        // Interactive card - for clickable cards
        interactive: "bg-white dark:bg-black text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-gray-600 dark:hover:border-gray-600 cursor-pointer",
        
        // Flat card - no shadow, subtle border
  flat: "bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700",
        
        // Outlined card - prominent border
        outlined: "bg-transparent text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600",
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
      className={cn("text-gray-400 text-sm", className)}
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
