"use client";

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative w-full overflow-hidden transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-background dark:bg-background",
        gradient: "bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600",
        glass: "bg-background/20 dark:bg-background/20 backdrop-blur-sm",
      },
      size: {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-out",
  {
    variants: {
      color: {
        // Use a light neutral progress indicator so it reads clearly on dark backgrounds.
        default: "bg-background dark:bg-background",
        success: "bg-emerald-500",
        warning: "bg-yellow-500",
        error: "bg-destructive",
        gradient: "bg-gradient-to-r from-white/60 via-white/70 to-white/60",
        animated: "bg-gradient-to-r from-white/50 via-white/70 to-white/50 animate-gradient",
      },
    },
    defaultVariants: {
      color: "default",
    },
  }
)

function Progress({
  className,
  value,
  variant = "default",
  size = "default",
  color = "default",
  indeterminate = false,
  ...props
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(progressVariants({ variant, size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          progressIndicatorVariants({ color }),
          indeterminate && "animate-progress-indeterminate"
        )}
        style={{ 
          transform: indeterminate 
            ? undefined 
            : `translateX(-${100 - (value || 0)}%)` 
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress }
