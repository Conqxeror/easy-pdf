"use client";

import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from './button'
import { Tooltip } from './tooltip'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className, variant = "ghost", size = "default", showTooltip = true }) {
  const { toggleTheme, isDark } = useTheme()

  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={cn(
        "relative overflow-hidden",
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon for light mode (visible in dark mode) */}
      <Sun 
        className={cn(
          "h-5 w-5 transition-all duration-500",
          isDark 
            ? "rotate-0 scale-100" 
            : "rotate-90 scale-0"
        )}
      />
      
      {/* Moon icon for dark mode (visible in light mode) */}
      <Moon 
        className={cn(
          "absolute h-5 w-5 transition-all duration-500",
          isDark 
            ? "-rotate-90 scale-0" 
            : "rotate-0 scale-100"
        )}
      />
      
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </Button>
  )

  if (showTooltip) {
    return (
      <Tooltip content={`${isDark ? 'Light' : 'Dark'} mode`}>
        {button}
      </Tooltip>
    )
  }

  return button
}

export function ThemeToggleSimple({ className }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center",
        "text-foreground dark:text-foreground",
  "hover:bg-background dark:hover:bg-background",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600",
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <Sun 
        className={cn(
          "h-5 w-5 transition-all duration-500",
          isDark ? "rotate-0 scale-100" : "rotate-90 scale-0"
        )}
      />
      <Moon 
        className={cn(
          "absolute h-5 w-5 transition-all duration-500",
          isDark ? "-rotate-90 scale-0" : "rotate-0 scale-100"
        )}
      />
    </button>
  )
}
