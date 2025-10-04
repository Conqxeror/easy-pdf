#!/usr/bin/env node

/**
 * Automated script to convert all blue colors to grayscale across the codebase
 * 
 * This script replaces Tailwind blue utility classes with gray equivalents
 * while preserving the rest of the class string.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define the replacement mappings
const COLOR_REPLACEMENTS = [
  // Background colors
  { from: /bg-blue-50\b/g, to: 'bg-gray-50' },
  { from: /bg-blue-100\b/g, to: 'bg-gray-100' },
  { from: /bg-blue-200\b/g, to: 'bg-gray-200' },
  { from: /bg-blue-300\b/g, to: 'bg-gray-300' },
  { from: /bg-blue-400\b/g, to: 'bg-gray-400' },
  { from: /bg-blue-500\b/g, to: 'bg-gray-600' }, // Darker gray for primary blue
  { from: /bg-blue-600\b/g, to: 'bg-gray-700' }, // Darker gray for primary blue
  { from: /bg-blue-700\b/g, to: 'bg-gray-800' },
  { from: /bg-blue-800\b/g, to: 'bg-gray-900' },
  { from: /bg-blue-900\b/g, to: 'bg-gray-900' },
  { from: /bg-blue-950\b/g, to: 'bg-gray-950' },
  
  // Text colors
  { from: /text-blue-50\b/g, to: 'text-gray-50' },
  { from: /text-blue-100\b/g, to: 'text-gray-100' },
  { from: /text-blue-200\b/g, to: 'text-gray-200' },
  { from: /text-blue-300\b/g, to: 'text-gray-300' },
  { from: /text-blue-400\b/g, to: 'text-gray-400' },
  { from: /text-blue-500\b/g, to: 'text-gray-600' },
  { from: /text-blue-600\b/g, to: 'text-gray-700' },
  { from: /text-blue-700\b/g, to: 'text-gray-800' },
  { from: /text-blue-800\b/g, to: 'text-gray-900' },
  { from: /text-blue-900\b/g, to: 'text-gray-900' },
  
  // Border colors
  { from: /border-blue-50\b/g, to: 'border-gray-50' },
  { from: /border-blue-100\b/g, to: 'border-gray-100' },
  { from: /border-blue-200\b/g, to: 'border-gray-200' },
  { from: /border-blue-300\b/g, to: 'border-gray-300' },
  { from: /border-blue-400\b/g, to: 'border-gray-400' },
  { from: /border-blue-500\b/g, to: 'border-gray-600' },
  { from: /border-blue-600\b/g, to: 'border-gray-700' },
  { from: /border-blue-700\b/g, to: 'border-gray-800' },
  { from: /border-blue-800\b/g, to: 'border-gray-900' },
  { from: /border-blue-900\b/g, to: 'border-gray-900' },
  
  // Hover states - background
  { from: /hover:bg-blue-50\b/g, to: 'hover:bg-gray-50' },
  { from: /hover:bg-blue-100\b/g, to: 'hover:bg-gray-100' },
  { from: /hover:bg-blue-200\b/g, to: 'hover:bg-gray-200' },
  { from: /hover:bg-blue-300\b/g, to: 'hover:bg-gray-300' },
  { from: /hover:bg-blue-400\b/g, to: 'hover:bg-gray-400' },
  { from: /hover:bg-blue-500\b/g, to: 'hover:bg-gray-600' },
  { from: /hover:bg-blue-600\b/g, to: 'hover:bg-gray-700' },
  { from: /hover:bg-blue-700\b/g, to: 'hover:bg-gray-800' },
  { from: /hover:bg-blue-800\b/g, to: 'hover:bg-gray-900' },
  { from: /hover:bg-blue-900\b/g, to: 'hover:bg-gray-900' },
  
  // Hover states - text
  { from: /hover:text-blue-300\b/g, to: 'hover:text-gray-300' },
  { from: /hover:text-blue-400\b/g, to: 'hover:text-gray-400' },
  { from: /hover:text-blue-500\b/g, to: 'hover:text-gray-600' },
  { from: /hover:text-blue-600\b/g, to: 'hover:text-gray-700' },
  { from: /hover:text-blue-700\b/g, to: 'hover:text-gray-800' },
  
  // Hover states - border
  { from: /hover:border-blue-400\b/g, to: 'hover:border-gray-400' },
  { from: /hover:border-blue-500\b/g, to: 'hover:border-gray-600' },
  { from: /hover:border-blue-600\b/g, to: 'hover:border-gray-700' },
  
  // Dark mode variants - background
  { from: /dark:bg-blue-50\b/g, to: 'dark:bg-gray-50' },
  { from: /dark:bg-blue-100\b/g, to: 'dark:bg-gray-100' },
  { from: /dark:bg-blue-200\b/g, to: 'dark:bg-gray-200' },
  { from: /dark:bg-blue-400\b/g, to: 'dark:bg-gray-400' },
  { from: /dark:bg-blue-500\b/g, to: 'dark:bg-gray-600' },
  { from: /dark:bg-blue-600\b/g, to: 'dark:bg-gray-700' },
  { from: /dark:bg-blue-700\b/g, to: 'dark:bg-gray-800' },
  { from: /dark:bg-blue-800\b/g, to: 'dark:bg-gray-900' },
  { from: /dark:bg-blue-900\b/g, to: 'dark:bg-gray-900' },
  { from: /dark:bg-blue-950\b/g, to: 'dark:bg-gray-950' },
  { from: /dark:bg-blue-950\/30\b/g, to: 'dark:bg-gray-950/30' },
  
  // Dark mode variants - text
  { from: /dark:text-blue-100\b/g, to: 'dark:text-gray-100' },
  { from: /dark:text-blue-200\b/g, to: 'dark:text-gray-200' },
  { from: /dark:text-blue-300\b/g, to: 'dark:text-gray-300' },
  { from: /dark:text-blue-400\b/g, to: 'dark:text-gray-400' },
  { from: /dark:text-blue-500\b/g, to: 'dark:text-gray-600' },
  { from: /dark:text-blue-600\b/g, to: 'dark:text-gray-700' },
  
  // Dark mode variants - border
  { from: /dark:border-blue-500\b/g, to: 'dark:border-gray-600' },
  { from: /dark:border-blue-800\b/g, to: 'dark:border-gray-900' },
  
  // Dark hover states
  { from: /dark:hover:bg-blue-600\b/g, to: 'dark:hover:bg-gray-700' },
  { from: /dark:hover:bg-blue-800\b/g, to: 'dark:hover:bg-gray-900' },
  { from: /dark:hover:bg-blue-900\/30\b/g, to: 'dark:hover:bg-gray-900/30' },
  { from: /dark:hover:bg-blue-950\/30\b/g, to: 'dark:hover:bg-gray-950/30' },
  { from: /dark:hover:text-blue-300\b/g, to: 'dark:hover:text-gray-300' },
  { from: /dark:hover:text-blue-400\b/g, to: 'dark:hover:text-gray-400' },
  { from: /dark:hover:border-blue-500\b/g, to: 'dark:hover:border-gray-600' },
  
  // Gradients - from
  { from: /from-blue-400\b/g, to: 'from-gray-400' },
  { from: /from-blue-500\b/g, to: 'from-gray-600' },
  { from: /from-blue-600\b/g, to: 'from-gray-700' },
  { from: /from-blue-700\b/g, to: 'from-gray-800' },
  
  // Gradients - to
  { from: /to-blue-500\b/g, to: 'to-gray-600' },
  { from: /to-blue-600\b/g, to: 'to-gray-700' },
  { from: /to-blue-700\b/g, to: 'to-gray-800' },
  { from: /to-blue-800\b/g, to: 'to-gray-900' },
  
  // Gradients - via
  { from: /via-blue-500\b/g, to: 'via-gray-600' },
  { from: /via-blue-600\b/g, to: 'via-gray-700' },
  
  // Gradient hover states
  { from: /hover:from-blue-500\b/g, to: 'hover:from-gray-600' },
  { from: /hover:from-blue-600\b/g, to: 'hover:from-gray-700' },
  { from: /hover:from-blue-700\b/g, to: 'hover:from-gray-800' },
  { from: /hover:to-blue-600\b/g, to: 'hover:to-gray-700' },
  { from: /hover:to-blue-700\b/g, to: 'hover:to-gray-800' },
  { from: /hover:to-blue-800\b/g, to: 'hover:to-gray-900' },
  { from: /hover:via-blue-500\b/g, to: 'hover:via-gray-600' },
  { from: /hover:via-blue-700\b/g, to: 'hover:via-gray-800' },
  
  // Dark mode gradients
  { from: /dark:from-blue-400\b/g, to: 'dark:from-gray-400' },
  { from: /dark:from-blue-500\b/g, to: 'dark:from-gray-600' },
  { from: /dark:from-blue-600\b/g, to: 'dark:from-gray-700' },
  { from: /dark:to-blue-400\b/g, to: 'dark:to-gray-400' },
  { from: /dark:to-blue-500\b/g, to: 'dark:to-gray-600' },
  { from: /dark:to-blue-600\b/g, to: 'dark:to-gray-700' },
  { from: /dark:to-blue-700\b/g, to: 'dark:to-gray-800' },
  { from: /dark:hover:from-blue-500\b/g, to: 'dark:hover:from-gray-600' },
  { from: /dark:hover:to-blue-600\b/g, to: 'dark:hover:to-gray-700' },
  
  // Focus and ring colors
  { from: /focus:border-blue-500\b/g, to: 'focus:border-gray-600' },
  { from: /focus:ring-blue-500\b/g, to: 'focus:ring-gray-600' },
  { from: /focus-visible:ring-blue-500\b/g, to: 'focus-visible:ring-gray-600' },
  
  // Shadow colors (less common but included)
  { from: /shadow-blue-500\/20\b/g, to: 'shadow-gray-500/20' },
  
  // Selection colors
  { from: /selection:bg-blue-500\b/g, to: 'selection:bg-gray-700' },
  
  // SVG and special selectors
  { from: /\[&>svg\]:text-blue-400\b/g, to: '[&>svg]:text-gray-400' },
  { from: /\[&>svg\]:text-blue-500\b/g, to: '[&>svg]:text-gray-600' },
  { from: /dark:\[&>svg\]:text-blue-400\b/g, to: 'dark:[&>svg]:text-gray-400' },
  
  // Progress bar and webkit specific
  { from: /\[&::-webkit-progress-value\]:bg-blue-500\b/g, to: '[&::-webkit-progress-value]:bg-gray-600' },
  { from: /\[&::-webkit-progress-value\]:bg-blue-600\b/g, to: '[&::-webkit-progress-value]:bg-gray-700' },
  
  // Anchor specific
  { from: /\[a&\]:hover:bg-blue-200\b/g, to: '[a&]:hover:bg-gray-200' },
  { from: /\[a&\]:hover:bg-blue-600\b/g, to: '[a&]:hover:bg-gray-700' },
  { from: /\[a&\]:hover:from-blue-600\b/g, to: '[a&]:hover:from-gray-700' },
  { from: /dark:\[a&\]:hover:bg-blue-900\/30\b/g, to: 'dark:[a&]:hover:bg-gray-900/30' },
  
  // Data attribute selectors
  { from: /peer-data-\[state=checked\]:border-blue-400\b/g, to: 'peer-data-[state=checked]:border-gray-500' },
  { from: /\[&:has\(\[data-state=checked\]\)\]:border-blue-400\b/g, to: '[&:has([data-state=checked])]:border-gray-500' },
  { from: /\*:data-\[slot=alert-description\]:text-blue-200\b/g, to: '*:data-[slot=alert-description]:text-gray-200' },
  { from: /\*:data-\[slot=alert-description\]:text-blue-800\b/g, to: '*:data-[slot=alert-description]:text-gray-800' },
];

// Files and directories to process
const INCLUDE_PATTERNS = [
  'src/**/*.{js,jsx,tsx,ts}',
  'src/**/*.css',
];

const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply all replacements
    COLOR_REPLACEMENTS.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });
    
    // Write back if modified
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
  console.log('🎨 Converting blue colors to grayscale...\n');
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  INCLUDE_PATTERNS.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: EXCLUDE_PATTERNS,
      nodir: true,
    });
    
    files.forEach(file => {
      totalFiles++;
      if (processFile(file)) {
        modifiedFiles++;
      }
    });
  });
  
  console.log(`\n✨ Conversion complete!`);
  console.log(`   Total files scanned: ${totalFiles}`);
  console.log(`   Files modified: ${modifiedFiles}`);
}

// Run the script
main();
