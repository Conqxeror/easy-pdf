# UI Consistency Guide for easy-pdf Tool Pages

This guide documents the standardized UI structure for all tool pages in the easy-pdf application. The goal is to ensure a consistent user experience across all PDF processing tools.

## Standardized Tool Page Structure

All tool pages should follow this structure using the new `ToolPageLayout` component:

```jsx
import ToolPageLayout from "@/components/ui/ToolPageLayout";

export default function ToolPage() {
  // Tool-specific constants
  const toolName = "Tool Name";
  const toolDescription = "Description of what the tool does";
  const steps = [
    "Step 1 description",
    "Step 2 description",
    // ... more steps
  ];
  const faqs = [
    {
      question: "FAQ question 1",
      answer: "FAQ answer 1"
    },
    // ... more FAQs
  ];

  return (
    <ToolPageLayout
      title="Tool Name"
      subtitle="Brief description of what the tool does"
      toolName={toolName}
      toolDescription={toolDescription}
      steps={steps}
      faqs={faqs}
      currentTool="tool-identifier" // e.g., "merge", "compress", etc.
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Tool Name', href: '/tool-identifier' }
      ]}
    >
      {/* Tool-specific UI components go here */}
      <div className="space-y-6">
        {/* File dropzone, inputs, controls, etc. */}
      </div>
    </ToolPageLayout>
  );
}
```

## Key Changes Made

1. **Replaced `ToolPageContent` with `StandardToolLayout`**: 
   - `ToolPageContent` is now a child component of `StandardToolLayout`
   - `StandardToolLayout` provides the consistent page structure and styling

2. **Standardized page structure**:
   - Consistent spacing using `space-y-6` classes
   - Consistent button styling with gradient backgrounds
   - Consistent loading states with spinners
   - Consistent success states with green accents
   - Consistent error handling with Alert components

3. **Improved component organization**:
   - Moved FAQ content to the `faqs` prop
   - Moved steps content to the `steps` prop
   - Moved tool description to the `toolDescription` prop
   - Moved tool name to the `toolName` prop

4. **Added breadcrumbs**:
   - All tool pages now include breadcrumb navigation
   - Consistent breadcrumb structure across all pages

5. **Standardized button styling**:
   - Processing buttons now show spinners with "Processing..." text
   - Success buttons use green gradients
   - Action buttons use blue gradients
   - Consistent padding and shadow effects

## Updated Components

### StandardToolLayout.jsx
Located at `src/components/ui/StandardToolLayout.jsx`, this component provides:
- Standardized page container with consistent background and text colors
- Page header with title and subtitle
- Breadcrumb navigation
- Main content area with consistent spacing
- Integration with ToolPageContent for how-to and FAQ sections

### ToolPageContent.jsx
Located at `src/components/ui/ToolPageContent.jsx`, this component provides:
- How-to sections with step-by-step instructions
- FAQ sections with expandable questions
- Feature highlights with consistent styling
- Related tools section

## Migration Process

To update an existing tool page:

1. Replace imports:
   ```jsx
   // Old
   import ToolPageContent from "@/components/ui/ToolPageContent";
   
   // New
   import StandardToolLayout from "@/components/ui/StandardToolLayout";
   ```

2. Extract tool content into constants:
   ```jsx
   const toolName = "Tool Name";
   const toolDescription = "Description of what the tool does";
   const steps = [
     "Step 1 description",
     "Step 2 description",
     // ... more steps
   ];
   const faqs = [
     {
       question: "FAQ question 1",
       answer: "FAQ answer 1"
     },
     // ... more FAQs
   ];
   ```

3. Wrap the page content with `StandardToolLayout`:
   ```jsx
   return (
     <StandardToolLayout
       title="Tool Name"
       subtitle="Brief description of what the tool does"
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
       {/* Tool-specific UI components go here */}
     </StandardToolLayout>
   );
   ```

4. Update button styling to match the new standard:
   ```jsx
   // Processing button
   <Button
     className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
     disabled={isProcessing}
   >
     {isProcessing ? (
       <span className="flex items-center">
         <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
         Processing...
       </span>
     ) : (
       "Action Button Text"
     )}
   </Button>
   
   // Success button
   <Button
     asChild
     variant="success"
     size="lg"
     className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
   >
     <a href={downloadUrl} download={fileName}>
       <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
       </svg>
       Download File
     </a>
   </Button>
   ```

## Benefits of This Approach

1. **Consistent User Experience**: All tool pages now have the same look and feel
2. **Easier Maintenance**: Changes to the page structure only need to be made in one place
3. **Improved Accessibility**: Standardized components ensure consistent ARIA attributes and keyboard navigation
4. **Better SEO**: Consistent page structure helps search engines understand the content
5. **Faster Development**: New tool pages can be created by following the template

## Tools Updated

The following tool pages have been updated to use the new standardized structure:
- Merge PDFs
- Compress PDF
- Split PDF
- Protect PDF
- Unlock PDF
- Rotate PDF
- JPG to PDF
- PDF to JPG
- Delete Pages
- Watermark
- Sign/Annotate PDF

## Remaining Work

There are approximately 30 more tool pages that need to be updated to use this new standardized structure. The process for each page is:
1. Follow the migration process outlined above
2. Test the page to ensure all functionality works correctly
3. Verify consistent styling with other tool pages