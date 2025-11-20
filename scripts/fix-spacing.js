console.log('📐 Fixing spacing and layout issues...\n');

const fs = require('fs');
const glob = require('glob');

const patterns = [
  // Add proper spacing to sections without padding
  {
    from: /className="([^"]*container-standard[^"]*)"/g,
    to: (match, classes) => {
      // Only add px/py if not already present
      if (!classes.includes('px-') && !classes.includes('py-')) {
        return `className="${classes} px-4 md:px-6 lg:px-8 py-8 md:py-12"`;
      }
      return match;
    },
    description: 'Add responsive padding to containers'
  },
  // Fix sections with insufficient spacing
  {
    from: /className="([^"]*)section([^"]*)"/g,
    to: (match, before, after) => {
      const classes = before + 'section' + after;
      if (!classes.includes('py-') && !classes.includes('my-')) {
        return `className="${classes} py-12 md:py-16 lg:py-20"`;
      }
      return match;
    },
    description: 'Add vertical spacing to sections'
  },
  // Add margin between major page elements
  {
    from: /className="([^"]*)min-h-screen([^"]*)"/g,
    to: (match, before, after) => {
      const classes = before + 'min-h-screen' + after;
      // Ensure proper padding for full-screen layouts
      if (!classes.includes('px-') && !classes.includes('p-')) {
        return `className="${classes} px-4 md:px-6"`;
      }
      return match;
    },
    description: 'Add padding to full-screen layouts'
  },
  // Fix card spacing - ensure proper gaps between cards
  {
    from: /className="([^"]*)grid([^"]*)"/g,
    to: (match, before, after) => {
      const classes = before + 'grid' + after;
      // Add gap if not present
      if (!classes.includes('gap-')) {
        return `className="${classes} gap-6 md:gap-8"`;
      }
      return match;
    },
    description: 'Add spacing between grid items'
  },
  // Fix heading spacing
  {
    from: /<(h[1-6])\s+className="([^"]*text-\d+xl[^"]*)"/g,
    to: (match, tag, classes) => {
      // Add margin bottom if not present
      if (!classes.includes('mb-')) {
        return `<${tag} className="${classes} mb-4"`;
      }
      return match;
    },
    description: 'Add margin below headings'
  },
  // Fix button group spacing
  {
    from: /className="([^"]*)flex([^"]*)items-center([^"]*)"/g,
    to: (match, before, middle, after) => {
      const classes = before + 'flex' + middle + 'items-center' + after;
      // Add gap if not present for button groups
      if (!classes.includes('gap-') && !classes.includes('space-')) {
        return `className="${classes} gap-3"`;
      }
      return match;
    },
    description: 'Add spacing between flex items'
  },
  // Ensure cards have proper internal padding
  {
    from: /<Card([^>]*)>\s*<CardHeader/g,
    to: '<Card$1>\n      <CardHeader',
    description: 'Format Card structure'
  }
];

const files = glob.sync('src/**/*.{js,jsx,tsx,ts}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**']
});

let totalModified = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  patterns.forEach(pattern => {
    if (typeof pattern.to === 'function') {
      const newContent = content.replace(pattern.from, pattern.to);
      if (newContent !== content) {
        modified = true;
        content = newContent;
      }
    } else {
      if (pattern.from.test(content)) {
        modified = true;
        content = content.replace(pattern.from, pattern.to);
      }
    }
  });

  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`✓ Updated: ${file}`);
    totalModified++;
  }
});

console.log(`\n✨ Fixed spacing in ${totalModified} files!`);
console.log('\n📋 Changes made:');
console.log('  • Added responsive padding to containers');
console.log('  • Added vertical spacing to sections');
console.log('  • Added padding to full-screen layouts');
console.log('  • Added gaps between grid items');
console.log('  • Added margins to headings');
console.log('  • Added spacing to flex containers');
