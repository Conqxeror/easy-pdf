#!/usr/bin/env node

/**
 * Script to convert all rounded corners to sharp edges (Nike style)
 * Removes all rounded-* classes to make components boxy and sharp
 */

const fs = require('fs');
const glob = require('glob');

const REPLACEMENTS = [
  // Rounded classes - remove entirely or replace with empty string
  { from: /\s+rounded-full\b/g, to: '' },
  { from: /\s+rounded-3xl\b/g, to: '' },
  { from: /\s+rounded-2xl\b/g, to: '' },
  { from: /\s+rounded-xl\b/g, to: '' },
  { from: /\s+rounded-lg\b/g, to: '' },
  { from: /\s+rounded-md\b/g, to: '' },
  { from: /\s+rounded-sm\b/g, to: '' },
  { from: /\s+rounded\b/g, to: '' },
  
  // Hover rounded
  { from: /\s+hover:rounded-lg\b/g, to: '' },
  { from: /\s+hover:rounded-md\b/g, to: '' },
  { from: /\s+hover:rounded-xl\b/g, to: '' },
  
  // Dark mode rounded
  { from: /\s+dark:rounded-lg\b/g, to: '' },
  { from: /\s+dark:rounded-md\b/g, to: '' },
  { from: /\s+dark:rounded-xl\b/g, to: '' },
  
  // Group rounded
  { from: /\s+group-hover:rounded-lg\b/g, to: '' },
  { from: /\s+group-hover:rounded-md\b/g, to: '' },
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let originalContent = content;
    
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
  console.log('📐 Converting all rounded corners to sharp edges (Nike style)...\n');
  
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
  
  console.log(`\n✨ Sharp edges conversion complete! Files modified: ${modifiedCount}`);
}

main();
