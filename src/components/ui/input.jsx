import * as React from "react"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full min-w-0 border px-3 py-2 text-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-none",
  {
    variants: {
      variant: {
        default: [
          "bg-background border-border",
          "text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:border-border focus-visible:ring-2 focus-visible:ring-zinc-600/20",
          "hover:border-border dark:hover:border-border",
        ],
        error: [
          "bg-background border-red-300 dark:border-red-700",
          "text-foreground",
          "placeholder:text-red-400 dark:placeholder:text-red-500",
          "focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20",
        ],
        success: [
          "bg-background border-green-300 dark:border-green-700",
          "text-foreground",
          "placeholder:text-green-400 dark:placeholder:text-green-500",
          "focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/20",
        ],
        glass: [
          "bg-background/70 dark:bg-background/70 backdrop-blur-xl",
          "border-white/30 dark:border-border/30",
          "text-foreground",
          "placeholder:text-foreground dark:placeholder:text-muted-foreground",
          "focus-visible:border-border focus-visible:ring-2 focus-visible:ring-gray-600/20",
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
          "file:text-foreground dark:file:text-foreground",
          "selection:bg-background selection:text-foreground",
          className
        )}
        {...props}
      />
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      {hasLeftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground dark:text-foreground pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        data-slot="input"
        className={cn(
          inputVariants({ variant: computedVariant, size }),
          "file:text-foreground dark:file:text-foreground",
          "selection:bg-background selection:text-foreground",
          hasLeftIcon && "pl-10",
          hasRightIcon && "pr-10"
        )}
        disabled={loading || props.disabled}
        {...props}
      />
      {hasRightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground dark:text-foreground">
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
