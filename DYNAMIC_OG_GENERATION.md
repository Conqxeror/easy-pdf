# Dynamic Open Graph Image Generation

This feature automatically generates custom open-graph images for social media sharing based on tool categories, titles, and descriptions.

## Features

- **Dynamic Color Schemes**: Each tool category has its own color theme
- **Automatic Text Handling**: Long titles and descriptions are automatically truncated
- **Category-Based Styling**: Different visual themes for different tool categories
- **Fallback Support**: Falls back to static images if generation fails
- **Edge Runtime**: Fast generation using Next.js edge runtime

## Tool Categories and Colors

| Category | Primary Color | Use Case |
|----------|---------------|----------|
| Organize & Edit | Blue (#3B82F6) | PDF organization, editing tools |
| Convert & Create | Green (#10B981) | File conversion, creation tools |
| Security & Privacy | Purple (#8B5CF6) | Encryption, protection tools |
| Business Tools | Orange (#F59E0B) | Invoice, certificate generators |
| AI & Analysis | Red (#EF4444) | OCR, document analysis |

## API Endpoint

**URL:** `/api/og`

**Parameters:**
- `title` - The title to display on the image
- `description` - Description text (truncated if too long)
- `tool` - Tool name badge
- `category` - Tool category (determines color scheme)
- `theme` - Optional theme variant

**Example:**
```
/api/og?title=Merge%20PDF&description=Combine%20multiple%20files&tool=PDF%20Merger&category=Organize%20%26%20Edit
```

## Usage in Code

### Using Enhanced Metadata Function

```javascript
import { generateEnhancedMetadata } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Tool Name",
  description: "Tool description",
  toolName: "PDF Tool",
  toolCategory: "Organize & Edit", // This generates dynamic OG image
  // ... other metadata
});
```

### Using Utility Functions

```javascript
import { 
  generateDynamicOgImageUrl,
  generateToolOgImageUrl,
  generateToolMetadata 
} from "@/lib/dynamicOgGeneration";

// Generate custom OG image URL
const ogImageUrl = generateDynamicOgImageUrl({
  title: "My PDF Tool",
  description: "Tool description",
  tool: "PDF Tool",
  category: "Convert & Create"
});

// Generate from tool data
const toolOgUrl = generateToolOgImageUrl(toolDataObject);

// Generate complete metadata from tool data
const metadata = generateToolMetadata(toolDataObject);
```

## Integration with Existing Tools

For existing tool pages, add the `toolCategory` parameter to your metadata generation:

```javascript
// Before
export const metadata = generateEnhancedMetadata({
  title: "Protect PDF",
  toolName: "PDF Protector",
  // ...
});

// After
export const metadata = generateEnhancedMetadata({
  title: "Protect PDF", 
  toolName: "PDF Protector",
  toolCategory: "Security & Privacy", // Add this line
  // ...
});
```

## Image Specifications

- **Dimensions:** 1200x630 pixels (optimal for social media)
- **Format:** PNG
- **File Size:** Optimized for web delivery
- **Compatibility:** Facebook, Twitter, LinkedIn, Discord, etc.

## Fallback Behavior

If dynamic generation fails:
1. System logs a warning
2. Falls back to static `/og-image.jpg`
3. Social sharing continues to work normally

## Performance

- **Edge Runtime**: Fast generation at CDN edge locations
- **Caching**: Generated images are automatically cached
- **No External Dependencies**: Works without external font services

## Testing

Visit `/dynamic-og-test` to see examples of different category themes and test the generation system.

## Browser Support

Works with all modern browsers that support:
- Social media meta tags
- PNG image format
- Standard web fonts (system-ui, sans-serif)

## Maintenance

- Colors defined in `/src/app/api/og/route.js`
- Utility functions in `/src/lib/dynamicOgGeneration.js`
- Integration points in metadata functions