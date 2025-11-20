// scripts/fix-dark-bg.js
// Conservative replacement of dark background classes to remove blue tints.
// Replacements:
// - dark:bg-gray-900(/...)? -> dark:bg-black (preserve /opacity)
// - bg-gray-900(/...)? -> bg-black (preserve /opacity)
// - bg-gray-800(/...)? -> bg-gray-950 (preserve /opacity)

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const root = path.resolve(__dirname, '..');
const patterns = [
  'src/**/*.js',
  'src/**/*.jsx',
  'src/**/*.ts',
  'src/**/*.tsx',
  'src/**/*.mjs',
  'src/**/*.cjs',
  'src/**/*.json'
];

const replacements = [
  // dark:bg-gray-900/90 -> dark:bg-black/90
  { from: /dark:bg-gray-900\/(\d{1,3})/g, to: 'dark:bg-black/$1' },
  // dark:bg-gray-900 -> dark:bg-black
  { from: /dark:bg-gray-900/g, to: 'dark:bg-black' },
  // bg-gray-900/xx -> bg-black/xx
  { from: /bg-gray-900\/(\d{1,3})/g, to: 'bg-black/$1' },
  // bg-gray-900 -> bg-black
  { from: /bg-gray-900/g, to: 'bg-black' },
  // bg-gray-800/xx -> bg-gray-950/xx
  { from: /bg-gray-800\/(\d{1,3})/g, to: 'bg-gray-950/$1' },
  // bg-gray-800 -> bg-gray-950
  { from: /bg-gray-800/g, to: 'bg-gray-950' },
  // dark:hover:bg-gray-900/XX -> dark:hover:bg-black/XX
  { from: /dark:hover:bg-gray-900\/(\d{1,3})/g, to: 'dark:hover:bg-black/$1' },
  // dark:hover:bg-gray-900 -> dark:hover:bg-black
  { from: /dark:hover:bg-gray-900/g, to: 'dark:hover:bg-black' },
  // hover:bg-gray-700 -> hover:bg-gray-700 (leave alone - not necessary)
];

let filesChanged = 0;

patterns.forEach((pattern) => {
  const files = glob.sync(path.join(root, pattern), { nodir: true });
  files.forEach((file) => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let original = content;
      replacements.forEach((r) => {
        content = content.replace(r.from, r.to);
      });
      if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        filesChanged += 1;
      }
    } catch (e) {
      console.error('Failed to process', file, e.message);
    }
  });
});

console.log(`Fix script complete. Files changed: ${filesChanged}`);

process.exit(0);
