"use client";

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const TooltipRoot = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const tooltipContentVariants = cva(
  "z-50 overflow-hidden px-3 py-1.5 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      variant: {
        default: [
          "bg-background dark:bg-background text-foreground dark:text-foreground",
          "shadow-lg border border-border dark:border-border",
        ],
        light: [
          "bg-background text-foreground",
          "shadow-xl border border-border",
        ],
        glass: [
          "bg-background/90 dark:bg-background/90 backdrop-blur-xl",
          "text-foreground",
          "shadow-xl border border-white/20 dark:border-border/20",
        ],
        premium: [
          "bg-gradient-to-br from-zinc-700 to-zinc-800",
          "text-foreground shadow-xl border border-border/20",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const TooltipContent = React.forwardRef(({ 
  className, 
  sideOffset = 4, 
  variant = "default",
  showArrow = true,
  ...props 
}, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(tooltipContentVariants({ variant }), className)}
    {...props}
  >
    {props.children}
    {showArrow && (
      <TooltipPrimitive.Arrow 
        className={cn(
          "fill-current",
          variant === "default" && "text-foreground dark:text-foreground",
          variant === "light" && "text-foreground dark:text-foreground",
          variant === "glass" && "text-foreground/90 dark:text-foreground/90",
          variant === "premium" && "text-foreground"
        )} 
      />
    )}
  </TooltipPrimitive.Content>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Simplified wrapper component for common use case
function Tooltip({ 
  children, 
  content, 
  side = "top", 
  delayDuration = 200,
  variant = "default",
  showArrow = true,
  ...props 
}) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} variant={variant} showArrow={showArrow} {...props}>
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}

export { 
  Tooltip, 
  TooltipProvider, 
  TooltipRoot, 
  TooltipTrigger, 
  TooltipContent,
  tooltipContentVariants
}
