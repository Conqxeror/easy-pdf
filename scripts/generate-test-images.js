const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const fixturesDir = path.join(__dirname, '../tests/fixtures');

if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

try {
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext('2d');

  // Draw red background
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 400, 400);

  // Draw some text
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.fillText('Test Image', 50, 200);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(fixturesDir, 'sample.png'), buffer);
  console.log('Generated tests/fixtures/sample.png');

  // For JPG, canvas can also do it
  const jpgBuffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path.join(fixturesDir, 'sample.jpg'), jpgBuffer);
  console.log('Generated tests/fixtures/sample.jpg');
} catch (e) {
  console.error("Canvas generation failed, falling back to base64", e);

  // Fallback
  const jpgBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAAFgAAQAAAAAAAAAAAAAAAAAAAAQBAQAAAAAAAAAAAAAAAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAARAQAAAAAAAAAAAAAAAAAAAAARAAaADhQAgP/2Q==';
  const jpgBuffer = Buffer.from(jpgBase64, 'base64');
  fs.writeFileSync(path.join(fixturesDir, 'sample.jpg'), jpgBuffer);

  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const pngBuffer = Buffer.from(pngBase64, 'base64');
  fs.writeFileSync(path.join(fixturesDir, 'sample.png'), pngBuffer);
}
