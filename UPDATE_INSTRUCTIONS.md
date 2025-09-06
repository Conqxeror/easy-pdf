# Update Instructions for Easy-PDF Tool Pages

This document provides instructions for updating tool pages to use the new standardized layout system.

## Overview

We've created a new standardized layout component called `ToolPageLayout` to ensure consistency across all tool pages in the easy-pdf application. This replaces the previous approach of using `UnifiedToolLayout` directly in each page.

## Migration Process

### 1. Update Imports

Replace the old import:
```jsx
import UnifiedToolLayout from "@/components/ui/UnifiedToolLayout";
```

With the new import:
```jsx
import ToolPageLayout from "@/components/ui/ToolPageLayout";
```

### 2. Update Component Usage

Replace the component wrapper:

**Old:**
```jsx
<UnifiedToolLayout
  title="Tool Name"
  subtitle="Brief description"
  toolName={toolName}
  toolDescription={toolDescription}
  steps={steps}
  faqs={faqs}
  currentTool="tool-identifier"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Tool Name', href: '/tool-identifier' }
  ]}
>
  {/* Page content */}
</UnifiedToolLayout>
```

**New:**
```jsx
<ToolPageLayout
  title="Tool Name"
  subtitle="Brief description"
  toolName={toolName}
  toolDescription={toolDescription}
  steps={steps}
  faqs={faqs}
  currentTool="tool-identifier"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Tool Name', href: '/tool-identifier' }
  ]}
>
  {/* Page content */}
</ToolPageLayout>
```

### 3. Update Closing Tag

Make sure to update the closing tag as well:
```jsx
</ToolPageLayout>
```

## Files That Have Been Updated

The following files have already been updated to use the new `ToolPageLayout`:

1. `src/app/delete-pages/page.js`
2. `src/app/merge/components/MergeClient.js`
3. `src/app/compress/page.js`
4. `src/app/split/page.js`
5. `src/app/protect/page.js`
6. `src/app/unlock/page.js`
7. `src/app/rotate/page.js`
8. `src/app/jpg-to-pdf/page.js`
9. `src/app/pdf-to-jpg/page.js`
10. `src/app/watermark/page.js`
11. `src/app/sign/page.js`
12. `src/app/advanced-ocr/page.js`
13. `src/app/certificate-generator/page.js`
14. `src/app/form-filler/page.js`
15. `src/app/invoice-generator/page.js`
16. `src/app/ocr/page.js`
17. `src/app/merge/page.js`

## Components Updated

The following components have been updated or created:

1. `src/components/ui/ToolPageLayout.jsx` - New layout component

## Testing

After updating a tool page:

1. Verify that the page loads correctly
2. Check that all functionality works as expected
3. Ensure consistent styling with other tool pages
4. Test responsive design on different screen sizes
5. Verify that breadcrumbs navigate correctly
6. Confirm that the how-to and FAQ sections display properly

## Common Issues and Solutions

### Issue: Module not found error for ToolPageLayout
**Solution:** Make sure you've updated the import to use `ToolPageLayout` instead of `UnifiedToolLayout`.

### Issue: Component not found error
**Solution:** Verify that the opening and closing tags match (`ToolPageLayout`).

### Issue: Styling inconsistencies
**Solution:** Check that you're passing all required props to `ToolPageLayout` and that your page content follows the standardized structure.