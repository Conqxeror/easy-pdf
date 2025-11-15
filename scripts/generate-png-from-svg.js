#!/usr/bin/env node
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon.svg');

if (!fs.existsSync(svgPath)) {
  console.error('icon.svg not found in public/. Please ensure icon.svg exists.');
  process.exit(1);
}

const outputs = [
  { name: 'favicon.png', size: 16 },
  { name: 'icon-48.png', size: 48 },
  { name: 'icon-72.png', size: 72 },
  { name: 'icon-96.png', size: 96 },
  { name: 'icon-144.png', size: 144 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

async function gen() {
  try {
    for (const out of outputs) {
      const outPath = path.join(publicDir, out.name);
      console.log(`Generating ${out.name} (${out.size}x${out.size})`);
      await sharp(svgPath)
        .resize(out.size, out.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ quality: 90 })
        .toFile(outPath);
    }
    // Also generate favicon.ico from multiple PNG sizes for cross-browser support
    try {
      const icoSizes = [16, 32, 48, 64];
      const pngBuffers = await Promise.all(
        icoSizes.map((size) =>
          sharp(svgPath)
            .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png({ quality: 90 })
            .toBuffer()
        )
      );

      // Use `to-ico` package to convert an array of PNG buffers to an ICO buffer
      const toIco = require('to-ico');
      const icoBuffer = await toIco(pngBuffers);
      const icoPath = path.join(publicDir, 'favicon.ico');
      await fs.promises.writeFile(icoPath, icoBuffer);
      console.log('Generated favicon.ico');
    } catch (err) {
      console.error('Error generating favicon.ico:', err);
    }
    console.log('All icons generated successfully.');
  } catch (err) {
    console.error('Error generating icons:', err);
    process.exit(2);
  }
}

gen();
