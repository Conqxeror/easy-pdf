import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden rounded-none",
  {
    variants: {
      variant: {
        default: [
          "border-transparent bg-background text-foreground",
          "[a&]:hover:bg-background [a&]:hover:shadow-md",
        ],
        secondary: [
          "border-transparent bg-background dark:bg-background",
          "text-foreground dark:text-foreground",
          "[a&]:hover:bg-background dark:[a&]:hover:bg-background",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500",
        ],
        destructive: [
          "border-transparent bg-destructive text-destructive-foreground",
          "[a&]:hover:bg-destructive/90 [a&]:hover:shadow-md",
        ],
        outline: [
          "border-border dark:border-border bg-transparent",
          "text-foreground dark:text-foreground",
          "[a&]:hover:bg-background dark:[a&]:hover:bg-background",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500",
        ],
        success: [
          // Use design tokens and stronger contrast for light mode while keeping dark mode subtle
          "border-transparent bg-success/10 dark:bg-green-950/30",
          "text-success dark:text-green-300",
          "[a&]:hover:bg-success/20 dark:[a&]:hover:bg-green-900/30",
        ],
        warning: [
          "border-transparent bg-yellow-100 dark:bg-yellow-950/30",
          "text-yellow-700 dark:text-yellow-400",
          "[a&]:hover:bg-yellow-200 dark:[a&]:hover:bg-yellow-900/30",
        ],
        info: [
          "border-transparent bg-background dark:bg-background/30",
          "text-foreground dark:text-foreground",
          "[a&]:hover:bg-background dark:[a&]:hover:bg-background/30",
        ],
        premium: [
          "border-transparent bg-gradient-to-r from-gray-600 to-gray-800",
          "text-foreground shadow-md",
          "[a&]:hover:shadow-lg [a&]:hover:from-gray-700 [a&]:hover:to-gray-900",
        ],
        dot: [
          "border-current bg-transparent gap-1.5 pl-1.5",
          "before:content-[''] before:w-1.5 before:h-1.5 before:bg-current",
        ],
      },
      size: {
        sm: "px-1.5 py-0.5 text-[10px]",
        default: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants }
