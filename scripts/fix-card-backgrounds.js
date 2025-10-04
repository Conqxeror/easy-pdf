const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🎨 Fixing blue-tinted backgrounds and standardizing spacing...\n');

let totalModified = 0;

// Fix card colors in tool pages - the cards that look blue should use proper card variants
const cardBgPattern = /(bg-gray-800|bg-gray-900)(?!\/)(\s+border\s+border-gray-700)?/g;

const files = glob.sync('src/**/*.{js,jsx,tsx,ts}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**']
});

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  const originalContent = content;

  // Replace hardcoded dark backgrounds with proper card styling
  // Only replace in div/Card elements, not in button hover states or component props
  const newContent = content.replace(
    /<(div|Card)([^>]*?)(bg-gray-800|bg-gray-900)([^>]*?)>/g,
    (match, tag, before, bgClass, after) => {
      // Skip if it's a hover state or already has proper dark:bg
      if (match.includes('hover:bg-') || match.includes('dark:bg-')) {
        return match;
      }
      // Skip if it's part of button/badge component props
      if (before.includes('className="inline') || before.includes('Button')) {
        return match;
      }
      
      modified = true;
      // Replace with proper card styling
      const replacement = bgClass === 'bg-gray-900' 
        ? 'bg-white dark:bg-gray-950'
        : 'bg-gray-50 dark:bg-gray-900';
      
      return `<${tag}${before}${replacement}${after}>`;
    }
  );

  if (newContent !== originalContent) {
    fs.writeFileSync(file, newContent);
    console.log(`✓ Updated: ${file}`);
    totalModified++;
  }
});

console.log(`\n✨ Fixed ${totalModified} files!`);
console.log('\n📋 Changes made:');
console.log('  • Replaced hardcoded bg-gray-800/900 with proper card variants');
console.log('  • bg-gray-900 → bg-white dark:bg-gray-950');
console.log('  • bg-gray-800 → bg-gray-50 dark:bg-gray-900');
console.log('  • Preserved hover states and component internals');
