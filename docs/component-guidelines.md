# Component Usage Guidelines

## Design System Overview

easy-pdf uses a centralized design system with:
- **Design Tokens:** `src/lib/designTokens.js`
- **UI Components:** `src/components/ui/`
- **Styling:** Tailwind CSS with token extension

## Core Principles

1. **Use design tokens, not hardcoded values**
2. **Use shared components from `ui/` folder**
3. **Leverage Radix UI for accessibility**
4. **Follow consistent naming conventions**

## Component Reference

### Button
**Location:** `src/components/ui/Button.jsx`

**Usage:**
```jsx
import Button from '@/components/ui/Button';

<Button variant="primary" size="md">Click Me</Button>
<Button variant="secondary" size="lg" disabled>Disabled</Button>
<Button variant="ghost" size="sm">Ghost Button</Button>
```

**Variants:** primary, secondary, ghost, danger  
**Sizes:** sm, md, lg

### Card
**Location:** `src/components/ui/Card.jsx`

**Usage:**
```jsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Tool Card
**Location:** `src/components/ui/ToolCard.jsx`

**Usage:**
```jsx
import ToolCard from '@/components/ui/ToolCard';

<ToolCard
  title="PDF Merger"
  description="Combine multiple PDFs"
  icon={<MergeIcon />}
  href="/merge"
  category="editing"
/>
```

### Form Controls

**Input:**
```jsx
import { Input } from '@/components/ui/Input';

<Input
  type="text"
  placeholder="Enter text"
  value={value}
  onChange={handleChange}
/>
```

**Label:**
```jsx
import { Label } from '@/components/ui/Label';

<Label htmlFor="input-id">Label Text</Label>
```

**Checkbox:**
```jsx
import { Checkbox } from '@/components/ui/Checkbox';

<Checkbox
  id="checkbox-id"
  checked={checked}
  onCheckedChange={setChecked}
/>
```

### Layout Components

**Container:**
```jsx
<div className="container mx-auto px-4 max-w-7xl">
  {/* Content */}
</div>
```

**Section:**
```jsx
<section className="py-12 md:py-16">
  {/* Section content */}
</section>
```

## Design Tokens

### Colors
```javascript
import { colors } from '@/lib/designTokens';

// In Tailwind classes:
className="bg-primary-600 text-white hover:bg-primary-700"

// In JavaScript:
const primaryColor = colors.primary[600];
```

### Typography
```javascript
import { typography } from '@/lib/designTokens';

// Tailwind classes:
className="font-sans text-base leading-relaxed"
className="text-2xl font-bold"
```

### Spacing
```javascript
// Use Tailwind spacing scale (matches design tokens)
className="p-4 m-2 gap-3"
```

## Best Practices

### DO ✅
- Use design tokens via Tailwind classes
- Import shared components from `@/components/ui/`
- Use Radix UI for complex interactive components
- Follow accessibility guidelines (ARIA, keyboard nav)
- Use semantic HTML (button, nav, main, article, etc.)

### DON'T ❌
- Hardcode colors, font sizes, or spacing values
- Create duplicate Button/Card components
- Use raw `<button>` tags (use Button component)
- Ignore responsive design (always mobile-first)
- Skip accessibility attributes

## Creating New Components

### 1. Check if component exists
```powershell
ls src/components/ui/
```

### 2. If creating new, follow this template:
```jsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function MyComponent({ 
  variant = 'default',
  className,
  children,
  ...props 
}) {
  return (
    <div
      className={cn(
        'base-styles-here',
        variant === 'primary' && 'variant-styles',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default MyComponent;
```

### 3. Add to component index if needed
```javascript
// src/components/ui/index.js
export { MyComponent } from './MyComponent';
```

## Component Audit

Run this to find non-standard usage:
```powershell
# Find hardcoded colors (anti-pattern)
grep -r "color:\s*#" src/app/

# Find raw button tags (should use Button component)
grep -r "<button[^>]*>" src/app/ --exclude-dir=node_modules

# Find inline styles (prefer Tailwind classes)
grep -r 'style={{' src/app/
```

## Migration Guide

### Converting to Button component:
```jsx
// ❌ Before
<button className="bg-blue-500 px-4 py-2 rounded">
  Click Me
</button>

// ✅ After
<Button variant="primary">Click Me</Button>
```

### Using design tokens:
```jsx
// ❌ Before
<div className="text-[#3B82F6]">Text</div>

// ✅ After
<div className="text-primary-600">Text</div>
```

## Resources

- **Design Tokens:** `src/lib/designTokens.js`
- **Component Library:** `src/components/ui/`
- **Tailwind Config:** `tailwind.config.js`
- **Utils:** `src/lib/utils.js` (cn helper for className merging)

## Questions?

For questions about components or design system usage, refer to:
1. This guide
2. Component source code in `src/components/ui/`
3. Design tokens in `src/lib/designTokens.js`
4. Tailwind documentation: https://tailwindcss.com/docs

---

**Last Updated:** October 4, 2025  
**Status:** Living document - update as components evolve
