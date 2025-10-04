#!/usr/bin/env node

/**
 * Script to convert remaining purple and pink gradients to grayscale
 */

const fs = require('fs');
const glob = require('glob');

const REPLACEMENTS = [
  // Text colors - purple
  { from: /text-purple-300\b/g, to: 'text-gray-300' },
  { from: /text-purple-400\b/g, to: 'text-gray-400' },
  { from: /text-purple-500\b/g, to: 'text-gray-600' },
  { from: /text-purple-600\b/g, to: 'text-gray-700' },
  { from: /dark:text-purple-400\b/g, to: 'dark:text-gray-400' },
  { from: /dark:text-purple-500\b/g, to: 'dark:text-gray-600' },
  
  // Text colors - pink
  { from: /text-pink-300\b/g, to: 'text-gray-300' },
  { from: /text-pink-400\b/g, to: 'text-gray-400' },
  { from: /text-pink-500\b/g, to: 'text-gray-600' },
  
  // Background colors - purple
  { from: /bg-purple-100\b/g, to: 'bg-gray-100' },
  { from: /bg-purple-600\b/g, to: 'bg-gray-700' },
  { from: /bg-purple-900\b/g, to: 'bg-gray-900' },
  { from: /dark:bg-purple-950\/30\b/g, to: 'dark:bg-gray-950/30' },
  
  // Background colors - pink
  { from: /bg-pink-900\b/g, to: 'bg-gray-900' },
  
  // Border colors - purple
  { from: /border-purple-500\b/g, to: 'border-gray-600' },
  { from: /hover:border-purple-500\b/g, to: 'hover:border-gray-600' },
  
  // Purple gradient colors
  { from: /from-purple-500\b/g, to: 'from-gray-600' },
  { from: /to-purple-400\b/g, to: 'to-gray-500' },
  { from: /to-purple-500\b/g, to: 'to-gray-700' },
  { from: /to-purple-600\b/g, to: 'to-gray-800' },
  { from: /to-purple-700\b/g, to: 'to-gray-900' },
  { from: /to-purple-900\/30\b/g, to: 'to-gray-900/30' },
  
  { from: /via-purple-500\b/g, to: 'via-gray-600' },
  { from: /via-purple-600\b/g, to: 'via-gray-700' },
  { from: /via-purple-700\b/g, to: 'via-gray-800' },
  { from: /via-purple-900\b/g, to: 'via-gray-900' },
  
  // Pink gradient colors
  { from: /to-pink-500\b/g, to: 'to-gray-700' },
  { from: /to-pink-600\b/g, to: 'to-gray-800' },
  { from: /to-pink-700\b/g, to: 'to-gray-900' },
  { from: /to-pink-900\b/g, to: 'to-gray-900' },
  
  { from: /via-pink-500\b/g, to: 'via-gray-600' },
  { from: /via-pink-600\b/g, to: 'via-gray-700' },
  
  // Dark mode variants
  { from: /dark:to-purple-400\b/g, to: 'dark:to-gray-500' },
  { from: /dark:to-purple-500\b/g, to: 'dark:to-gray-700' },
  { from: /dark:to-purple-700\b/g, to: 'dark:to-gray-900' },
  
  // Hover states
  { from: /hover:to-purple-700\b/g, to: 'hover:to-gray-900' },
  { from: /hover:to-pink-700\b/g, to: 'hover:to-gray-900' },
  { from: /hover:via-purple-700\b/g, to: 'hover:via-gray-800' },
  
  // Background purple/pink mixtures
  { from: /from-purple-50\b/g, to: 'from-gray-50' },
  { from: /from-blue-50\b/g, to: 'from-gray-50' },
  { from: /to-purple-50\b/g, to: 'to-gray-50' },
  
  // Blue backgrounds in gradients
  { from: /from-blue-900\b/g, to: 'from-gray-900' },
  { from: /from-blue-900\/30\b/g, to: 'from-gray-900/30' },
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    REPLACEMENTS.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🎨 Converting purple/pink gradients to grayscale...\n');
  
  const files = glob.sync('src/**/*.{js,jsx,tsx,ts}', {
    ignore: ['**/node_modules/**', '**/.next/**'],
    nodir: true,
  });
  
  let modifiedCount = 0;
  files.forEach(file => {
    if (processFile(file)) {
      modifiedCount++;
    }
  });
  
  console.log(`\n✨ Conversion complete! Files modified: ${modifiedCount}`);
}

main();
