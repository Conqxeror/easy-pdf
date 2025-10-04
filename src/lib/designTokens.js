// src/lib/designTokens.js

/**
 * Premium Design System Tokens - Apple/Nike Inspired
 * Version 2.0 - October 2025
 * 
 * Comprehensive design tokens for consistent, premium aesthetic across the application.
 * Supports both light and dark modes with refined color palettes, spacing, and animations.
 */

// ============================================================================
// COLOR PALETTES - Light & Dark Mode Optimized
// ============================================================================

// Core brand colors (mode-agnostic)
export const brand = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',  // Softer blue for dark mode
    500: '#3b82f6',  // Main brand blue
    600: '#2563eb',  // Hover state
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  accent: {
    purple: {
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
    },
    cyan: {
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
    },
    emerald: {
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
    },
  },
};

// Premium gray scale (10 shades for fine-tuned control)
export const gray = {
  // Ultra light (for backgrounds, light mode)
  0: '#ffffff',
  50: '#fafafa',
  100: '#f5f5f5',
  
  // Light grays (borders, subtle elements)
  200: '#e5e5e5',
  300: '#d4d4d4',
  
  // Mid grays (muted text, secondary elements)
  400: '#a3a3a3',
  500: '#737373',
  
  // Dark grays (text, important elements)
  600: '#525252',
  700: '#404040',
  800: '#262626',
  
  // Ultra dark (backgrounds, dark mode)
  900: '#171717',
  950: '#0a0a0a',
};

// Semantic colors with light/dark variants
export const semantic = {
  success: {
    light: {
      background: '#f0fdf4',
      border: '#bbf7d0',
      text: '#166534',
      icon: '#22c55e',
    },
    dark: {
      background: '#14532d',
      border: '#166534',
      text: '#86efac',
      icon: '#4ade80',
    },
  },
  warning: {
    light: {
      background: '#fefce8',
      border: '#fde047',
      text: '#854d0e',
      icon: '#eab308',
    },
    dark: {
      background: '#422006',
      border: '#854d0e',
      text: '#fde047',
      icon: '#facc15',
    },
  },
  error: {
    light: {
      background: '#fef2f2',
      border: '#fecaca',
      text: '#991b1b',
      icon: '#ef4444',
    },
    dark: {
      background: '#450a0a',
      border: '#991b1b',
      text: '#fca5a5',
      icon: '#f87171',
    },
  },
  info: {
    light: {
      background: '#eff6ff',
      border: '#bfdbfe',
      text: '#1e40af',
      icon: '#3b82f6',
    },
    dark: {
      background: '#1e3a8a',
      border: '#1e40af',
      text: '#bfdbfe',
      icon: '#60a5fa',
    },
  },
};

// Theme-specific color mappings
export const colors = {
  light: {
    background: {
      primary: gray[0],      // Pure white
      secondary: gray[50],   // Off-white
      tertiary: gray[100],   // Light gray
      elevated: gray[0],     // Card backgrounds
    },
    foreground: {
      primary: gray[900],    // Main text
      secondary: gray[600],  // Secondary text
      tertiary: gray[500],   // Muted text
      inverse: gray[0],      // Text on dark backgrounds
    },
    border: {
      subtle: gray[200],
      default: gray[300],
      strong: gray[400],
    },
  },
  dark: {
    background: {
      primary: '#030712',    // Almost black
      secondary: gray[900],  // Dark gray
      tertiary: gray[800],   // Lighter dark gray
      elevated: gray[900],   // Card backgrounds
    },
    foreground: {
      primary: gray[50],     // Main text
      secondary: gray[400],  // Secondary text
      tertiary: gray[500],   // Muted text
      inverse: gray[900],    // Text on light backgrounds
    },
    border: {
      subtle: gray[800],
      default: gray[700],
      strong: gray[600],
    },
  },
};

// ============================================================================
// SPACING SYSTEM - 4px Base Grid
// ============================================================================

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px - Base unit
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px (minimum touch target)
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  28: '7rem',        // 112px
  32: '8rem',        // 128px
  36: '9rem',        // 144px
  40: '10rem',       // 160px
  44: '11rem',       // 176px
  48: '12rem',       // 192px
  52: '13rem',       // 208px
  56: '14rem',       // 224px
  60: '15rem',       // 240px
  64: '16rem',       // 256px
  72: '18rem',       // 288px
  80: '20rem',       // 320px
  96: '24rem',       // 384px
};

// Layout-specific spacing
export const layout = {
  sectionPadding: {
    sm: spacing[12],      // 48px mobile
    md: spacing[16],      // 64px tablet
    lg: spacing[24],      // 96px desktop
    xl: spacing[32],      // 128px large screens
  },
  containerPadding: {
    sm: spacing[4],       // 16px mobile
    md: spacing[6],       // 24px tablet
    lg: spacing[8],       // 32px desktop
  },
  gridGap: {
    sm: spacing[4],       // 16px
    md: spacing[6],       // 24px
    lg: spacing[8],       // 32px
  },
};

// ============================================================================
// TYPOGRAPHY SYSTEM - Refined Scale
// ============================================================================

