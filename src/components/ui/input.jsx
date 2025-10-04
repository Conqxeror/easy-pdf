import * as React from "react"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full min-w-0 border px-3 py-2 text-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: [
          "bg-white dark:bg-black border-gray-200 dark:border-gray-600",
          "text-gray-900 dark:text-gray-100",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus-visible:border-gray-600 focus-visible:ring-2 focus-visible:ring-gray-600/20",
          "hover:border-gray-300 dark:hover:border-gray-600",
        ],
        error: [
          "bg-white dark:bg-black border-red-300 dark:border-red-700",
          "text-gray-900 dark:text-gray-100",
          "placeholder:text-red-400 dark:placeholder:text-red-500",
          "focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20",
        ],
        success: [
          "bg-white dark:bg-black border-green-300 dark:border-green-700",
          "text-gray-900 dark:text-gray-100",
          "placeholder:text-green-400 dark:placeholder:text-green-500",
          "focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/20",
        ],
        glass: [
          "bg-white/70 dark:bg-black/70 backdrop-blur-md",
          "border-white/30 dark:border-gray-600/30",
          "text-gray-900 dark:text-gray-100",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus-visible:border-gray-600 focus-visible:ring-2 focus-visible:ring-gray-600/20",
        ],
      },
      size: {
        sm: "h-8 text-xs px-2",
        default: "h-10 text-sm",
        lg: "h-12 text-base px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const InputWrapper = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  leftIcon, 
  rightIcon, 
  loading, 
  error, 
  ...props 
}, ref) => {
  const computedVariant = error ? "error" : variant;
  const hasLeftIcon = leftIcon || false;
  const hasRightIcon = rightIcon || loading;

  if (!hasLeftIcon && !hasRightIcon) {
    return (
      <input
        ref={ref}
        data-slot="input"
        className={cn(
          inputVariants({ variant: computedVariant, size }),
          "file:text-gray-900 dark:file:text-gray-100",
          "selection:bg-gray-950 selection:text-white",
          className
        )}
        {...props}
      />
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      {hasLeftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        data-slot="input"
        className={cn(
          inputVariants({ variant: computedVariant, size }),
          "file:text-gray-900 dark:file:text-gray-100",
          "selection:bg-gray-950 selection:text-white",
          hasLeftIcon && "pl-10",
          hasRightIcon && "pr-10"
        )}
        disabled={loading || props.disabled}
        {...props}
      />
      {hasRightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            rightIcon
          )}
        </div>
      )}
    </div>
  );
});

InputWrapper.displayName = "Input";

const Input = InputWrapper;

export { Input, inputVariants }
