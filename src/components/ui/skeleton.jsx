import React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const skeletonVariants = cva(
  "animate-pulse bg-gradient-to-r",
  {
    variants: {
      variant: {
        default: "from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800",
        shimmer: "from-gray-200 via-white to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 bg-[length:200%_100%] animate-shimmer",
        subtle: "from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
      },
      shape: {
        text: "h-4",
        circle: "",
        rectangle: "",
        card: "",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "rectangle",
    },
  }
)

function Skeleton({
  className,
  variant,
  shape,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant, shape }), className)}
      {...props}
    />
  );
}

// Preset skeleton patterns
function SkeletonText({ className, lines = 1, ...props }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          shape="text" 
          className={i === lines - 1 ? "w-4/5" : "w-full"}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className, ...props }) {
  return (
    <div className={cn("space-y-3 p-4", className)} {...props}>
      <Skeleton shape="rectangle" className="h-32 w-full" />
      <SkeletonText lines={2} />
    </div>
  );
}

function SkeletonAvatar({ className, size = "default", ...props }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <Skeleton 
      shape="circle" 
      className={cn(sizeClasses[size], className)} 
      {...props} 
    />
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, skeletonVariants }