export const typography = {
  fontSize: {
    xs: '0.75rem',        // 12px
    sm: '0.875rem',       // 14px
    base: '1rem',         // 16px - Base
    lg: '1.125rem',       // 18px
    xl: '1.25rem',        // 20px
    '2xl': '1.5rem',      // 24px
    '3xl': '1.875rem',    // 30px
    '4xl': '2.25rem',     // 36px
    '5xl': '3rem',        // 48px
    '6xl': '3.75rem',     // 60px
    '7xl': '4.5rem',      // 72px
    '8xl': '6rem',        // 96px
    '9xl': '8rem',        // 128px
  },
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  },
};

// Text style presets
export const textStyles = {
  // Display headings (hero text)
  display: {
    fontSize: typography.fontSize['6xl'],
    fontWeight: typography.fontWeight.extrabold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tighter,
  },
  // Page headings
  h1: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },
  h3: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
  },
  h4: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
  },
  h5: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
  },
  h6: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
  },
  // Body text
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.relaxed,
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
  // UI text
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
  overline: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase',
  },
};

// ============================================================================
// SHADOW SYSTEM - 5-Level Elevation
// ============================================================================

export const shadows = {
  none: 'none',
  // Subtle elevation (hover states, input focus)
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  // Default cards, buttons
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  // Elevated elements (dropdowns, popovers)
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  // High elevation (modals)
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  // Maximum elevation
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  // Inner shadow for input fields
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

// Dark mode shadows (more pronounced)
export const shadowsDark = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.5)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.2)',
};

// Colored shadows for emphasis
export const shadowsColored = {
  primary: `0 10px 15px -3px rgb(59 130 246 / 0.3), 0 4px 6px -4px rgb(59 130 246 / 0.2)`,
  success: `0 10px 15px -3px rgb(34 197 94 / 0.3), 0 4px 6px -4px rgb(34 197 94 / 0.2)`,
  warning: `0 10px 15px -3px rgb(234 179 8 / 0.3), 0 4px 6px -4px rgb(234 179 8 / 0.2)`,
  error: `0 10px 15px -3px rgb(239 68 68 / 0.3), 0 4px 6px -4px rgb(239 68 68 / 0.2)`,
};

// ============================================================================
// BORDER RADIUS - Rounded Corners
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',      // 2px
  base: '0.25rem',     // 4px
  md: '0.375rem',      // 6px
  lg: '0.5rem',        // 8px
  xl: '0.75rem',       // 12px
  '2xl': '1rem',       // 16px
  '3xl': '1.5rem',     // 24px
  full: '9999px',      // Pill shape
};

// ============================================================================
// ANIMATION SYSTEM - Durations & Easing
// ============================================================================

export const animation = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    base: '200ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },
  easing: {
    // Standard easings
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    
    // Custom cubic beziers (Apple-style)
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',      // Smooth default
    emphasized: 'cubic-bezier(0.4, 0, 0, 1)',      // Emphasized entrance
    decelerated: 'cubic-bezier(0, 0, 0.2, 1)',     // Decelerated exit
    accelerated: 'cubic-bezier(0.4, 0, 1, 1)',     // Accelerated entrance
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',         // Sharp transition
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bounce effect
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Spring effect
  },
  // Common animation presets
  presets: {
    fadeIn: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      keyframes: 'opacity 0 to 1',
    },
    slideUp: {
      duration: '300ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      keyframes: 'transform translateY(10px) to translateY(0)',
    },
    scaleIn: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      keyframes: 'transform scale(0.95) to scale(1)',
    },
  },
};

// ============================================================================
// BREAKPOINTS - Responsive Design
// ============================================================================

export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// Z-INDEX SCALE - Layering System
// ============================================================================

export const zIndex = {
  base: 0,
  raised: 10,           // Slightly elevated elements
  dropdown: 1000,       // Dropdowns, select menus
  sticky: 1020,         // Sticky headers/footers
  fixed: 1030,          // Fixed position elements
  backdrop: 1040,       // Modal/dialog backdrops
  modal: 1050,          // Modals, dialogs
  popover: 1060,        // Popovers, tooltips
  toast: 1070,          // Toast notifications
  tooltip: 1080,        // Tooltips (highest)
};

// ============================================================================
// GLASSMORPHISM - Frosted Glass Effects
// ============================================================================

export const glassmorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: shadows.md,
  },
  dark: {
    background: 'rgba(23, 23, 23, 0.7)',
    backdropFilter: 'blur(10px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: shadowsDark.md,
  },
  strong: {
    light: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
    },
    dark: {
      background: 'rgba(23, 23, 23, 0.9)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
    },
  },
};

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

// Get CSS variable format for a color
export const getCSSVar = (value) => {
  if (typeof value === 'string' && value.startsWith('#')) {
    // Convert hex to RGB for CSS custom properties
    const r = parseInt(value.slice(1, 3), 16);
    const g = parseInt(value.slice(3, 5), 16);
    const b = parseInt(value.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
  }
  return value;
};

// Generate transition string
export const transition = (properties = ['all'], duration = 'base', easing = 'default') => {
  const dur = animation.duration[duration] || duration;
  const ease = animation.easing[easing] || easing;
  return properties.map(prop => `${prop} ${dur} ${ease}`).join(', ');
};

// Common transitions
export const transitions = {
  fast: transition(['all'], 'fast', 'default'),
  base: transition(['all'], 'base', 'default'),
  slow: transition(['all'], 'slow', 'default'),
  colors: transition(['color', 'background-color', 'border-color'], 'base', 'default'),
  transform: transition(['transform'], 'base', 'default'),
  opacity: transition(['opacity'], 'base', 'default'),
  shadow: transition(['box-shadow'], 'base', 'default'),
};