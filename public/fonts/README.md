This folder can hold local font files used by the dynamic OG image generator.

Recommended fonts:
- Inter-Regular.woff2
- Inter-Bold.woff2

To add the fonts to the repository, download them from a trusted source and copy them into this folder.
Alternatively, you can configure the `src/app/og/*/route.js` generator to fetch fonts from a different public path.

Note: bundling fonts in the repo is optional; if fonts are not available locally, the OG generator will fall back to Google Fonts CDN.
