const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🎨 Fixing text gradients, backgrounds, and spacing issues...\n');

const patterns = [
  // Fix text gradients - remove bg-clip-text text-transparent and gradient classes
  {
    from: /className="([^"]*)\s*bg-gradient-to-r from-gray-\d+ to-gray-\d+(?:\s+dark:from-gray-\d+ dark:to-gray-\d+)?\s+bg-clip-text text-transparent([^"]*)"/g,
    to: (match, before, after) => {
      // Replace with solid text colors
      const cleanBefore = before.replace(/\s+$/, '');
      const cleanAfter = after.replace(/^\s+/, '');
      return `className="${cleanBefore} text-gray-900 dark:text-white${cleanAfter ? ' ' + cleanAfter : ''}"`;
    },
    description: 'Remove text gradients (bg-clip-text)'
  },
  // Fix blue backgrounds in gradients
  {
    from: /to-blue-\d+/g,
    to: 'to-gray-50',
    description: 'Replace blue gradient stops with gray'
  },
  {
    from: /from-blue-\d+/g,
    to: 'from-gray-50',
    description: 'Replace blue gradient starts with gray'
  },
  {
    from: /via-blue-\d+/g,
    to: 'via-white',
    description: 'Replace blue gradient midpoints with white'
  },
  // Fix complex background gradients - simplify to solid colors
  {
    from: /className="([^"]*)\s*bg-gradient-to-br from-gray-50 via-white to-gray-50([^"]*)"/g,
    to: 'className="$1 bg-gray-50$2"',
    description: 'Simplify light mode background gradients'
  },
  {
    from: /className="([^"]*)\s*bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900([^"]*)"/g,
    to: 'className="$1 bg-gray-900$2"',
    description: 'Simplify dark mode background gradients'
  },
  // Add spacing to container and sections
  {
    from: /className="container-standard"/g,
    to: 'className="container-standard px-6 py-8"',
    description: 'Add padding to containers'
  },
  {
    from: /className="([^"]*\s)?relative overflow-hidden py-16([^"]*)"/g,
    to: 'className="$1relative overflow-hidden py-16 px-6 my-8$2"',
    description: 'Add horizontal padding and margins to sections'
  }
];

const files = glob.sync('src/**/*.{js,jsx,tsx,ts}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**']
});

let totalModified = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  const originalContent = content;

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

console.log(`\n✨ Fixed ${totalModified} files!`);
console.log('\n📋 Changes made:');
console.log('  • Removed text gradients (bg-clip-text text-transparent)');
console.log('  • Replaced with solid colors (text-gray-900 dark:text-white)');
console.log('  • Removed blue backgrounds from gradients');
console.log('  • Simplified complex background gradients');
console.log('  • Added padding to containers and sections');
