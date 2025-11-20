import * as React from "react"
import { cva } from "class-variance-authority"
import { X, Info, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:shrink-0 transition-all duration-200",
  {
    variants: {
      variant: {
        default: [
          "bg-background dark:bg-background border-border",
          "text-foreground",
          "[&>svg]:text-foreground dark:[&>svg]:text-foreground",
        ],
        info: [
          "bg-background dark:bg-background/30 border-border dark:border-border",
          "text-foreground",
          "[&>svg]:text-foreground dark:[&>svg]:text-foreground",
          "*:data-[slot=alert-description]:text-foreground dark:*:data-[slot=alert-description]:text-foreground",
        ],
        success: [
          "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
          "text-green-900 dark:text-green-100",
          "[&>svg]:text-green-500 dark:[&>svg]:text-green-400",
          "*:data-[slot=alert-description]:text-green-800 dark:*:data-[slot=alert-description]:text-green-200",
        ],
        warning: [
          "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
          "text-yellow-900 dark:text-yellow-100",
          "[&>svg]:text-yellow-500 dark:[&>svg]:text-yellow-400",
          "*:data-[slot=alert-description]:text-yellow-800 dark:*:data-[slot=alert-description]:text-yellow-200",
        ],
        destructive: [
          "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
          "text-red-900 dark:text-red-100",
          "[&>svg]:text-red-500 dark:[&>svg]:text-red-400",
          "*:data-[slot=alert-description]:text-red-800 dark:*:data-[slot=alert-description]:text-red-200",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  destructive: AlertCircle,
}

function Alert({
  className,
  variant = "default",
  showIcon = true,
  dismissible = false,
  onDismiss,
  ...props
}) {
  const [isVisible, setIsVisible] = React.useState(true);
  const Icon = iconMap[variant];

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      setTimeout(onDismiss, 200); // Wait for exit animation
    }
  };

  if (!isVisible) return null;

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        alertVariants({ variant }),
        !isVisible && "animate-out fade-out slide-out-to-right-5 duration-200",
        className
      )}
      {...props}
    >
      {showIcon && Icon && <Icon className="col-start-1" />}
      {props.children}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="col-start-3 -mr-2 -mt-1 p-1 hover:bg-background/5 dark:hover:bg-background/5 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function AlertTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed opacity-90",
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription }
