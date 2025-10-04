#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon.svg');
const tmpSvg = path.join(publicDir, 'icon.white.svg');

if (!fs.existsSync(svgPath)) {
  console.error('icon.svg not found in public/.');
  process.exit(1);
}

// Create a white variant by replacing currentColor with white
let svg = fs.readFileSync(svgPath, 'utf8');
svg = svg.replace(/currentColor/g, '#ffffff');
fs.writeFileSync(tmpSvg, svg, 'utf8');

async function gen() {
  try {
    // Generate small favicon (16x16) and a larger one for touch
    await sharp(tmpSvg)
      .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }})
      .png({ quality: 90 })
      .toFile(path.join(publicDir, 'favicon.png'));

    await sharp(tmpSvg)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }})
      .png({ quality: 90 })
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));

    console.log('White favicon and apple-touch-icon generated');
    fs.unlinkSync(tmpSvg);
    process.exit(0);
  } catch (err) {
    console.error('Error generating white favicon:', err);
    process.exit(2);
  }
}

gen();
