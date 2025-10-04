const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSvg = path.resolve(__dirname, '..', 'public', 'icon.svg');
const outDir = path.resolve(__dirname, '..', 'public');

async function generate() {
  if (!fs.existsSync(inputSvg)) {
    console.error('Input SVG not found:', inputSvg);
    process.exit(1);
  }

  const sizes = [16, 32, 48, 64, 96, 128, 192, 256, 512];

  try {
    // Generate single favicon.png (32x32)
    await sharp(inputSvg).resize(32, 32).png({quality: 90}).toFile(path.join(outDir, 'favicon.png'));
    console.log('Written favicon.png');

    // Generate icon-192.png and icon-512.png
    await sharp(inputSvg).resize(192, 192).png({quality: 90}).toFile(path.join(outDir, 'icon-192.png'));
    console.log('Written icon-192.png');

    await sharp(inputSvg).resize(512, 512).png({quality: 90}).toFile(path.join(outDir, 'icon-512.png'));
    console.log('Written icon-512.png');

    // Optionally generate multiple sizes (not writing ICO here). You can produce an .ico with a separate tool if needed.
    for (const s of [16, 32, 48, 64, 96, 128]) {
      const name = `icon-${s}.png`;
      await sharp(inputSvg).resize(s, s).png({quality: 90}).toFile(path.join(outDir, name));
      console.log('Written', name);
    }

    console.log('All PNG favicons generated.');
  } catch (err) {
    console.error('Failed to generate favicons:', err);
    process.exit(1);
  }
}

generate();
