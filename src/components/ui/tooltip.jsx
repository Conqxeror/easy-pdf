"use client"

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
          "bg-black text-white",
          "shadow-lg border border-gray-600",
        ],
        light: [
          "bg-white dark:bg-gray-100 text-gray-900",
          "shadow-xl border border-gray-200",
        ],
        glass: [
          "bg-white/90 dark:bg-black/90 backdrop-blur-md",
          "text-gray-900 dark:text-white",
          "shadow-xl border border-white/20 dark:border-gray-600/20",
        ],
        premium: [
          "bg-gradient-to-br from-gray-700 to-gray-800",
          "text-white shadow-xl border border-gray-600/20",
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
          variant === "default" && "text-gray-900 dark:text-gray-800",
          variant === "light" && "text-white dark:text-gray-100",
          variant === "glass" && "text-white/90 dark:text-gray-900/90",
          variant === "premium" && "text-gray-700"
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
