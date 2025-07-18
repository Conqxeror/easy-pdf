import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]",
        destructive:
          "bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg active:scale-[0.98]",
        outline:
          "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 active:scale-[0.98]",
        secondary:
          "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md active:scale-[0.98]",
        ghost:
          "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98]",
        link: 
          "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline active:scale-[0.98]",
        success:
          "bg-green-600 text-white shadow-md hover:bg-green-700 hover:shadow-lg active:scale-[0.98]",
        warning:
          "bg-yellow-600 text-white shadow-md hover:bg-yellow-700 hover:shadow-lg active:scale-[0.98]",
        info:
          "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]",
        gradient:
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md gap-1 px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-12 text-lg",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };