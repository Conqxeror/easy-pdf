#!/usr/bin/env node
import { execSync } from 'child_process';

try {
  const out = execSync('git ls-files', { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
  const files = out.split('\n').filter(Boolean);

  const map = new Map();
  for (const f of files) {
    const key = f.toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(f);
  }

  const collisions = [];
  for (const [, arr] of map) {
    const unique = Array.from(new Set(arr));
    if (unique.length > 1) collisions.push(unique);
  }

  if (collisions.length > 0) {
    console.error('Filename case collisions detected (these files only differ by case):');
    for (const group of collisions) {
      console.error('  - ' + group.join('\n    '));
      console.error('');
    }
    console.error('Please unify the filename casing (use git mv to perform case-only renames).');
    process.exit(2);
  }

  console.log('No filename case collisions found.');
  process.exit(0);
} catch (err) {
  console.error('Failed to run filename collision check:', err.message);
  process.exit(3);
}
