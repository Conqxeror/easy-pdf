#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const toIco = require('to-ico');

const publicDir = path.join(__dirname, '..', 'public');
const inputs = [
  path.join(publicDir, 'icon-48.png'),
  path.join(publicDir, 'icon-72.png'),
  path.join(publicDir, 'icon-96.png'),
  path.join(publicDir, 'icon-144.png'),
  path.join(publicDir, 'icon-192.png')
];
const outPath = path.join(publicDir, 'favicon.ico');

(async function gen() {
  try {
    const existing = inputs.filter(p => fs.existsSync(p));
    if (existing.length === 0) {
      console.error('No input PNGs found to generate favicon.ico. Run the PNG generation first.');
      process.exit(1);
    }

    const buffers = existing.map(p => fs.readFileSync(p));
    const icoBuffer = await toIco(buffers);
    fs.writeFileSync(outPath, icoBuffer);
    console.log('favicon.ico generated at', outPath);
  } catch (err) {
    console.error('Error generating favicon.ico:', err);
    process.exit(2);
  }
})();
