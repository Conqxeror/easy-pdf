const fs = require('fs');
const path = require('path');
const toIco = require('to-ico');

const publicDir = path.resolve(__dirname, '..', 'public');
const candidates = [
  'icon-16.png',
  'icon-32.png',
  'icon-48.png',
  'icon-64.png',
  'icon-96.png',
  'icon-128.png'
];

const files = candidates.map(n => path.join(publicDir, n)).filter(f => fs.existsSync(f));

if (files.length === 0) {
  console.error('No PNG source files found to build favicon.ico. Run generate-favicons.js first.');
  process.exit(1);
}

(async () => {
  try {
    const buffers = files.map(f => fs.readFileSync(f));
    const icoBuf = await toIco(buffers);
    const out = path.join(publicDir, 'favicon.ico');
    fs.writeFileSync(out, icoBuf);
    console.log('Written', out);
  } catch (err) {
    console.error('Failed to create favicon.ico:', err);
    process.exit(1);
  }
})();
