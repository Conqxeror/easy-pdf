import * as React from "react"
import { cva } from "class-variance-authority"
import { FileQuestion } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center p-8 transition-all duration-300",
  {
    variants: {
      variant: {
  default: "bg-gray-50 dark:bg-black/50",
        subtle: "bg-transparent",
        card: "bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-sm",
        glass: "bg-white/70 dark:bg-black/70 backdrop-blur-md border border-white/30 dark:border-gray-700/30",
      },
      size: {
        sm: "max-w-xs",
        default: "max-w-md",
        lg: "max-w-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function EmptyState({
  className,
  variant = "default",
  size = "default",
  icon: Icon = FileQuestion,
  iconClassName,
  title,
  description,
  action,
  actionLabel,
  onAction,
  children,
  animate = true,
  ...props
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        emptyStateVariants({ variant, size }),
        animate && "animate-in fade-in-0 zoom-in-95 duration-500",
        "mx-auto",
        className
      )}
      {...props}
    >
      {Icon && (
        <div 
          className={cn(
            "mb-4 p-3 bg-gray-200 dark:bg-black",
            animate && "animate-in zoom-in-50 delay-100 duration-500"
          )}
        >
          <Icon 
            className={cn(
              "h-8 w-8 text-gray-400 dark:text-gray-500",
              iconClassName
            )} 
          />
        </div>
      )}
      
      {title && (
        <h3 
          className={cn(
            "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2",
            animate && "animate-in fade-in-0 slide-in-from-bottom-3 delay-200 duration-500"
          )}
        >
          {title}
        </h3>
      )}
      
      {description && (
        <p 
          className={cn(
            "text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-sm",
            animate && "animate-in fade-in-0 slide-in-from-bottom-3 delay-300 duration-500"
          )}
        >
          {description}
        </p>
      )}
      
      {children}
      
      {(action || (actionLabel && onAction)) && (
        <div 
          className={cn(
            "mt-4",
            animate && "animate-in fade-in-0 slide-in-from-bottom-3 delay-500 duration-500"
          )}
        >
          {action || (
            <Button onClick={onAction} variant="default">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyStateIcon({ className, children, ...props }) {
  return (
    <div 
      className={cn(
  "mb-4 p-3 bg-gray-200 dark:bg-black",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function EmptyStateTitle({ className, ...props }) {
  return (
    <h3 
      className={cn(
        "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2",
        className
      )}
      {...props}
    />
  );
}

function EmptyStateDescription({ className, ...props }) {
  return (
    <p 
      className={cn(
        "text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-sm",
        className
      )}
      {...props}
    />
  );
}

function EmptyStateActions({ className, ...props }) {
  return (
    <div 
      className={cn(
        "mt-4 flex items-center gap-2",
        className
      )}
      {...props}
    />
  );
}

export { 
  EmptyState, 
  EmptyStateIcon,
  EmptyStateTitle, 
  EmptyStateDescription, 
  EmptyStateActions,
  emptyStateVariants 
}
